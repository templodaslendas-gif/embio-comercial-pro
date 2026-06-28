import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";
import type { buttonVariants } from "@/components/ui/button";

interface PremiumButtonProps
  extends React.ComponentPropsWithoutRef<typeof Button>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  icon?: React.ElementType;
  iconRight?: React.ElementType;
}

export const PremiumButton = forwardRef<HTMLButtonElement, PremiumButtonProps>(
  ({ children, loading, icon: Icon, iconRight: IconRight, disabled, className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        disabled={disabled || loading}
        className={cn("gap-1.5", className)}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : Icon ? (
          <Icon className="h-4 w-4" />
        ) : null}
        {children}
        {!loading && IconRight && <IconRight className="h-4 w-4" />}
      </Button>
    );
  },
);
PremiumButton.displayName = "PremiumButton";
