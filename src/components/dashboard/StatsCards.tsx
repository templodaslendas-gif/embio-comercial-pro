import { FlaskConical, Users, Droplets, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const stats = [
  {
    label: "Produtos Ativos",
    value: "5",
    icon: FlaskConical,
    change: "+2 novos",
    delay: "0ms",
  },
  {
    label: "Animais Tratados",
    value: "50k+",
    icon: Users,
    change: "Referência",
    delay: "100ms",
  },
  {
    label: "Litros Processados",
    value: "2.1M",
    icon: Droplets,
    change: "Mensal",
    delay: "200ms",
  },
  {
    label: "Eficiência",
    value: "94%",
    icon: TrendingUp,
    change: "↑ 12%",
    delay: "300ms",
  },
];

export function StatsCards() {
  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className="border border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in"
          style={{ animationDelay: stat.delay }}
        >
          <CardContent className="p-4 md:p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <stat.icon className="h-4 w-4 text-primary" />
              </div>
              <span className="text-[10px] font-medium text-embio-lime bg-embio-lime/10 px-2 py-0.5 rounded-full">
                {stat.change}
              </span>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
              {stat.value}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
