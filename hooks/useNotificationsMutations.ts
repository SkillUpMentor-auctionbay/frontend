import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsAPI } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useClearAllNotificationsMutation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const mutation = useMutation({
    mutationFn: async () => {
      console.log('🗑️ Clearing all notifications for user:', user?.id);
      const result = await notificationsAPI.clearAllNotifications();
      console.log('✅ Clear notifications API response:', result);
      return result;
    },
    onSuccess: () => {
      console.log('🎉 Clear notifications successful, updating cache for user:', user?.id);

      // Clear the cache immediately
      queryClient.setQueryData(['notifications', user?.id], {
        notifications: [],
        total: 0
      });

      // Invalidate all notification queries for this user
      queryClient.invalidateQueries({
        queryKey: ['notifications', user?.id]
      });

      // Show success toast
      toast.success('Notifications cleared', {
        description: 'All notifications have been cleared successfully'
      });
    },
    onError: (error) => {
      console.error("❌ Failed to clear notifications:", error);
      toast.error('Failed to clear notifications', {
        description: 'Please try again later'
      });
    },
  });

  return {
    clearAllNotifications: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
};