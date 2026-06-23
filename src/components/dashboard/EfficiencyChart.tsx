import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { dia: "Dia 1", eficiencia: 15 },
  { dia: "Dia 5", eficiencia: 32 },
  { dia: "Dia 10", eficiencia: 55 },
  { dia: "Dia 15", eficiencia: 72 },
  { dia: "Dia 20", eficiencia: 85 },
  { dia: "Dia 25", eficiencia: 91 },
  { dia: "Dia 30", eficiencia: 94 },
];

export function EfficiencyChart() {
  return (
    <Card className="border border-border/50 shadow-card animate-fade-in">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Eficiência de Decomposição
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Curva de desempenho ao longo de 30 dias
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="gradientEficiencia" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(152, 55%, 28%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(152, 55%, 28%)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(145, 15%, 88%)" />
              <XAxis
                dataKey="dia"
                tick={{ fontSize: 11, fill: "hsl(150, 10%, 45%)" }}
                axisLine={{ stroke: "hsl(145, 15%, 88%)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(150, 10%, 45%)" }}
                axisLine={false}
                tickLine={false}
                unit="%"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(0, 0%, 100%)",
                  border: "1px solid hsl(145, 15%, 88%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value: number) => [`${value}%`, "Eficiência"]}
              />
              <Area
                type="monotone"
                dataKey="eficiencia"
                stroke="hsl(152, 55%, 28%)"
                strokeWidth={2.5}
                fill="url(#gradientEficiencia)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
