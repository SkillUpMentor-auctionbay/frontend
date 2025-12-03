import { useAuth } from '@/contexts/auth-context';
import { notificationsAPI } from '@/services/api';
import { notificationDtoToNotification } from '@/types/notification';
import { useQuery } from '@tanstack/react-query';

export const useNotificationsQuery = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      const response = await notificationsAPI.getNotifications();

      const responseData = (response as any).data;

      const backendNotifications = responseData?.notifications || [];

      const notifications = backendNotifications.map(
        notificationDtoToNotification,
      );

      return {
        notifications,
        total: responseData?.total || notifications.length,
      };
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    enabled: !!user?.id,
  });
};

export const useRefetchNotifications = () => {};
