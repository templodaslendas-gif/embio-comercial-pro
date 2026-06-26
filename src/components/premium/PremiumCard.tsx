import { cn } from "@/lib/utils";

interface PremiumCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function PremiumCard({ children, className, hover = false, onClick }: PremiumCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-xl border border-border/60 bg-card p-5 shadow-[0_1px_3px_hsl(210_20%_20%/0.06)]",
        hover && "transition-all duration-150 hover:border-accent/30 hover:shadow-md cursor-pointer",
        className,
      )}
    >
      {children}
    </div>
  );
}
