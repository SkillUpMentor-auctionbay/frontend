'use client';

import {
  formatTimeLeft,
  getTimeRemaining,
  isTimeUrgent,
} from '@/utils/timeUtils';
import { useCallback, useEffect, useState } from 'react';

export function useAuctionTimer(
  endTime: string,
  updateInterval: number = 60000,
) {
  const [timeLeft, setTimeLeft] = useState<string>(() =>
    formatTimeLeft(endTime),
  );
  const [isUrgent, setIsUrgent] = useState<boolean>(() =>
    isTimeUrgent(endTime),
  );
  const [timeRemaining, setTimeRemaining] = useState<number>(() =>
    getTimeRemaining(endTime),
  );

  const updateTimer = useCallback(() => {
    const newTimeRemaining = getTimeRemaining(endTime);
    const newTimeLeft = formatTimeLeft(endTime);
    const newIsUrgent = isTimeUrgent(endTime);

    setTimeRemaining(newTimeRemaining);
    setTimeLeft(newTimeLeft);
    setIsUrgent(newIsUrgent);

    return newTimeRemaining === 0;
  }, [endTime]);

  useEffect(() => {
    const isEnded = updateTimer();

    if (isEnded) {
      return;
    }

    const interval = setInterval(() => {
      const shouldStop = updateTimer();
      if (shouldStop) {
        clearInterval(interval);
      }
    }, updateInterval);

    return () => clearInterval(interval);
  }, [endTime, updateInterval, updateTimer]);

  return {
    timeLeft,
    isTimeUrgent: isUrgent,
    timeRemaining,
  };
}
