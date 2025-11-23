import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { NotificationDto, NotificationsResponse } from "@/types/notification";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";


interface ConnectionConfig {
  maxReconnectAttempts: number;
  baseReconnectDelay: number;
  maxReconnectDelay: number;
}

const CONNECTION_CONFIG: ConnectionConfig = {
  maxReconnectAttempts: 3,
  baseReconnectDelay: 1000,
  maxReconnectDelay: 30000,
};

const getNotificationType = (notification: NotificationDto): 'auction_won' | 'outbid' => {
  return notification.price !== null ? 'auction_won' : 'outbid';
};

const getEventSource = () => {
  if (typeof window !== 'undefined' && window.EventSource) {
    return window.EventSource;
  }
  return null;
};

export const useNotificationsStream = () => {
  const eventSourceRef = useRef<EventSource | null>(null);
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const connectionStatusRef = useRef<string>('disconnected');
  const reconnectAttemptsRef = useRef<number>(0);
  const hasShownConnectionError = useRef<boolean>(false);

  const getSSEUrl = useCallback((): string | null => {
    const token = localStorage.getItem('token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!token || !apiUrl) {
      return null;
    }

    return `${apiUrl}/api/v1/notifications/stream?token=${encodeURIComponent(token)}`;
  }, []);

  const showConnectionError = useCallback((message: string) => {
    if (!hasShownConnectionError.current) {
      toast.error('Live Notifications', {
        description: message,
        duration: 5000,
      });
      hasShownConnectionError.current = true;
    }
  }, []);

  const showReconnectionSuccess = useCallback(() => {
    toast.success('Live Notifications', {
      description: 'Real-time notifications reconnected successfully.',
      duration: 3000,
    });
    hasShownConnectionError.current = false;
  }, []);

  const getReconnectDelay = useCallback((attempt: number): number => {
    return Math.min(
      CONNECTION_CONFIG.baseReconnectDelay * Math.pow(2, attempt - 1),
      CONNECTION_CONFIG.maxReconnectDelay
    );
  }, []);

  const addNotificationToCache = useCallback((notification: NotificationDto) => {
    queryClient.setQueryData(['notifications', user?.id], (oldData: NotificationsResponse | undefined) => {
      if (!oldData) {
        return {
          notifications: [notification],
          total: 1
        };
      }

      return {
        ...oldData,
        notifications: [notification, ...oldData.notifications],
        total: oldData.total + 1
      };
    });

    const notificationType = getNotificationType(notification);
    const notificationTitle = notificationType === 'auction_won' ? 'Auction Won!' : 'Outbid';
    const notificationMessage = notificationType === 'auction_won'
      ? `Congratulations! You won the auction for ${notification.auction?.title || 'an item'}`
      : `You've been outbid on ${notification.auction?.title || 'an item'}`;

    toast(notificationTitle, {
      description: notificationMessage,
      action: notification.auction?.id ? {
        label: 'View',
        onClick: () => {
          window.location.href = `/auctions/${notification.auction.id}`;
        }
      } : undefined,
    });
  }, [queryClient, user]);

  const handleMessage = useCallback((event: MessageEvent) => {
    const parsedData = JSON.parse(event.data);

    let notification: NotificationDto;
    let targetUserId: string | undefined;

    if (parsedData.data?.userId && parsedData.data.notification) {
      notification = parsedData.data.notification;
      targetUserId = parsedData.data.userId;
    } else if (parsedData.userId && parsedData.notification) {
      notification = parsedData.notification;
      targetUserId = parsedData.userId;
    } else if (parsedData.auction) {
      notification = parsedData;
      targetUserId = user?.id;
    } else {
      return;
    }

    if (targetUserId && targetUserId === user?.id) {
      addNotificationToCache(notification);
    }
    
  }, [addNotificationToCache, user]);

  const handleOpen = useCallback(() => {
    connectionStatusRef.current = 'connected';
    reconnectAttemptsRef.current = 0;

    if (hasShownConnectionError.current) {
      showReconnectionSuccess();
    }
  }, [showReconnectionSuccess]);

  const handleError = useCallback(() => {
    connectionStatusRef.current = 'error';

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    if (reconnectAttemptsRef.current < CONNECTION_CONFIG.maxReconnectAttempts) {
      reconnectAttemptsRef.current++;

      if (reconnectAttemptsRef.current > 2) {
        showConnectionError('Connection lost. Attempting to reconnect...');
      }

      const delay = getReconnectDelay(reconnectAttemptsRef.current);
      setTimeout(connect, delay);
    } else {
      showConnectionError(
        'Unable to connect to notification service after multiple attempts. Real-time updates are disabled.'
      );
    }
  }, [getReconnectDelay, showConnectionError]);

  const connect = useCallback(() => {
    if (typeof window === 'undefined' || !isAuthenticated || !user?.id) {
      return;
    }

    const sseUrl = getSSEUrl();
    if (!sseUrl) {
      showConnectionError('Notification service is unavailable. Real-time updates are disabled.');
      return;
    }

    const EventSourceClass = getEventSource();
    if (!EventSourceClass) {
      return;
    }

    connectionStatusRef.current = 'connecting';

    try {
      const eventSource = new EventSourceClass(sseUrl);
      eventSourceRef.current = eventSource;

      eventSource.onmessage = handleMessage;
      eventSource.onopen = handleOpen;
      eventSource.onerror = handleError;

    } catch (error) {
      connectionStatusRef.current = 'error';
      showConnectionError('Failed to connect to notification service. Real-time updates are disabled.');
    }
  }, [
    isAuthenticated,
    user?.id,
    getSSEUrl,
    showConnectionError,
    handleMessage,
    handleOpen,
    handleError,
  ]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    connectionStatusRef.current = 'disconnected';
    reconnectAttemptsRef.current = 0;
  }, []);

  const reconnect = useCallback(() => {
    hasShownConnectionError.current = false;
    reconnectAttemptsRef.current = 0;
    disconnect();
    connect();
  }, [disconnect, connect]);

  useEffect(() => {
    if (authLoading || !isAuthenticated || !user?.id) {
      return;
    }

    connect();

    return disconnect;
  }, [connect, disconnect, authLoading, isAuthenticated, user?.id]);

  useEffect(() => {
    return disconnect;
  }, [disconnect]);

  return {
    isConnected: typeof window !== 'undefined' && eventSourceRef.current?.readyState === 1,
    connectionStatus: connectionStatusRef.current,
    reconnect,
  };
};