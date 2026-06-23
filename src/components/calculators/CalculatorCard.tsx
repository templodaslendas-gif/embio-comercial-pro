import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MessageCircle, Package, RefreshCw, CalendarClock, Droplet } from "lucide-react";
import { useBranding, generatedByText } from "@/hooks/useBranding";

interface CalculatorResult {
  frascos: number;
  porAplicacao: number;
  frequencia: string;
  detalhes: string;
}

interface CalculatorCardProps {
  title: string;
  description: string;
  inputLabel: string;
  inputPlaceholder: string;
  calculate: (value: number) => CalculatorResult;
  icon: ReactNode;
  productName: string;
}

export function CalculatorCard({ title, description, inputLabel, inputPlaceholder, calculate, icon, productName }: CalculatorCardProps) {
  const [inputValue, setInputValue] = useState("");
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const { t } = useTranslation();
  const { branding } = useBranding();

  const handleCalculate = () => {
    const value = parseInt(inputValue, 10);
    if (isNaN(value) || value <= 0) return;
    setResult(calculate(value));
  };

  const handleWhatsApp = () => {
    if (!result) return;
    const text = encodeURIComponent(
      `${t("calculator.reportTitle", { product: productName })}\n\n` +
      `${t("calculator.reportBottles", { count: result.frascos })}\n` +
      `${t("calculator.reportPerApplication", { count: result.porAplicacao })}\n` +
      `${t("calculator.reportFrequency", { freq: result.frequencia })}\n` +
      `📝 ${result.detalhes}\n\n` +
      `_${generatedByText(branding)}_`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handleReset = () => { setInputValue(""); setResult(null); };

  return (
    <Card className="border border-border/50 shadow-card animate-fade-in">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription className="text-xs mt-0.5">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="calc-input" className="text-sm font-medium">{inputLabel}</Label>
          <Input id="calc-input" type="number" inputMode="numeric" min="1" placeholder={inputPlaceholder} value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleCalculate()} className="h-12 text-base bg-muted/30 border-border/50 focus-visible:ring-primary/30" />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCalculate} disabled={!inputValue || parseInt(inputValue) <= 0} className="flex-1 h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-medium">
            {t("calculator.calculate")}
          </Button>
          {result && <Button onClick={handleReset} variant="outline" size="icon" className="h-11 w-11 shrink-0"><RefreshCw className="h-4 w-4" /></Button>}
        </div>
        {result && (
          <div className="space-y-4 animate-fade-in">
            <div className="rounded-xl bg-secondary/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Package className="h-4 w-4" /><span>{t("calculator.bottlesNeeded")}</span></div>
                <span className="text-2xl font-bold text-primary animate-count-up">{result.frascos}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Droplet className="h-4 w-4" /><span>{t("calculator.perApplication")}</span></div>
                <span className="text-xl font-bold text-accent-foreground">{result.porAplicacao}</span>
              </div>
              <p className="text-[11px] text-muted-foreground/70 italic pl-6">{t("calculator.halfUsageNote")}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><CalendarClock className="h-4 w-4" /><span>{t("calculator.frequency")}</span></div>
                <span className="text-sm font-semibold text-foreground">{result.frequencia}</span>
              </div>
              <p className="text-xs text-muted-foreground pt-1 border-t border-border/50">{result.detalhes}</p>
            </div>
            <Button onClick={handleWhatsApp} variant="outline" className="w-full h-11 gap-2 border-primary/20 text-primary hover:bg-primary/5">
              <MessageCircle className="h-4 w-4" />{t("calculator.sendWhatsApp")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
