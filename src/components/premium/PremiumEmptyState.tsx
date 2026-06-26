import { cn } from "@/lib/utils";

interface PremiumEmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: React.ReactNode;
  size?: "sm" | "md";
  className?: string;
}

export function PremiumEmptyState({
  icon: Icon,
  title,
  description,
  action,
  size = "md",
  className,
}: PremiumEmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center text-center space-y-3",
      size === "md" ? "py-10" : "py-6",
      className,
    )}>
      <div className="h-11 w-11 rounded-xl bg-muted/40 flex items-center justify-center">
        <Icon className="h-5 w-5 text-muted-foreground/35" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground/65">{title}</p>
        {description && (
          <p className="text-[11px] text-muted-foreground/50 mt-0.5 max-w-[200px] leading-snug">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
