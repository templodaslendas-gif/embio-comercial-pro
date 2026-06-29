import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchRealMetrics,
  fetchChartData,
  fetchCategoriaData,
  type FinanceiroMovimentacao,
  type MovTipo,
} from "@/lib/financeiroQueries";
import { fetchFinanceiroMetrics } from "@/lib/orcamentosComercialQueries";
import { useBranding } from "@/hooks/useBranding";
import { MovimentacaoModal } from "@/components/financeiro/MovimentacaoModal";
import { MovimentacoesTab } from "@/components/financeiro/MovimentacoesTab";
import {
  PremiumHeader,
  PremiumSection,
  PremiumCard,
  PremiumChartCard,
} from "@/components/premium";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { toast } from "sonner";
import {
  BarChart3,
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Banknote,
  Percent,
  Save,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const pct = (v: number) => `${v.toFixed(1)}%`;
const PIE_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
];

export default function FinanceiroDashboard() {
  const { branding, save } = useBranding();
  const [tab, setTab] = useState("painel");
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<FinanceiroMovimentacao | null>(null);
  const [defaultTipo, setDefaultTipo] = useState<MovTipo>("entrada");
  const [metaInput, setMetaInput] = useState("");
  const [savingMeta, setSavingMeta] = useState(false);

  const { data: realMetrics, isLoading: loadingMetrics } = useQuery({
    queryKey: ["financeiro-real-metrics"],
    queryFn: fetchRealMetrics,
    refetchInterval: 60_000,
  });

  const { data: orcMetrics } = useQuery({
    queryKey: ["financeiro-metrics"],
    queryFn: fetchFinanceiroMetrics,
  });

  const { data: chartData = [] } = useQuery({
    queryKey: ["financeiro-chart"],
    queryFn: fetchChartData,
  });

  const { data: catData = [] } = useQuery({
    queryKey: ["financeiro-cat"],
    queryFn: fetchCategoriaData,
  });

  const metaMensal = Number(branding.meta_mensal ?? 0);
  const progressMeta =
    metaMensal > 0 && realMetrics
      ? Math.min(100, (realMetrics.saldoRealizado / metaMensal) * 100)
      : 0;

  const handleSaveMeta = async () => {
    const v = parseFloat(metaInput.replace(",", "."));
    if (isNaN(v) || v < 0) { toast.error("Valor inválido"); return; }
    setSavingMeta(true);
    const { error } = await save({ meta_mensal: v });
    setSavingMeta(false);
    if (error) toast.error("Erro ao salvar meta");
    else { toast.success("Meta salva"); setMetaInput(""); }
  };

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

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-2 w-full max-w-xs">
          <TabsTrigger value="painel">Painel</TabsTrigger>
          <TabsTrigger value="movimentacoes">Movimentações</TabsTrigger>
        </TabsList>

        {/* TAB: PAINEL */}
        <TabsContent value="painel" className="space-y-6 mt-4">
          {/* Métricas reais */}
          {loadingMetrics ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-2xl" />
              ))}
            </div>
          ) : realMetrics ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <PremiumCard className="p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-green-500/15 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <p className="text-xl font-bold tabular-nums text-foreground">
                  {brl(realMetrics.totalEntradas)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Total Entradas</p>
              </PremiumCard>
              <PremiumCard className="p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-500/15 mb-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </div>
                <p className="text-xl font-bold tabular-nums text-foreground">
                  {brl(realMetrics.totalSaidas)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Total Saídas</p>
              </PremiumCard>
              <PremiumCard
                className={cn(
                  "p-4",
                  realMetrics.saldoPrevisto >= 0
                    ? "ring-1 ring-green-500/20"
                    : "ring-1 ring-red-500/20",
                )}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 mb-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                </div>
                <p
                  className={cn(
                    "text-xl font-bold tabular-nums",
                    realMetrics.saldoPrevisto >= 0
                      ? "text-green-700 dark:text-green-400"
                      : "text-red-700 dark:text-red-400",
                  )}
                >
                  {brl(realMetrics.saldoPrevisto)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Saldo Previsto</p>
              </PremiumCard>
              <PremiumCard className="p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/15 mb-2">
                  <Banknote className="h-4 w-4 text-accent" />
                </div>
                <p className="text-xl font-bold tabular-nums text-foreground">
                  {brl(realMetrics.saldoRealizado)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Saldo Realizado</p>
              </PremiumCard>
              <PremiumCard className="p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 mb-2">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                </div>
                <p className="text-xl font-bold tabular-nums text-foreground">
                  {brl(realMetrics.contasPendentes)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Pendente ({realMetrics.countPendentes})
                </p>
              </PremiumCard>
              <PremiumCard className="p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-500/15 mb-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                </div>
                <p className="text-xl font-bold tabular-nums text-foreground">
                  {brl(realMetrics.contasVencidas)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Vencido ({realMetrics.countVencidas})
                </p>
              </PremiumCard>
              {orcMetrics && (
                <>
                  <PremiumCard className="p-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/15 mb-2">
                      <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                    </div>
                    <p className="text-xl font-bold tabular-nums text-foreground">
                      {brl(orcMetrics.totalAprovado)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">Propostas Aprovadas</p>
                  </PremiumCard>
                  <PremiumCard className="p-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted/60 mb-2">
                      <Percent className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-xl font-bold tabular-nums text-foreground">
                      {pct(orcMetrics.taxaConversao)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">Taxa de Conversão</p>
                  </PremiumCard>
                </>
              )}
            </div>
          ) : null}

          {/* Meta mensal progress */}
          {metaMensal > 0 && realMetrics && (
            <PremiumCard className="p-5">
              <div className="flex justify-between text-sm mb-3">
                <span className="text-muted-foreground font-medium">
                  Meta Mensal:{" "}
                  <strong className="text-foreground">{brl(metaMensal)}</strong>
                </span>
                <span className="text-muted-foreground">
                  Realizado:{" "}
                  <strong className="text-foreground">
                    {brl(realMetrics.saldoRealizado)}
                  </strong>
                </span>
              </div>
              <Progress value={progressMeta} className="h-3" />
              <p className="text-right text-xs text-muted-foreground mt-1.5">
                {pct(progressMeta)} atingido
              </p>
            </PremiumCard>
          )}

          {/* Gráficos */}
          {chartData.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
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
                      <Bar
                        dataKey="entradas"
                        name="Entradas"
                        fill="#10b981"
                        radius={[3, 3, 0, 0]}
                      />
                      <Bar
                        dataKey="saidas"
                        name="Saídas"
                        fill="#ef4444"
                        radius={[3, 3, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </PremiumChartCard>
              <PremiumChartCard
                title="Saldo Mensal"
                subtitle="Evolução"
                icon={TrendingUp}
              >
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartData}
                      margin={{ top: 4, right: 4, left: 4, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="saldoGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="0%"
                            stopColor="hsl(var(--accent))"
                            stopOpacity={0.4}
                          />
                          <stop
                            offset="100%"
                            stopColor="hsl(var(--accent))"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="mes"
                        tick={{ fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        formatter={(v: number) => brl(v)}
                        contentStyle={{ borderRadius: 8, fontSize: 12 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="saldo"
                        name="Saldo"
                        stroke="hsl(var(--accent))"
                        strokeWidth={2}
                        fill="url(#saldoGrad)"
                        dot={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </PremiumChartCard>
            </div>
          )}

          {catData.length > 0 && (
            <PremiumChartCard
              title="Por Categoria"
              subtitle="Distribuição de valores"
              icon={DollarSign}
            >
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={catData}
                      dataKey="valor"
                      nameKey="categoria"
                      cx="40%"
                      cy="50%"
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {catData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={PIE_COLORS[i % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: number) => brl(v)}
                      contentStyle={{ borderRadius: 8, fontSize: 11 }}
                    />
                    <Legend
                      layout="vertical"
                      align="right"
                      verticalAlign="middle"
                      wrapperStyle={{ fontSize: 11 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </PremiumChartCard>
          )}

          {/* Configurar Meta */}
          <PremiumSection label="Meta Mensal">
            <PremiumCard className="p-5">
              <p className="text-sm text-muted-foreground mb-3">
                Meta de saldo mensal realizado.
              </p>
              <div className="flex gap-3 items-end max-w-sm">
                <div className="flex-1 space-y-1.5">
                  <Label>Meta (R$)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="100"
                    placeholder={metaMensal > 0 ? String(metaMensal) : "Ex: 50000"}
                    value={metaInput}
                    onChange={(e) => setMetaInput(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleSaveMeta}
                  disabled={savingMeta || !metaInput}
                >
                  {savingMeta && (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  )}
                  <Save className="h-4 w-4 mr-1.5" /> Salvar
                </Button>
              </div>
            </PremiumCard>
          </PremiumSection>
        </TabsContent>

        {/* TAB: MOVIMENTAÇÕES */}
        <TabsContent value="movimentacoes" className="mt-4">
          <MovimentacoesTab onEdit={openEdit} onNew={openNew} />
        </TabsContent>
      </Tabs>

      {/* Modal de criação/edição */}
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
