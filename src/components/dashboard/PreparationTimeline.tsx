import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Beaker, Droplets, Timer, Sprout, CheckCircle2 } from "lucide-react";

const steps = [
  {
    icon: Beaker,
    title: "Diluição",
    description: "Dilua 1 frasco do produto em 10 litros de água limpa sem cloro.",
    time: "5 min",
  },
  {
    icon: Timer,
    title: "Ativação",
    description: "Deixe descansar por 30 minutos para ativação dos microrganismos.",
    time: "30 min",
  },
  {
    icon: Droplets,
    title: "Aplicação",
    description: "Aplique uniformemente sobre a área de tratamento ou no sistema.",
    time: "10 min",
  },
  {
    icon: Sprout,
    title: "Ação Biológica",
    description:
      "Os microrganismos começam a decompor a matéria orgânica em 24-48h.",
    time: "48h",
  },
  {
    icon: CheckCircle2,
    title: "Resultado",
    description:
      "Redução visível de odores e moscas. Repita conforme frequência indicada.",
    time: "Contínuo",
  },
];

export function PreparationTimeline() {
  return (
    <Card className="border border-border/50 shadow-card animate-fade-in" style={{ animationDelay: "200ms" }}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Modo de Preparo
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Passo a passo para aplicação dos produtos Embio
        </p>
      </CardHeader>
      <CardContent>
        <div className="relative ml-4 space-y-0">
          {steps.map((step, index) => (
            <div key={step.title} className="relative flex gap-4 pb-6 last:pb-0">
              {/* Vertical line */}
              {index < steps.length - 1 && (
                <div className="absolute left-[15px] top-[40px] h-[calc(100%-24px)] w-[2px] bg-border" />
              )}
              {/* Circle */}
              <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-2 ring-background">
                <step.icon className="h-3.5 w-3.5 text-primary" />
              </div>
              {/* Content */}
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className="text-sm font-semibold text-foreground">
                    {step.title}
                  </h4>
                  <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {step.time}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
