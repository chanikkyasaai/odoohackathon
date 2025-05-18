
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CalendarClock, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface DueDateAlertProps {
  dueDate: Date;
  title?: string;
  className?: string;
}

export function DueDateAlert({ dueDate, title, className }: DueDateAlertProps) {
  const now = new Date();
  const isOverdue = dueDate < now;
  const isToday = 
    dueDate.getDate() === now.getDate() && 
    dueDate.getMonth() === now.getMonth() && 
    dueDate.getFullYear() === now.getFullYear();
  
  const isSoon = !isOverdue && !isToday && 
    dueDate.getTime() - now.getTime() < 1000 * 60 * 60 * 24 * 3; // 3 days
  
  // Format the due date
  const formattedDate = dueDate.toLocaleDateString();
  const formattedTime = dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  if (!isOverdue && !isToday && !isSoon) {
    return null;
  }
  
  return (
    <Alert
      variant={isOverdue ? "destructive" : "default"}
      className={cn(
        "border border-white/10 backdrop-blur-sm",
        isOverdue ? "bg-red-500/10" : isToday ? "bg-yellow-500/10" : "bg-blue-500/10",
        className
      )}
    >
      {isOverdue ? (
        <Clock className="h-4 w-4 text-red-400" />
      ) : (
        <CalendarClock className="h-4 w-4 text-yellow-400" />
      )}
      <AlertTitle>
        {title || (isOverdue ? "Overdue!" : isToday ? "Due Today" : "Coming Up Soon")}
      </AlertTitle>
      <AlertDescription className="text-sm">
        {isOverdue 
          ? `This was due on ${formattedDate} at ${formattedTime}`
          : isToday 
            ? `Due today at ${formattedTime}`
            : `Due on ${formattedDate}`}
      </AlertDescription>
    </Alert>
  );
}
