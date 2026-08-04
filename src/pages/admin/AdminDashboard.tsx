import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ShieldCheck, Users, UserX, UserCheck2, Receipt, Clock, CheckCircle2,
  FolderCheck, Wallet, TrendingUp, Target, GitBranch, Trophy, AlertTriangle,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell,
} from "recharts";
import { fetchOrcamentos } from "@/lib/orcamentosComercialQueries";
import { fetchVendedoresOverview } from "@/lib/adminQueries";
import { buildMonthlyChartData, buildFunilData, buildParadasBuckets, computePropostaStats } from "@/lib/adminMetrics";
import {
  PremiumPage, PremiumSection, PremiumHeader, PremiumChartCard, PremiumStat,
  PremiumEmptyState,
} from "@/components/premium";

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const chartTooltip = {
  contentStyle: { background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 13 },
  labelStyle: { color: "hsl(var(--foreground))", fontWeight: 600 },
};

export default function AdminDashboard() {
  const { data: vendedores = [], isLoading: vendLoading } = useQuery({
    queryKey: ["admin", "vendedores-overview"],
    queryFn: fetchVendedoresOverview,
    staleTime: 60 * 1000,
  });
  const { data: orcamentos = [], isLoading: orcLoading } = useQuery({
    queryKey: ["admin", "orcamentos-todos"],
    queryFn: fetchOrcamentos,
    staleTime: 60 * 1000,
  });

  const loading = vendLoading || orcLoading;

  const vendedorStats = useMemo(() => ({
    ativos: vendedores.filter((v) => v.status === "ativo").length,
    bloqueados: vendedores.filter((v) => v.status === "bloqueado").length,
    desligados: vendedores.filter((v) => v.status === "desligado").length,
  }), [vendedores]);

  const clientesCount = useMemo(
    () => vendedores.reduce((sum, v) => sum + v.clientes_count, 0),
    [vendedores],
  );

  const propostaStats = useMemo(() => computePropostaStats(orcamentos), [orcamentos]);
  const porMes = useMemo(() => buildMonthlyChartData(orcamentos, 6), [orcamentos]);
  const funilData = useMemo(() => buildFunilData(orcamentos), [orcamentos]);
  const propostasParadas = useMemo(() => buildParadasBuckets(orcamentos), [orcamentos]);

  const ranking = useMemo(
    () => [...vendedores].sort((a, b) => b.valor_vendido - a.valor_vendido).slice(0, 6),
    [vendedores],
  );

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 py-1 animate-pulse">
        <div className="h-20 rounded-xl border border-border bg-muted/25" />
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 rounded-xl border border-border bg-muted/25" />)}
        </div>
        <div className="h-64 rounded-xl border border-border bg-muted/25" />
      </div>
    );
  }

  return (
    <PremiumPage>
      <div className="max-w-6xl mx-auto space-y-8">
        <PremiumHeader
          icon={ShieldCheck}
          badge="Super Admin"
          title="Painel Administrativo"
          subtitle="Visão consolidada de vendedores, propostas e desempenho comercial."
        />

        <PremiumSection label="Vendedores">
          <div className="grid gap-3 grid-cols-3">
            <PremiumStat label="Ativos" value={vendedorStats.ativos} icon={UserCheck2} variant="green" />
            <PremiumStat label="Bloqueados" value={vendedorStats.bloqueados} icon={Users} variant="orange" />
            <PremiumStat label="Desligados" value={vendedorStats.desligados} icon={UserX} variant="default" />
          </div>
        </PremiumSection>

        <PremiumSection label="Propostas Comerciais">
          <div className="grid gap-3 grid-cols-2 md:grid-cols-5">
            <PremiumStat label="Clientes cadastrados" value={clientesCount} icon={Users} variant="blue" />
            <PremiumStat label="Total de propostas" value={propostaStats.total} icon={Receipt} variant="default" />
            <PremiumStat label="Em aberto" value={propostaStats.em_aberto} icon={Clock} variant="orange" />
            <PremiumStat label="Aprovadas" value={propostaStats.aprovado} icon={CheckCircle2} variant="green" />
            <PremiumStat label="Finalizadas" value={propostaStats.finalizado} icon={FolderCheck} variant="teal" />
          </div>
        </PremiumSection>

        <PremiumSection label="Indicadores Financeiros" description="Derivados somente de orçamentos/propostas — sem financeiro privado do vendedor">
          <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
            <PremiumStat label="Valor total orçado" value={Math.round(propostaStats.valorOrcado)} icon={Wallet} variant="default" suffix="" />
            <PremiumStat label="Valor total vendido" value={Math.round(propostaStats.valorVendido)} icon={TrendingUp} variant="green" />
            <PremiumStat label="Ticket médio" value={Math.round(propostaStats.ticketMedio)} icon={Target} variant="blue" />
            <PremiumStat label="Taxa de conversão" value={Math.round(propostaStats.conversao)} icon={GitBranch} variant="teal" suffix="%" />
          </div>
          <p className="text-sm text-muted-foreground/70">
            {brl(propostaStats.valorOrcado)} orçado · {brl(propostaStats.valorVendido)} vendido · ticket médio {brl(propostaStats.ticketMedio)}
          </p>
        </PremiumSection>

        <PremiumSection label="Análise Comercial">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <PremiumChartCard title="Propostas por Mês" subtitle="Últimos 6 meses" icon={Receipt}>
              {orcamentos.length === 0 ? (
                <PremiumEmptyState icon={Receipt} title="Sem propostas ainda" description="O gráfico aparece conforme propostas forem criadas." size="sm" />
              ) : (
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={porMes} margin={{ top: 6, right: 4, left: 4, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} allowDecimals={false} width={28} />
                      <Tooltip {...chartTooltip} formatter={(value: number) => [`${value} propostas`, ""]} />
                      <Bar dataKey="propostas" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} isAnimationActive animationDuration={600} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </PremiumChartCard>

            <PremiumChartCard title="Valor Vendido por Mês" subtitle="Aprovadas + finalizadas · últimos 6 meses" icon={TrendingUp}>
              {propostaStats.valorVendido === 0 ? (
                <PremiumEmptyState icon={TrendingUp} title="Sem vendas ainda" description="O gráfico aparece conforme propostas forem aprovadas." size="sm" />
              ) : (
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={porMes} margin={{ top: 6, right: 4, left: 4, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={40} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                      <Tooltip {...chartTooltip} formatter={(value: number) => [brl(value), "Vendido"]} />
                      <Bar dataKey="valorVendido" fill="hsl(120, 55%, 40%)" radius={[6, 6, 0, 0]} isAnimationActive animationDuration={600} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </PremiumChartCard>
          </div>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <PremiumChartCard title="Funil Comercial" subtitle="Distribuição por status" icon={GitBranch}>
              {propostaStats.total === 0 ? (
                <PremiumEmptyState icon={GitBranch} title="Sem propostas ainda" description="" size="sm" />
              ) : (
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={funilData} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
                      <XAxis type="number" hide allowDecimals={false} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={80} />
                      <Tooltip {...chartTooltip} formatter={(value: number) => [`${value} propostas`, ""]} />
                      <Bar dataKey="value" radius={[0, 6, 6, 0]} isAnimationActive animationDuration={600}>
                        {funilData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </PremiumChartCard>

            <PremiumChartCard title="Propostas Paradas" subtitle="Em aberto, por dias sem atualização" icon={AlertTriangle}>
              {propostasParadas.every((b) => b.value === 0) ? (
                <PremiumEmptyState icon={AlertTriangle} title="Nenhuma proposta parada" description="Todas as propostas em aberto foram atualizadas recentemente." size="sm" />
              ) : (
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={propostasParadas} margin={{ top: 6, right: 4, left: 4, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} allowDecimals={false} width={28} />
                      <Tooltip {...chartTooltip} formatter={(value: number) => [`${value} propostas`, ""]} />
                      <Bar dataKey="value" fill="hsl(38, 92%, 50%)" radius={[6, 6, 0, 0]} isAnimationActive animationDuration={600} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </PremiumChartCard>
          </div>

          <PremiumChartCard title="Ranking Inicial por Vendedor" subtitle="Top 6 · valor vendido" icon={Trophy}>
            {ranking.length === 0 || ranking.every((v) => v.valor_vendido === 0) ? (
              <PremiumEmptyState icon={Trophy} title="Sem vendas ainda" description="O ranking aparece conforme propostas forem aprovadas." size="sm" />
            ) : (
              <div className="space-y-2">
                {ranking.map((v, i) => (
                  <div key={v.user_id} className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{v.full_name || v.email || "Vendedor"}</p>
                        <p className="text-sm text-foreground/60">
                          {v.propostas_aprovadas + v.propostas_finalizadas} vendas · conv. {v.propostas_count > 0 ? Math.round(((v.propostas_aprovadas + v.propostas_finalizadas) / v.propostas_count) * 100) : 0}%
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold tabular-nums text-foreground shrink-0">{brl(v.valor_vendido)}</span>
                  </div>
                ))}
              </div>
            )}
          </PremiumChartCard>
        </PremiumSection>
      </div>
    </PremiumPage>
  );
}
