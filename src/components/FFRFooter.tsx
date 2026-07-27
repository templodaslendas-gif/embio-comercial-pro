import { cn } from "@/lib/utils";

const WA_URL =
  "https://wa.me/5545999317831?text=Vim%20pelo%20sistema%20da%20Embio%2C%20quero%20tirar%20algumas%20d%C3%BAvidas.";

export function FFRFooter({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center py-3", className)}>
      <a
        href={WA_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[11px] text-muted-foreground/70 hover:text-foreground transition-colors cursor-pointer select-none"
      >
        Produzido por{" "}
        <span className="font-semibold text-muted-foreground/90">FFR do Brasil</span>
      </a>
    </div>
  );
}
