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
    <section className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-accent/65">{label}</p>
          {description && (
            <p className="text-[10px] text-muted-foreground/40">{description}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
