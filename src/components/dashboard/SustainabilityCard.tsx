import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bug, ShieldCheck, TrendingDown } from "lucide-react";

const impacts = [
  {
    icon: Bug,
    label: "Redução de Moscas",
    value: "87%",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: TrendingDown,
    label: "Redução de Larvas",
    value: "92%",
    color: "text-embio-lime",
    bg: "bg-embio-lime/10",
  },
  {
    icon: ShieldCheck,
    label: "Redução de Odores",
    value: "78%",
    color: "text-embio-light",
    bg: "bg-embio-light/10",
  },
];

export function SustainabilityCard() {
  return (
    <Card className="border border-border/50 shadow-card animate-fade-in" style={{ animationDelay: "100ms" }}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Impacto Sustentável
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Resultados comprovados em campo
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {impacts.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-4 rounded-xl bg-muted/40 p-3.5 transition-colors hover:bg-muted/60"
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.bg}`}
            >
              <item.icon className={`h-5 w-5 ${item.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                {item.label}
              </p>
            </div>
            <span className="text-xl font-bold text-foreground">
              {item.value}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
