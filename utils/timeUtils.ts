/**
 * Time utility functions for auction countdowns and formatting
 *
 * Key improvements over previous implementations:
 * - Uses Math.ceil() instead of Math.floor() for proper rounding
 * - Ensures minimum 1 minute display instead of 0m
 * - Centralized logic to eliminate code duplication
 */

/**
 * Formats the remaining time until auction end
 *
 * @param endTime - ISO string of when the auction ends
 * @returns Formatted time string (e.g., "2d", "5h", "7m", "Ended")
 *
 * @example
 * formatTimeLeft("2024-01-01T12:00:00Z") // "2d"
 * formatTimeLeft("2024-01-01T11:30:00Z") // "1h"
 * formatTimeLeft("2024-01-01T11:59:30Z") // "1m"
 * formatTimeLeft("2024-01-01T11:59:00Z") // "1m"
 * formatTimeLeft("2024-01-01T10:00:00Z") // "Ended"
 */
export function formatTimeLeft(endTime: string): string {
  const endTimeDate = new Date(endTime).getTime();
  const now = new Date().getTime();
  const diff = endTimeDate - now;

  if (diff <= 0) return "Ended";

  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days > 1) {
    return `${days}d`;
  }

  const hours = Math.ceil(diff / (1000 * 60 * 60));
  if (hours > 1) {
    return `${hours}h`;
  }

  // Always show at least 1 minute for any active auction
  const minutes = Math.ceil(diff / (1000 * 60));
  return `${Math.max(1, minutes)}m`;
}

/**
 * Determines if the auction time should be displayed as urgent
 *
 * @param endTime - ISO string of when the auction ends
 * @returns true if auction ends in less than 1 day or has already ended
 *
 * @example
 * isTimeUrgent("2024-01-01T12:00:00Z") // false (more than 1 day)
 * isTimeUrgent("2024-01-01T02:00:00Z") // true (less than 1 day)
 * isTimeUrgent("2024-01-01T10:00:00Z") // true (ended)
 */
export function isTimeUrgent(endTime: string): boolean {
  const endTimeDate = new Date(endTime).getTime();
  const now = new Date().getTime();
  const diff = endTimeDate - now;

  // Ended or less than 1 day remaining is considered urgent
  return diff <= 0 || diff < (1000 * 60 * 60 * 24);
}

/**
 * Calculate the remaining time in milliseconds
 *
 * @param endTime - ISO string of when the auction ends
 * @returns Remaining time in milliseconds (0 if ended)
 */
export function getTimeRemaining(endTime: string): number {
  const endTimeDate = new Date(endTime).getTime();
  const now = new Date().getTime();
  return Math.max(0, endTimeDate - now);
}