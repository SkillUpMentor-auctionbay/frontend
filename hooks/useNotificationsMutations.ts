import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsAPI } from "@/services/api";
import { useAuth } from "@/contexts/auth-context";
import { showNotificationsClearedToast, showNotificationsErrorToast, createEmptyNotificationsCache } from "@/utils/notificationUtils";
import { createNotificationQueryKey } from "@/constants/notifications";

export const useClearAllNotificationsMutation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const mutation = useMutation({
    mutationFn: () => notificationsAPI.clearAllNotifications(),
    onSuccess: () => {
      queryClient.setQueryData(
        createNotificationQueryKey(user?.id || ''),
        createEmptyNotificationsCache()
      );

      queryClient.invalidateQueries({
        queryKey: createNotificationQueryKey(user?.id || '')
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