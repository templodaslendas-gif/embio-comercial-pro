import { MessageCircle, Phone, MapPin } from "lucide-react";
import { useBranding } from "@/hooks/useBranding";
import { waLink, telLink } from "@/lib/format";

interface Props {
  className?: string;
  align?: "center" | "left";
}

export function CompanyFooter({ className = "", align = "center" }: Props) {
  const { branding } = useBranding();
  const { company_name, app_name, cnpj, address, phone, phone_is_whatsapp } = branding;

  const name = (company_name || app_name || "").trim();
  if (!name && !cnpj && !address && !phone) return null;

  const alignCls = align === "center" ? "text-center items-center" : "text-left items-start";
  const PhoneIcon = phone_is_whatsapp ? MessageCircle : Phone;
  const href = phone ? (phone_is_whatsapp ? waLink(phone) : telLink(phone)) : null;

  return (
    <div
      className={`mt-4 pt-3 border-t border-border/40 flex flex-col gap-1 text-[11px] text-muted-foreground ${alignCls} ${className}`}
    >
      {(name || cnpj) && (
        <div className="font-medium text-foreground/80">
          {name}
          {name && cnpj && <span className="mx-1.5 opacity-60">·</span>}
          {cnpj && <span>CNPJ {cnpj}</span>}
        </div>
      )}
      {address && (
        <div className="flex items-start gap-1 max-w-md">
          <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
          <span className="whitespace-pre-line">{address}</span>
        </div>
      )}
      {phone && href && (
        <a
          href={href}
          target={phone_is_whatsapp ? "_blank" : undefined}
          rel={phone_is_whatsapp ? "noopener noreferrer" : undefined}
          className="inline-flex items-center gap-1.5 text-primary hover:underline font-medium"
        >
          <PhoneIcon className="h-3.5 w-3.5" />
          {phone}
        </a>
      )}
    </div>
  );
}
