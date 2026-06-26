import { cn } from "@/lib/utils";

interface PremiumPageProps {
  children: React.ReactNode;
  className?: string;
}

export function PremiumPage({ children, className }: PremiumPageProps) {
  return (
    <div className={cn("max-w-5xl mx-auto space-y-8 py-1", className)}>
      {children}
    </div>
  );
}
