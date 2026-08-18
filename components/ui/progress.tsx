import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  indicatorColor?: string;
  size?: "sm" | "default" | "lg";
  showLabel?: boolean;
}

export function Progress({
  value,
  max = 100,
  indicatorColor,
  size = "default",
  showLabel = false,
  className,
  ...props
}: ProgressProps) {
  const percentage = Math.min(Math.max(0, Math.round((value / max) * 100)), 100);

  const heightClass = {
    sm: "h-1.5",
    default: "h-2.5",
    lg: "h-4",
  }[size];

  return (
    <div className={cn("w-full space-y-1", className)} {...props}>
      {showLabel && (
        <div className="flex justify-between text-xs font-medium text-muted-foreground">
          <span>Progress</span>
          <span className="font-semibold text-foreground">{percentage}%</span>
        </div>
      )}
      <div
        className={cn(
          "w-full overflow-hidden rounded-full bg-secondary",
          heightClass
        )}
      >
        <div
          className="h-full transition-all duration-500 ease-out rounded-full"
          style={{
            width: `${percentage}%`,
            backgroundColor: indicatorColor || (percentage === 100 ? "#10b981" : "hsl(var(--primary))"),
          }}
        />
      </div>
    </div>
  );
}
