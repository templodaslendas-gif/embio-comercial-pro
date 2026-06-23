import { useTranslation } from "react-i18next";
import { Cog, Zap, Gauge, Droplets, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Propulsor3CV = () => {
  const { t } = useTranslation();
  const specs = [
    { label: t("propulsors.power"), value: "3 CV", icon: Zap },
    { label: t("propulsors.capacity"), value: t("propulsors.p3cv.capacity"), icon: Gauge },
    { label: t("propulsors.application"), value: t("propulsors.swineManure"), icon: Droplets },
  ];
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"><Cog className="h-5 w-5 text-primary" /></div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">{t("propulsors.p3cv.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("propulsors.p3cv.subtitle")}</p>
          </div>
        </div>
      </div>
      <Alert variant="destructive" className="border-destructive/30 bg-destructive/10"><AlertTriangle className="h-4 w-4" /><AlertDescription className="text-sm font-medium">{t("propulsors.warning3to5")}</AlertDescription></Alert>
      <div className="space-y-3">{specs.map((spec, i) => (
        <Card key={spec.label} className="border border-border/50 shadow-card animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10"><spec.icon className="h-4 w-4 text-primary" /></div><span className="text-sm font-medium text-foreground">{spec.label}</span></div>
            <span className="text-sm font-semibold text-primary">{spec.value}</span>
          </CardContent>
        </Card>
      ))}</div>
      <p className="text-[11px] text-muted-foreground/60 text-center">{t("common.specsFooter")}</p>
    </div>
  );
};
export default Propulsor3CV;
