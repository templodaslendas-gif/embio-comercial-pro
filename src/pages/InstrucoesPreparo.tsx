import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, AlertTriangle } from "lucide-react";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

const InstrucoesPreparo = () => {
  const { t } = useTranslation();

  const productDetails = [
    {
      name: "EMBIO 3100",
      purpose: t("products.embio3100.purpose"),
      preparo: [
        t("products.embio3100.step1"), t("products.embio3100.step2"), t("products.embio3100.step3"),
        t("products.embio3100.step4"), t("products.embio3100.step5"),
      ],
    },
    {
      name: "EMBIO 3000",
      purpose: t("products.embio3000.purpose"),
      preparo: [
        t("products.embio3000.step1"), t("products.embio3000.step2"), t("products.embio3000.step3"),
        t("products.embio3000.step4"), t("products.embio3000.step5"),
      ],
    },
    {
      name: "EMBIO 6000",
      purpose: t("products.embio6000.purpose"),
      preparo: [
        t("products.embio6000.step1"), t("products.embio6000.step2"), t("products.embio6000.step3"),
      ],
    },
    {
      name: "EMBIO 5000+",
      purpose: t("products.embio5000.purpose"),
      preparo: [
        t("products.embio5000.step1"), t("products.embio5000.step2"), t("products.embio5000.step3"),
      ],
    },
    {
      name: "EMBIO 8000",
      purpose: t("products.embio8000.purpose"),
      preparo: [
        t("products.embio8000.step1"), t("products.embio8000.step2"), t("products.embio8000.step3"),
        t("products.embio8000.step4"), t("products.embio8000.step5"),
      ],
    },
  ];

  const warnings = [
    t("instructions.warning1"), t("instructions.warning2"), t("instructions.warning3"), t("instructions.warning4"),
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">{t("instructions.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("instructions.subtitle")}</p>
          </div>
        </div>
      </div>

      <Card className="border border-border/50 shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t("instructions.productsTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {productDetails.map((product) => (
              <AccordionItem key={product.name} value={product.name}>
                <AccordionTrigger className="text-sm font-medium">{product.name}</AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-primary mb-1">{t("instructions.purpose")}</p>
                    <p className="text-sm text-muted-foreground">{product.purpose}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-primary mb-1">{t("instructions.preparation")}</p>
                    <ul className="space-y-1">
                      {product.preparo.map((step, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary font-bold mt-0.5">{i + 1}.</span>{step}
                        </li>
                      ))}
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <Card className="border-destructive/30 bg-destructive/5 shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />{t("instructions.warnings")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {warnings.map((w) => (
              <li key={w} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-destructive mt-1">•</span>{w}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <p className="text-[11px] text-muted-foreground/60 text-center">{t("common.footer")}</p>
    </div>
  );
};

export default InstrucoesPreparo;
