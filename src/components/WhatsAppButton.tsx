import { MessageCircle } from "lucide-react";
import { useState } from "react";

export function WhatsAppButton() {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleClick = () => {
    const message = encodeURIComponent(
      "Olá! Gostaria de mais informações sobre os produtos Embio. Fiz um dimensionamento pelo app e gostaria de um orçamento."
    );
    window.open(`https://wa.me/5500000000000?text=${message}`, "_blank");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {showTooltip && (
        <div className="absolute bottom-16 right-0 whitespace-nowrap rounded-lg bg-foreground px-3 py-2 text-xs text-background shadow-lg animate-fade-in">
          Gerar Relatório para WhatsApp
        </div>
      )}
      <button
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(142,70%,45%)] shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95"
        aria-label="Enviar relatório por WhatsApp"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </button>
    </div>
  );
}
