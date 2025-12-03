export const NOTIFICATION_CONSTANTS = {
  TOAST_MESSAGES: {
    CLEAR_SUCCESS: {
      title: 'Notifications cleared',
      description: 'All notifications have been cleared successfully',
    },
    CLEAR_ERROR: {
      title: 'Failed to clear notifications',
      description: 'Please try again later',
    },
  },

  QUERY_KEYS: {
    NOTIFICATIONS: 'notifications' as const,
  },
} as const;

export const createNotificationQueryKey = (userId: string) =>
  [NOTIFICATION_CONSTANTS.QUERY_KEYS.NOTIFICATIONS, userId] as const;
