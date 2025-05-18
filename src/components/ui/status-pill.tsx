
import React from "react";
import { cn } from "@/lib/utils";

type StatusType = "active" | "pending" | "completed" | "cancelled" | "new" | "overdue" | "due-soon";

interface StatusPillProps {
  status: StatusType;
  pulse?: boolean;
  className?: string;
}

export function StatusPill({ status, pulse = false, className }: StatusPillProps) {
  const statusConfig = {
    active: {
      bgColor: "bg-green-500/20",
      textColor: "text-green-400",
      borderColor: "border-green-500/30",
      pulseColor: "before:bg-green-400",
    },
    pending: {
      bgColor: "bg-yellow-500/20",
      textColor: "text-yellow-400",
      borderColor: "border-yellow-500/30",
      pulseColor: "before:bg-yellow-400",
    },
    completed: {
      bgColor: "bg-synergy-cyan/20",
      textColor: "text-synergy-cyan",
      borderColor: "border-synergy-cyan/30",
      pulseColor: "before:bg-synergy-cyan",
    },
    cancelled: {
      bgColor: "bg-red-500/20", 
      textColor: "text-red-400",
      borderColor: "border-red-500/30",
      pulseColor: "before:bg-red-400",
    },
    new: {
      bgColor: "bg-synergy-violet/20",
      textColor: "text-synergy-violet",
      borderColor: "border-synergy-violet/30",
      pulseColor: "before:bg-synergy-violet",
    },
    "overdue": {
      bgColor: "bg-red-500/20",
      textColor: "text-red-400",
      borderColor: "border-red-500/30",
      pulseColor: "before:bg-red-400",
    },
    "due-soon": {
      bgColor: "bg-yellow-500/20",
      textColor: "text-yellow-400",
      borderColor: "border-yellow-500/30",
      pulseColor: "before:bg-yellow-400",
    }
  };
  
  const config = statusConfig[status];
  
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full px-3 py-0.5",
        "border text-xs font-medium tracking-wider uppercase",
        config.bgColor,
        config.textColor,
        config.borderColor,
        "relative",
        className
      )}
    >
      {pulse && (
        <span 
          className={cn(
            "absolute inline-flex h-2 w-2 rounded-full opacity-75 animate-pulse",
            "before:absolute before:h-full before:w-full before:rounded-full",
            config.pulseColor,
            "left-1.5 top-1/2 -translate-y-1/2"
          )}
        ></span>
      )}
      
      {pulse && <span className="ml-3">{status}</span>}
      {!pulse && status}
    </div>
  );
}
