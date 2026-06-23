import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Cog, Zap, Gauge, Droplets } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const Propulsor75CV = () => {
  const [animal, setAnimal] = useState<string>("");
  const { t } = useTranslation();

  const specsByAnimal: Record<string, { label: string; value: string; icon: any }[]> = {
    suino: [
      { label: t("propulsors.power"), value: "7,5 CV", icon: Zap },
      { label: t("propulsors.capacity"), value: t("propulsors.p75cv.capacitySwine"), icon: Gauge },
      { label: t("propulsors.application"), value: t("propulsors.swineManure"), icon: Droplets },
    ],
    bovino: [
      { label: t("propulsors.power"), value: "7,5 CV", icon: Zap },
      { label: t("propulsors.capacity"), value: t("propulsors.p75cv.capacityBovine"), icon: Gauge },
      { label: t("propulsors.application"), value: t("propulsors.bovineManure"), icon: Droplets },
    ],
  };

  const specs = animal ? specsByAnimal[animal] : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"><Cog className="h-5 w-5 text-primary" /></div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">{t("propulsors.p75cv.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("propulsors.selectForSpecs")}</p>
          </div>
        </div>
      </div>
      <Card className="border border-border/50 shadow-card animate-fade-in">
        <CardContent className="p-4 space-y-2">
          <Label className="text-sm font-medium">{t("propulsors.wasteType")}</Label>
          <Select value={animal} onValueChange={setAnimal}>
            <SelectTrigger className="h-12 text-base bg-muted/30 border-border/50"><SelectValue placeholder={t("propulsors.selectWaste")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="suino">{t("propulsors.swine")}</SelectItem>
              <SelectItem value="bovino">{t("propulsors.bovine")}</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      {specs && (
        <div className="space-y-3 animate-fade-in">{specs.map((spec, i) => (
          <Card key={spec.label} className="border border-border/50 shadow-card animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10"><spec.icon className="h-4 w-4 text-primary" /></div><span className="text-sm font-medium text-foreground">{spec.label}</span></div>
              <span className="text-sm font-semibold text-primary">{spec.value}</span>
            </CardContent>
          </Card>
        ))}</div>
      )}
      <p className="text-[11px] text-muted-foreground/60 text-center">{t("common.specsFooter")}</p>
    </div>
  );
};
export default Propulsor75CV;
