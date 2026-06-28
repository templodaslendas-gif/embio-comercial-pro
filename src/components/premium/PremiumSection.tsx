import { cn } from "@/lib/utils";

interface PremiumSectionProps {
  label: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function PremiumSection({ label, description, action, children, className }: PremiumSectionProps) {
  return (
    <section className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <p className="text-sm font-bold uppercase tracking-wider text-accent/80">{label}</p>
          {description && (
            <p className="text-xs text-muted-foreground/50">{description}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
