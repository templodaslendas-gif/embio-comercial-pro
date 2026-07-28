import { cn } from "@/lib/utils";

interface PremiumChartCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  className?: string;
}

export function PremiumChartCard({ title, subtitle, icon: Icon, children, className }: PremiumChartCardProps) {
  return (
    <div className={cn(
      "rounded-xl border border-border/60 bg-card p-5 shadow-[0_1px_3px_hsl(210_20%_20%/0.06)]",
      className,
    )}>
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          {subtitle && (
            <p className="text-sm text-foreground/60 mt-0.5">{subtitle}</p>
          )}
        </div>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground/35 mt-0.5" />}
      </div>
      {children}
    </div>
  );
}
