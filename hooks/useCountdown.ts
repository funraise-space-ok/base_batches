import { useState, useEffect } from 'react';

interface CountdownResult {
  timeLeft: number;
  isExpired: boolean;
  formattedTime: string;
}

export function useCountdown(targetTimestamp: number): CountdownResult {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const updateCountdown = () => {
      const now = Math.floor(Date.now() / 1000); // Current timestamp in seconds
      const remaining = targetTimestamp - now;
      setTimeLeft(Math.max(0, remaining));
    };

    // Update immediately
    updateCountdown();

    // Update every second
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [targetTimestamp]);

  const isExpired = timeLeft <= 0;

  const formatTime = (seconds: number): string => {
    if (seconds <= 0) return "Ready!";
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  return {
    timeLeft,
    isExpired,
    formattedTime: formatTime(timeLeft)
  };
}
