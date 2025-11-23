import { toast } from "sonner";
import { NOTIFICATION_CONSTANTS } from "@/constants/notifications";


export function showSuccessToast(message: { title: string; description: string }) {
  toast.success(message.title, {
    description: message.description,
  });
}


export function showErrorToast(message: { title: string; description: string }) {
  toast.error(message.title, {
    description: message.description,
  });
}


export function createEmptyNotificationsCache() {
  return {
    notifications: [],
    total: 0,
  } as const;
}

export const showNotificationsClearedToast = () => {
  showSuccessToast(NOTIFICATION_CONSTANTS.TOAST_MESSAGES.CLEAR_SUCCESS);
};

export const showNotificationsErrorToast = () => {
  showErrorToast(NOTIFICATION_CONSTANTS.TOAST_MESSAGES.CLEAR_ERROR);
};