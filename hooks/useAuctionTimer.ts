"use client";

import { useState, useEffect, useCallback } from "react";
import { formatTimeLeft, isTimeUrgent, getTimeRemaining } from "../utils/timeUtils";

/**
 * Hook for real-time auction countdown updates
 *
 * Provides live time display updates every 60 seconds for active auctions.
 * Automatically stops updating when auction ends to prevent unnecessary re-renders.
 *
 * @param endTime - ISO string of when the auction ends
 * @param updateInterval - How often to update in milliseconds (default: 60000 = 1 minute)
 * @returns Object with timeLeft, isTimeUrgent, and timeRemaining
 *
 * @example
 * const { timeLeft, isTimeUrgent, timeRemaining } = useAuctionTimer(
 *   "2024-01-01T12:00:00Z"
 * );
 */
export function useAuctionTimer(
  endTime: string,
  updateInterval: number = 60000 // Update every minute
) {
  const [timeLeft, setTimeLeft] = useState<string>(() => formatTimeLeft(endTime));
  const [isUrgent, setIsUrgent] = useState<boolean>(() => isTimeUrgent(endTime));
  const [timeRemaining, setTimeRemaining] = useState<number>(() => getTimeRemaining(endTime));

  const updateTimer = useCallback(() => {
    const newTimeRemaining = getTimeRemaining(endTime);
    const newTimeLeft = formatTimeLeft(endTime);
    const newIsUrgent = isTimeUrgent(endTime);

    setTimeRemaining(newTimeRemaining);
    setTimeLeft(newTimeLeft);
    setIsUrgent(newIsUrgent);

    // Return true if auction has ended (to stop timer)
    return newTimeRemaining === 0;
  }, [endTime]);

  useEffect(() => {
    // Initial update
    const isEnded = updateTimer();

    // Don't set up interval if auction has already ended
    if (isEnded) {
      return;
    }

    // Set up interval for regular updates
    const interval = setInterval(() => {
      const shouldStop = updateTimer();
      if (shouldStop) {
        clearInterval(interval);
      }
    }, updateInterval);

    // Cleanup interval on unmount or when endTime changes
    return () => clearInterval(interval);
  }, [endTime, updateInterval, updateTimer]);

  return {
    timeLeft,
    isTimeUrgent: isUrgent,
    timeRemaining,
  };
}