import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

export function useCountUp(target: number, duration = 500) {
  const [val, setVal] = useState(0);
  const fromRef = useRef(0);
  useEffect(() => {
    const from = fromRef.current;
    let start: number | null = null;
    let raf = 0;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / duration);
      setVal(Math.round(from + (target - from) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
      else fromRef.current = target;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

interface PremiumMetricProps {
  value: number;
  label: string;
  suffix?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PremiumMetric({ value, label, suffix = "", size = "md", className }: PremiumMetricProps) {
  const count = useCountUp(value);
  const numSize = size === "lg" ? "text-3xl" : size === "sm" ? "text-xl" : "text-2xl";
  return (
    <div className={cn("", className)}>
      <span className={cn("font-bold tabular-nums leading-none text-foreground", numSize)}>
        {count}{suffix}
      </span>
      {label && (
        <p className="text-[9px] uppercase tracking-wide text-muted-foreground/50 mt-1 leading-none">{label}</p>
      )}
    </div>
  );
}
