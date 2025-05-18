
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FuturisticInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  variant?: "cyan" | "violet" | "default";
  containerClassName?: string;
  error?: string;
}

export function FuturisticInput({
  label,
  icon,
  variant = "default",
  containerClassName,
  className,
  error,
  ...props
}: FuturisticInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const variantClasses = {
    cyan: isFocused ? "shadow-neon-cyan border-synergy-cyan/50" : "border-white/10",
    violet: isFocused ? "shadow-neon-violet border-synergy-violet/50" : "border-white/10",
    default: isFocused ? "shadow-md border-white/30" : "border-white/10",
  };

  return (
    <div className={cn("space-y-2", containerClassName)}>
      {label && (
        <Label 
          className={cn(
            "text-sm tracking-wider transition-colors duration-300",
            isFocused && variant === "cyan" && "text-glow-cyan",
            isFocused && variant === "violet" && "text-glow-violet"
          )}
        >
          {label}
        </Label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
        
        <Input
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            "h-10 bg-white/5 backdrop-blur border rounded-lg transition-all duration-300",
            icon && "pl-10",
            variantClasses[variant],
            error && "border-red-500",
            "focus-visible:ring-0 focus-visible:ring-offset-0",
            "placeholder:text-muted-foreground/70 font-light tracking-wide",
            className
          )}
          {...props}
        />
        
        {error && (
          <p className="text-xs text-red-500 mt-1">{error}</p>
        )}
      </div>
    </div>
  );
}
