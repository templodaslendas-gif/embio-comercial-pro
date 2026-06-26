import { cn } from "@/lib/utils";

interface PremiumBadgeProps {
  children: React.ReactNode;
  variant?: "accent" | "primary" | "muted";
  className?: string;
}

const variants = {
  accent: "bg-accent/10 text-accent border-accent/25",
  primary: "bg-primary/8 text-primary border-primary/20",
  muted: "bg-muted text-muted-foreground border-border/60",
};

export function PremiumBadge({ children, variant = "accent", className }: PremiumBadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
      variants[variant],
      className,
    )}>
      {children}
    </span>
  );
}
