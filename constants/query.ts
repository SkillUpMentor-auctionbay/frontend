export const QUERY_CONSTANTS = {
  CACHE_TIMES: {
    SHORT: 30 * 1000, // 30 seconds
    MEDIUM: 5 * 60 * 1000, // 5 minutes
    LONG: 15 * 60 * 1000, // 15 minutes
  },

  REFRESH_INTERVALS: {
    FAST: 5 * 1000, // 5 seconds
    NORMAL: 10 * 1000, // 10 seconds
    MEDIUM: 20 * 1000, // 20 seconds
    SLOW: 30 * 1000, // 30 seconds
  },

  RETRY: {
    MAX_ATTEMPTS: 2,
    BASE_DELAY: 1000, // 1 second
    MAX_DELAY: 5000, // 5 seconds
  },
} as const;
