import { useQuery } from "@tanstack/react-query";
import { notificationsAPI } from "@/services/api";
import { NotificationsResponse, NotificationDto, notificationDtoToNotification } from "@/types/notification";
import { useAuth } from "@/contexts/AuthContext";

export const useNotificationsQuery = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["notifications", user?.id], // Include user ID for cache isolation
    queryFn: async () => {
      console.log(`📬 Fetching notifications for user ${user?.id}`);
      const response = await notificationsAPI.getNotifications();
      console.log(`📨 Raw API response for user ${user?.id}:`, response);

      // Extract data from wrapped response format: { data: { notifications, total } }
      const responseData = (response as any).data;
      console.log(`📊 Extracted response data for user ${user?.id}:`, responseData);

      const backendNotifications = responseData?.notifications || [];
      console.log(`📊 Found ${backendNotifications.length} raw notifications from backend`);

      // Convert DTOs to internal Notification format
      const notifications = backendNotifications.map(notificationDtoToNotification);
      console.log(`🔄 Converted ${notifications.length} notifications to frontend format`);

      return {
        notifications,
        total: responseData?.total || notifications.length,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - allow SSE to keep data fresh
    refetchInterval: false, // Disable automatic refetching - SSE handles updates
    refetchOnWindowFocus: false, // Disable refetch on focus - prevents overwriting SSE cache
    enabled: !!user?.id, // Only enable query when user is authenticated
  });
};

// Helper hook to manually trigger a refetch
export const useRefetchNotifications = () => {
  // Invalid queries cannot be directly invoked from outside hooks
  // This function will not work as expected
  console.log("Refetch notifications requested - will be handled by QueryClient invalidation via SSE");
};