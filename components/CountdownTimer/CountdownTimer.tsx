'use client';

import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  timeRemaining: number; // en segundos
  onTimeExpired?: () => void;
}

export default function CountdownTimer({ timeRemaining, onTimeExpired }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(timeRemaining);

  useEffect(() => {
    setTimeLeft(timeRemaining);
  }, [timeRemaining]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeExpired?.();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          onTimeExpired?.();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeExpired]);

  const formatTime = (seconds: number) => {
    if (seconds <= 0) return '00:00:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (timeLeft <= 0) {
    return (
      <div className="text-green-600 font-medium text-sm">
        ✅ Listo para retirar
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="text-orange-600 font-mono text-lg font-bold">
        {formatTime(timeLeft)}
      </div>
      <div className="text-xs text-gray-500 mt-1">
        Tiempo restante para retirar
      </div>
    </div>
  );
}
