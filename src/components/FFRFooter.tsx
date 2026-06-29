import { cn } from "@/lib/utils";

const WA_URL =
  "https://wa.me/5545999317831?text=Vim+pelo+sistema+da+Embio%2C+quero+tirar+algumas+d%C3%BAdvidas.";

export function FFRFooter({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center py-3", className)}>
      <a
        href={WA_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[11px] text-muted-foreground/40 hover:text-muted-foreground/65 transition-colors cursor-pointer select-none"
      >
        Produzido por{" "}
        <span className="font-semibold text-muted-foreground/55">FFR do Brasil</span>
      </a>
    </div>
  );
}
