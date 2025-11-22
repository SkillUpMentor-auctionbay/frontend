import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { NotificationDto, NotificationsResponse, notificationDtoToNotification } from "@/types/notification";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface SSENotificationEvent {
  userId: string;
  notification: NotificationDto;
}

// Helper function to determine notification type based on price
const getNotificationType = (notification: NotificationDto): 'auction_won' | 'outbid' => {
  return notification.price !== null ? 'auction_won' : 'outbid';
};

// Safe EventSource reference for SSR
const getEventSource = () => {
  if (typeof window !== 'undefined' && window.EventSource) {
    return window.EventSource;
  }
  return null;
};

export const useNotificationsStream = () => {
  // Only initialize EventSource on client-side
  const eventSourceRef = useRef<any>(null);
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const connectionStatusRef = useRef<string>('disconnected');

  console.log('🔍 useNotificationsStream hook - user:', user, 'user?.id:', user?.id, 'isAuthenticated:', isAuthenticated, 'authLoading:', authLoading);

  // Additional debugging
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  console.log('🔍 Token check:', {
    hasWindow: typeof window !== 'undefined',
    hasToken: !!token,
    tokenPreview: token ? token.substring(0, 20) + '...' : 'none',
    isAuthenticated,
    authLoading
  });

  const addNotificationToCache = useCallback((notification: NotificationDto) => {
    console.log('🔔 SSE addNotificationToCache called:', {
      notificationId: notification.id,
      currentUserId: user?.id,
      notificationUserId: 'N/A (not in DTO)',
      auctionTitle: notification.auction?.title,
      price: notification.price,
    });

    // Update React Query cache with new notification (include user ID in query key)
    queryClient.setQueryData(['notifications', user?.id], (oldData: NotificationsResponse | undefined) => {
      console.log('🔔 Updating React Query cache for user:', user?.id);

      if (!oldData) {
        console.log('🔔 No old data found, creating new cache entry');
        return {
          notifications: [notification],
          total: 1
        };
      }

      console.log('🔔 Adding notification to existing cache, new count:', oldData.notifications.length + 1);
      return {
        ...oldData,
        notifications: [notification, ...oldData.notifications],
        total: oldData.total + 1
      };
    });

    // Show toast notification based on notification type (determined by price)
    const notificationType = getNotificationType(notification);
    const notificationTitle = notificationType === 'auction_won'
      ? '🎉 Auction Won!'
      : '💰 Outbid';

    const notificationMessage = notificationType === 'auction_won'
      ? `Congratulations! You won the auction for ${notification.auction?.title || 'an item'}`
      : `You've been outbid on ${notification.auction?.title || 'an item'}`;

    console.log('🔔 About to show toast:', {
      notificationTitle,
      notificationMessage,
      notificationType
    });

    toast(notificationTitle, {
      description: notificationMessage,
      action: {
        label: 'View',
        onClick: () => {
          // Navigate to the auction page
          if (notification.auction?.id) {
            window.location.href = `/auctions/${notification.auction.id}`;
          }
        }
      }
    });

    console.log('🔔 Toast shown successfully');
  }, [queryClient, user]); // Add user dependency to avoid stale closure

  const connect = useCallback(() => {
    // Only run on client-side
    if (typeof window === 'undefined') {
      console.log('🌐 SSE connection skipped during SSR');
      return;
    }

    // Get fresh user data to avoid stale closure issues
    console.log(`🔗 Attempting SSE connection for user: ${user?.id}`);
    console.log('🔍 Full user object:', user);

    // Get JWT token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('❌ No JWT token found in localStorage - SSE connection aborted');
      return;
    }

    console.log('✅ JWT token found for SSE connection');
    console.log('🔍 Token preview:', token.substring(0, 20) + '...');

    // Validate API URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      console.log('❌ No API URL configured - SSE connection aborted');
      return;
    }

    console.log(`✅ API URL configured: ${apiUrl}`);

    // Create EventSource connection with token as query param
    const EventSourceClass = getEventSource();
    if (!EventSourceClass) {
      console.log('❌ EventSource not supported in this environment - SSE connection aborted');
      return;
    }

    let eventSource: any = null;
    const sseUrl = `${apiUrl}/api/v1/notifications/stream?token=${encodeURIComponent(token)}`;
    console.log(`🚀 Creating EventSource connection to: ${sseUrl}`);

    try {
      eventSource = new EventSourceClass(sseUrl);
      eventSourceRef.current = eventSource;
      connectionStatusRef.current = 'connecting';
    } catch (error) {
      // console.error('❌ Failed to create EventSource:', error);
      connectionStatusRef.current = 'error';
      return;
    }

    if (!eventSource) {
      console.log('❌ EventSource creation failed - SSE connection aborted');
      return;
    }

    eventSource.onmessage = (event: any) => {
      console.log('📨 SSE onmessage triggered, event data:', event.data);
      try {
        const parsedData = JSON.parse(event.data);
        console.log(`🔔 SSE notification received:`, parsedData);

        // Handle different event formats:
        // 1. Direct notification (from controller): {auction, price, createdAt}
        // 2. Wrapped notification (from SSE service): {userId, notification}
        let notification: NotificationDto;
        let targetUserId: string | undefined;

        if (parsedData.userId && parsedData.notification) {
          // Format from SSE service: { userId, notification }
          notification = parsedData.notification;
          targetUserId = parsedData.userId;
        } else if (parsedData.auction) {
          // Format from controller: direct notification object
          notification = parsedData;
          targetUserId = user?.id; // Assume it's for current user
        } else {
          console.warn('❓ Unknown SSE event format:', parsedData);
          return;
        }

        // Only process notifications for the current user
        if (targetUserId && targetUserId === user?.id) {
          console.log(`✅ Processing notification for current user ${user?.id}:`, notification);
          addNotificationToCache(notification);
        } else {
          console.log(`⏭️ Ignoring notification for different user ${targetUserId} (current user: ${user?.id})`);
        }
      } catch (error) {
        console.error('❌ Failed to parse SSE notification:', error);
        console.error('Raw event data:', event.data);
      }
    };

    eventSource.onopen = () => {
      console.log('✅ SSE connection established for notifications');
      connectionStatusRef.current = 'connected';
      console.log('🌐 SSE URL:', sseUrl);
      console.log('🌐 EventSource readyState:', eventSource.readyState); // 0=CONNECTING, 1=OPEN, 2=CLOSED
      console.log('👤 Current authenticated user:', user?.id);

      // Log that we're listening for events
      console.log('👂 SSE connection ready - listening for notification events...');
    };

    eventSource.onerror = (error: any) => {
      console.error('❌ SSE connection error:', error);
      console.log(`SSE readyState: ${eventSource?.readyState} (0=CONNECTING, 1=OPEN, 2=CLOSED)`);
      console.log('🔗 SSE URL:', sseUrl);
      console.log('👤 Attempted connection for user:', user?.id);
      console.log('🔍 Full error object:', error);
      console.log('🔍 EventSource object:', eventSource);
      connectionStatusRef.current = 'error';

      // Attempt to reconnect after 5 seconds only if connection was closed
      setTimeout(() => {
        if (typeof window !== 'undefined' && eventSourceRef.current?.readyState === 2) { // EventSource.CLOSED = 2
          console.log('🔄 Attempting SSE reconnection...');
          connectionStatusRef.current = 'reconnecting';
          connect();
        }
      }, 5000);
    };

    return () => {
      console.log('🔌 Closing SSE connection');
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [queryClient, addNotificationToCache, user]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  // Auto-connect when component mounts (only on client-side and authenticated)
  useEffect(() => {
    console.log('🔍 useEffect triggered - user:', user, 'user?.id:', user?.id, 'typeof window:', typeof window !== 'undefined', 'authLoading:', authLoading);

    // Only connect on client-side and when user is authenticated and not loading
    if (typeof window === 'undefined' || authLoading || !isAuthenticated || !user?.id) {
      console.log('🚫 SSE connection skipped', {
        hasWindow: typeof window !== 'undefined',
        authLoading,
        isAuthenticated,
        hasUser: !!user,
        hasUserId: !!user?.id
      });
      return;
    }

    console.log('🔌 Auto-connecting SSE for user:', user?.id);
    const cleanup = connect();
    return cleanup;
  }, [connect, user?.id, isAuthenticated, authLoading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return {
    isConnected: typeof window !== 'undefined' && eventSourceRef.current?.readyState === 1, // EventSource.OPEN = 1
    connectionStatus: connectionStatusRef.current,
    reconnect: () => {
      console.log('🔄 Manual SSE reconnection triggered');
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      connect();
    }
  };
};