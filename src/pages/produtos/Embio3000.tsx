import { useTranslation } from "react-i18next";
import { Droplets, Calculator, Beaker, Info } from "lucide-react";
import { CalculatorCard } from "@/components/calculators/CalculatorCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Embio3000 = () => {
  const { t } = useTranslation();
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"><Droplets className="h-5 w-5 text-primary" /></div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">EMBIO 3000</h1>
            <p className="text-sm text-muted-foreground">{t("products.embio3000.subtitle")}</p>
          </div>
        </div>
      </div>
      <Card className="border border-border/50 shadow-card animate-fade-in">
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Info className="h-4 w-4 text-primary" />{t("products.embio3000.whatFor")}</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-muted-foreground leading-relaxed">{t("products.embio3000.purpose")}</p></CardContent>
      </Card>
      <Card className="border border-border/50 shadow-card animate-fade-in">
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Beaker className="h-4 w-4 text-primary" />{t("products.embio3000.prepTitle")}</CardTitle></CardHeader>
        <CardContent><ul className="space-y-2 text-sm text-muted-foreground">
          {[1,2,3,4,5].map(i => (<li key={i} className="flex items-start gap-2"><span className="text-primary font-bold mt-0.5">{i}.</span>{t(`products.embio3000.step${i}`)}</li>))}
        </ul></CardContent>
      </Card>
      <CalculatorCard title={t("products.embio3000.calcTitle")} description={t("products.embio3000.calcDesc")} inputLabel={t("products.embio3000.calcInput")} inputPlaceholder={t("products.embio3000.calcPlaceholder")}
        calculate={(value) => { const frascos = Math.ceil(value / 700); return { frascos, porAplicacao: Math.ceil(frascos / 2), frequencia: t("calculator.freq15days"), detalhes: t("products.embio3000.calcResult", { value: value.toLocaleString("pt-BR"), frascos }) }; }}
        icon={<Calculator className="h-5 w-5" />} productName="EMBIO 3000" />
      <p className="text-[11px] text-muted-foreground/60 text-center">{t("common.footer")}</p>
    </div>
  );
};
export default Embio3000;
