import { cn } from "@/lib/utils";

interface PremiumHeroProps {
  badge?: React.ReactNode;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  meta?: React.ReactNode;
  className?: string;
}

export function PremiumHero({
  badge,
  eyebrow,
  title,
  subtitle,
  action,
  meta,
  className,
}: PremiumHeroProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border/60 bg-card px-6 py-5",
        "shadow-[0_1px_3px_hsl(210_20%_20%/0.06)]",
        className,
      )}
    >
      <div className="absolute inset-y-0 left-0 w-[3px] bg-accent rounded-l-xl" />
      <div className="pl-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          {badge && <div>{badge}</div>}
          {eyebrow && (
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 font-medium capitalize">
              {eyebrow}
            </p>
          )}
          <h1 className="text-xl font-bold text-foreground tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-xs text-muted-foreground/55 mt-0.5">{subtitle}</p>
          )}
        </div>
        {(action || meta) && (
          <div className="flex items-center gap-4 shrink-0">
            {meta}
            {action}
          </div>
        )}
      </div>
    </div>
  );
}
