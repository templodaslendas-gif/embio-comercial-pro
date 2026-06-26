import { cn } from "@/lib/utils";

interface PremiumHeaderProps {
  icon?: React.ElementType;
  badge?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PremiumHeader({ icon: Icon, badge, title, subtitle, action, className }: PremiumHeaderProps) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl border border-border/60 bg-card px-5 py-4 shadow-[0_1px_3px_hsl(210_20%_20%/0.06)]",
      className,
    )}>
      <div className="absolute inset-y-0 left-0 w-[3px] bg-accent rounded-l-xl" />
      <div className="pl-3 flex items-center justify-between gap-4">
        <div>
          {(Icon || badge) && (
            <div className="flex items-center gap-1.5 mb-1">
              {Icon && <Icon className="h-3.5 w-3.5 text-accent" />}
              {badge && (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-accent/70">{badge}</span>
              )}
            </div>
          )}
          <h1 className="text-lg font-bold text-foreground tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-[11px] text-muted-foreground/60 mt-0.5">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
    </div>
  );
}
