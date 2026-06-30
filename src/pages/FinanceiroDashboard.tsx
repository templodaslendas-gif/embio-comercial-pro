import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchRealMetrics,
  fetchChartData,
  type FinanceiroMovimentacao,
  type MovTipo,
} from "@/lib/financeiroQueries";
import { MovimentacaoModal } from "@/components/financeiro/MovimentacaoModal";
import { MovimentacoesTab } from "@/components/financeiro/MovimentacoesTab";
import { PremiumHeader, PremiumCard, PremiumChartCard } from "@/components/premium";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  BarChart3, Plus, TrendingUp, TrendingDown, DollarSign, AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function FinanceiroDashboard() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<FinanceiroMovimentacao | null>(null);
  const [defaultTipo, setDefaultTipo] = useState<MovTipo>("entrada");

  const { data: metrics, isLoading } = useQuery({
    queryKey: ["financeiro-real-metrics"],
    queryFn: fetchRealMetrics,
    refetchInterval: 60_000,
  });

  const { data: chartData = [] } = useQuery({
    queryKey: ["financeiro-chart"],
    queryFn: fetchChartData,
  });

  const openNew = (tipo: MovTipo) => {
    setEditItem(null);
    setDefaultTipo(tipo);
    setModalOpen(true);
  };

  const openEdit = (item: FinanceiroMovimentacao) => {
    setEditItem(item);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PremiumHeader
        icon={BarChart3}
        badge="Módulo Comercial"
        title="Financeiro"
        subtitle="Controle de entradas, saídas e indicadores"
        variant="gradient"
        action={
          <div className="flex gap-2">
            <Button
              onClick={() => openNew("entrada")}
              size="sm"
              className="bg-white/15 hover:bg-white/25 text-white border border-white/20 font-semibold"
            >
              <Plus className="h-4 w-4 mr-1" /> Entrada
            </Button>
            <Button
              onClick={() => openNew("saida")}
              size="sm"
              className="bg-white/15 hover:bg-white/25 text-white border border-white/20 font-semibold"
            >
              <Plus className="h-4 w-4 mr-1" /> Saída
            </Button>
          </div>
        }
      />

      {/* 4 Cards principais */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : metrics ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Saldo Atual — destaque com cor dinâmica */}
          <div
            className={cn(
              "rounded-2xl border p-4",
              metrics.saldoRealizado >= 0
                ? "bg-green-500/10 border-green-500/30"
                : "bg-red-500/10 border-red-500/30",
            )}
          >
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-xl mb-2",
                metrics.saldoRealizado >= 0 ? "bg-green-500/20" : "bg-red-500/20",
              )}
            >
              <DollarSign
                className={cn(
                  "h-4 w-4",
                  metrics.saldoRealizado >= 0 ? "text-green-600" : "text-red-600",
                )}
              />
            </div>
            <p
              className={cn(
                "text-2xl font-bold tabular-nums",
                metrics.saldoRealizado >= 0
                  ? "text-green-700 dark:text-green-400"
                  : "text-red-700 dark:text-red-400",
              )}
            >
              {brl(metrics.saldoRealizado)}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Saldo Atual</p>
          </div>

          {/* Entradas do Mês */}
          <PremiumCard className="p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-green-500/15 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-xl font-bold tabular-nums text-foreground">
              {brl(metrics.entradasMes)}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Entradas do Mês</p>
          </PremiumCard>

          {/* Saídas do Mês */}
          <PremiumCard className="p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-500/15 mb-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
            </div>
            <p className="text-xl font-bold tabular-nums text-foreground">
              {brl(metrics.saidasMes)}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Saídas do Mês</p>
          </PremiumCard>

          {/* Pendente do Mês */}
          <PremiumCard className="p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 mb-2">
              <AlertCircle className="h-4 w-4 text-amber-600" />
            </div>
            <p className="text-xl font-bold tabular-nums text-foreground">
              {brl(metrics.pendentesMes)}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Pendente do Mês</p>
          </PremiumCard>
        </div>
      ) : null}

      {/* Gráfico Entradas x Saídas (só exibe se tiver dados) */}
      {chartData.length > 0 && (
        <PremiumChartCard
          title="Entradas x Saídas"
          subtitle="Últimos 6 meses"
          icon={BarChart3}
        >
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 4, right: 4, left: 4, bottom: 0 }}
              >
                <XAxis
                  dataKey="mes"
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(v: number) => brl(v)}
                  contentStyle={{ borderRadius: 8, fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="entradas" name="Entradas" fill="#10b981" radius={[3, 3, 0, 0]} />
                <Bar dataKey="saidas" name="Saídas" fill="#ef4444" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </PremiumChartCard>
      )}

      {/* Tabela de Movimentações com filtros e ações */}
      <MovimentacoesTab onEdit={openEdit} onNew={openNew} />

      <MovimentacaoModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditItem(null);
        }}
        editItem={editItem}
        defaultTipo={defaultTipo}
      />
    </div>
  );
}
