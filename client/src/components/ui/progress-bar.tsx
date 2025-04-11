import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
  fillClassName?: string;
}

export function ProgressBar({ value, max, className, fillClassName }: ProgressBarProps) {
  const percentage = (value / max) * 100;
  
  return (
    <div className={cn("w-full rounded-full overflow-hidden", className)}>
      <div 
        className={cn("h-full rounded-full transition-all duration-300", fillClassName)}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
