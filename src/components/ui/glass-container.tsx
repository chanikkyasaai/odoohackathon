
import React from "react";
import { cn } from "@/lib/utils";

interface GlassContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "light" | "dark" | "cyan" | "violet";
  animate?: boolean;
  hover?: boolean;
  children: React.ReactNode;
}

export function GlassContainer({
  variant = "light",
  animate = false,
  hover = false,
  className,
  children,
  ...props
}: GlassContainerProps) {
  const baseClasses = "rounded-xl backdrop-blur-lg transition-all duration-300";

  const variantClasses = {
    light: "glass bg-white/5 border border-white/10",
    dark: "glass-dark bg-synergy-navy/80 border border-white/5",
    cyan: "glass bg-white/5 border border-synergy-cyan/50 shadow-neon-cyan",
    violet: "glass bg-white/5 border border-synergy-violet/50 shadow-neon-violet",
  };

  const animationClasses = animate ? "animate-float" : "";
  const hoverClasses = hover ? "hover:bg-white/10 hover:scale-[1.01]" : "";

  return (
    <div 
      className={cn(
        baseClasses,
        variantClasses[variant],
        animationClasses,
        hoverClasses,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
