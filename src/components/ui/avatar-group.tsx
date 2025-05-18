
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  image?: string;
}

interface AvatarGroupProps {
  users: User[];
  maxVisible?: number;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

export function AvatarGroup({ 
  users, 
  maxVisible = 4, 
  size = "md", 
  className 
}: AvatarGroupProps) {
  const visibleUsers = users.slice(0, maxVisible);
  const remainingUsers = users.length - maxVisible;
  
  const sizeClasses = {
    xs: "h-5 w-5 text-xs",
    sm: "h-6 w-6 text-xs",
    md: "h-8 w-8 text-sm",
    lg: "h-10 w-10 text-base"
  };
  
  const avatarSize = sizeClasses[size];
  
  return (
    <div className={cn("flex -space-x-2", className)}>
      {visibleUsers.map((user) => (
        <Avatar 
          key={user.id} 
          className={cn(
            avatarSize,
            "ring-2 ring-background border border-white/10",
            "transition-all duration-300 hover:ring-synergy-cyan/50 hover:-translate-y-1"
          )}
        >
          <AvatarImage src={user.image} />
          <AvatarFallback className="bg-synergy-violet/30 text-synergy-white font-medium">
            {user.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ))}
      
      {remainingUsers > 0 && (
        <Avatar className={cn(
          avatarSize,
          "ring-2 ring-background bg-synergy-navy border border-white/10"
        )}>
          <AvatarFallback className="bg-muted text-muted-foreground font-medium">
            +{remainingUsers}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
