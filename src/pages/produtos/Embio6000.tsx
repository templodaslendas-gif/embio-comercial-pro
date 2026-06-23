import { useTranslation } from "react-i18next";
import { Flame, Calculator, Beaker, AlertTriangle, Info } from "lucide-react";
import { CalculatorCard } from "@/components/calculators/CalculatorCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Embio6000 = () => {
  const { t } = useTranslation();
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"><Flame className="h-5 w-5 text-primary" /></div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">EMBIO 6000</h1>
            <p className="text-sm text-muted-foreground">{t("products.embio6000.subtitle")}</p>
          </div>
        </div>
      </div>
      <Card className="border border-border/50 shadow-card animate-fade-in">
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Info className="h-4 w-4 text-primary" />{t("products.embio6000.whatFor")}</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-muted-foreground leading-relaxed">{t("products.embio6000.purpose")}</p></CardContent>
      </Card>
      <Card className="border border-border/50 shadow-card animate-fade-in">
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Beaker className="h-4 w-4 text-primary" />{t("products.embio6000.prepTitle")}</CardTitle></CardHeader>
        <CardContent><ul className="space-y-2 text-sm text-muted-foreground">
          {[1,2,3].map(i => (<li key={i} className="flex items-start gap-2"><span className="text-primary font-bold mt-0.5">{i}.</span>{t(`products.embio6000.step${i}`)}</li>))}
        </ul></CardContent>
      </Card>
      <Card className="border-destructive/30 bg-destructive/5 shadow-card animate-fade-in">
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2 text-destructive"><AlertTriangle className="h-4 w-4" />{t("products.embio6000.attentionTitle")}</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-muted-foreground leading-relaxed">{t("products.embio6000.attentionText")}</p></CardContent>
      </Card>
      <CalculatorCard title={t("products.embio6000.calcTitle")} description={t("products.embio6000.calcDesc")} inputLabel={t("products.embio6000.calcInput")} inputPlaceholder={t("products.embio6000.calcPlaceholder")}
        calculate={(value) => { const frascos = Math.ceil(value / 1000); return { frascos, porAplicacao: Math.ceil(frascos / 2), frequencia: t("calculator.freq10days"), detalhes: t("products.embio6000.calcResult", { value: value.toLocaleString("pt-BR"), frascos }) }; }}
        icon={<Calculator className="h-5 w-5" />} productName="EMBIO 6000" />
      <p className="text-[11px] text-muted-foreground/60 text-center">{t("common.footer")}</p>
    </div>
  );
};
export default Embio6000;
