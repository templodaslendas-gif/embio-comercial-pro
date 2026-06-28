import { cn } from "@/lib/utils";

interface PremiumHeaderProps {
  icon?: React.ElementType;
  badge?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
  variant?: "default" | "gradient";
}

export function PremiumHeader({ icon: Icon, badge, title, subtitle, action, className, variant = "default" }: PremiumHeaderProps) {
  if (variant === "gradient") {
    return (
      <div className={cn(
        "relative overflow-hidden rounded-xl px-6 py-5 shadow-md",
        "bg-gradient-to-r from-[hsl(210,62%,14%)] via-[hsl(210,58%,17%)] to-[hsl(140,48%,22%)]",
        className,
      )}>
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "24px 24px" }}
        />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            {(Icon || badge) && (
              <div className="flex items-center gap-1.5 mb-1.5">
                {Icon && <Icon className="h-3.5 w-3.5 text-white/45" />}
                {badge && <span className="text-[10px] font-bold uppercase tracking-widest text-white/45">{badge}</span>}
              </div>
            )}
            <h1 className="text-xl font-bold text-white tracking-tight">{title}</h1>
            {subtitle && <p className="text-[11px] text-white/45 mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </div>
      </div>
    );
  }

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
