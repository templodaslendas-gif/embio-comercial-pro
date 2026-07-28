import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PremiumSectionProps {
  label: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function PremiumSection({ label, description, action, children, className }: PremiumSectionProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      className={cn("space-y-4", className)}
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <p className="text-section-label">{label}</p>
          {description && (
            <p className="text-xs text-muted-foreground/55">{description}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </motion.section>
  );
}
