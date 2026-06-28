import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface PremiumActionProps {
  icon: React.ElementType;
  label: string;
  description: string;
  to: string;
  className?: string;
}

export function PremiumAction({ icon: Icon, label, description, to, className }: PremiumActionProps) {
  return (
    <Link
      to={to}
      className={cn(
        "group flex items-center gap-4 rounded-xl border border-border/60 bg-card p-4",
        "hover:border-accent/30 hover:bg-accent/5 transition-all duration-150 hover:-translate-y-0.5",
        className,
      )}
    >
      <div className="h-10 w-10 rounded-lg bg-muted/50 flex items-center justify-center shrink-0 group-hover:bg-accent/12 transition-colors">
        <Icon className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground leading-none">{label}</p>
        <p className="text-xs text-muted-foreground/65 mt-1.5 leading-none truncate">{description}</p>
      </div>
    </Link>
  );
}
