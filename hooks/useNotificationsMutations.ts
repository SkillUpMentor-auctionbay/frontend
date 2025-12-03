import { createNotificationQueryKey } from '@/constants/notifications';
import { useAuth } from '@/contexts/auth-context';
import { notificationsAPI } from '@/services/api';
import {
  createEmptyNotificationsCache,
  showNotificationsClearedToast,
  showNotificationsErrorToast,
} from '@/utils/notificationUtils';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useClearAllNotificationsMutation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const mutation = useMutation({
    mutationFn: () => notificationsAPI.clearAllNotifications(),
    onSuccess: () => {
      queryClient.setQueryData(
        createNotificationQueryKey(user?.id || ''),
        createEmptyNotificationsCache(),
      );

      queryClient.invalidateQueries({
        queryKey: createNotificationQueryKey(user?.id || ''),
      });

      showNotificationsClearedToast();
    },
    onError: () => {
      showNotificationsErrorToast();
    },
  });

  return {
    clearAllNotifications: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
};
