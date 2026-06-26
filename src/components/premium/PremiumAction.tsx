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
        "group flex items-center gap-3.5 rounded-xl border border-border/60 bg-card p-3.5",
        "hover:border-accent/30 hover:bg-accent/5 transition-all duration-150",
        className,
      )}
    >
      <div className="h-9 w-9 rounded-lg bg-muted/50 flex items-center justify-center shrink-0 group-hover:bg-accent/12 transition-colors">
        <Icon className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
      </div>
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-foreground leading-none">{label}</p>
        <p className="text-[10px] text-muted-foreground/60 mt-1 leading-none truncate">{description}</p>
      </div>
    </Link>
  );
}
