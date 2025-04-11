import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  targetDate: Date;
  onComplete?: () => void;
  showIcon?: boolean;
}

export function CountdownTimer({ targetDate, onComplete, showIcon = true }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = +targetDate - +new Date();
    
    if (difference <= 0) {
      if (onComplete) {
        onComplete();
      }
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60)
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      
      // Check if timer has completed
      if (newTimeLeft.days === 0 && newTimeLeft.hours === 0 && 
          newTimeLeft.minutes === 0 && newTimeLeft.seconds === 0) {
        clearInterval(timer);
        if (onComplete) {
          onComplete();
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onComplete]);

  const formatTime = (value: number) => value.toString().padStart(2, '0');

  if (timeLeft.days > 0) {
    return (
      <div className="flex items-center">
        {showIcon && <Clock className="h-4 w-4 mr-1" />}
        <span>{timeLeft.days}d {formatTime(timeLeft.hours)}h</span>
      </div>
    );
  }

  return (
    <div className="flex items-center">
      {showIcon && <Clock className="h-4 w-4 mr-1" />}
      <span>
        {timeLeft.hours > 0 ? `${formatTime(timeLeft.hours)}:` : ''}
        {formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
      </span>
    </div>
  );
}
