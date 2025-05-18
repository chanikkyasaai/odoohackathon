
import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FuturisticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
  glow?: "cyan" | "violet" | "none";
  animateHover?: boolean;
  ripple?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  children?: React.ReactNode;
}

export function FuturisticButton({
  variant = "primary",
  size = "md",
  glow = "none",
  animateHover = true,
  ripple = false,
  iconLeft,
  iconRight,
  className,
  children,
  ...props
}: FuturisticButtonProps) {
  const variantClasses = {
    primary: "bg-synergy-cyan text-synergy-navy hover:bg-synergy-cyan/90",
    secondary: "bg-synergy-violet text-synergy-white hover:bg-synergy-violet/90",
    outline: "bg-transparent border border-synergy-cyan/50 text-synergy-cyan hover:bg-synergy-cyan/10",
    ghost: "bg-transparent hover:bg-white/5 text-synergy-white",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  };

  const sizeClasses = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4",
    lg: "h-12 px-6 text-lg",
    icon: "h-10 w-10",
  };

  const glowClasses = {
    cyan: "shadow-neon-cyan",
    violet: "shadow-neon-violet",
    none: "",
  };

  const hoverAnimation = animateHover
    ? "transition-all duration-300 hover:scale-[1.03]"
    : "";

  const rippleEffect = ripple
    ? "relative overflow-hidden after:content-[''] after:absolute after:h-12 after:w-12 after:bg-white/20 after:rounded-full after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:scale-0 after:opacity-0 hover:after:scale-[10] hover:after:opacity-100 after:transition-all after:duration-700"
    : "";

  return (
    <Button
      className={cn(
        "font-space tracking-wider rounded-lg backdrop-blur-md relative",
        variantClasses[variant],
        sizeClasses[size],
        glowClasses[glow],
        hoverAnimation,
        rippleEffect,
        className
      )}
      {...props}
    >
      {iconLeft && <span className="mr-2">{iconLeft}</span>}
      {children}
      {iconRight && <span className="ml-2">{iconRight}</span>}
    </Button>
  );
}
