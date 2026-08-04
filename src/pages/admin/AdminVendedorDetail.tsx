import { useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, ShieldCheck, Loader2, Receipt, TrendingUp, Target, GitBranch,
  AlertTriangle, Users, MapPin, Phone, Mail, CalendarDays,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { fetchVendedoresOverview, fetchVendedorClientes, fetchVendedorOrcamentos } from "@/lib/adminQueries";
import { buildMonthlyChartData, buildParadasBuckets, computePropostaStats } from "@/lib/adminMetrics";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  PremiumPage, PremiumSection, PremiumChartCard, PremiumStat, PremiumEmptyState,
} from "@/components/premium";
import { VendedorActionsMenu } from "@/components/admin/VendedorActionsMenu";
import { EditVendedorDialog } from "@/components/admin/EditVendedorDialog";
import { cn } from "@/lib/utils";

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const chartTooltip = {
  contentStyle: { background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 13 },
  labelStyle: { color: "hsl(var(--foreground))", fontWeight: 600 },
};

const STATUS_CFG: Record<string, { label: string; className: string }> = {
  ativo:     { label: "Ativo",     className: "bg-accent/15 text-accent border border-accent/30" },
  bloqueado: { label: "Bloqueado", className: "bg-amber-500/15 text-amber-700 border border-amber-500/30" },
  desligado: { label: "Desligado", className: "bg-muted text-muted-foreground border border-border/60" },
};

function initials(name: string | null, email: string | null): string {
  const base = name || email || "?";
  return base.split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export default function AdminVendedorDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);

  const { data: vendedores = [], isLoading: vendLoading } = useQuery({
    queryKey: ["admin", "vendedores-overview"],
    queryFn: fetchVendedoresOverview,
    staleTime: 60 * 1000,
  });
  const vendedor = vendedores.find((v) => v.user_id === id);

  const { data: clientes = [], isLoading: clientesLoading } = useQuery({
    queryKey: ["admin", "vendedor-clientes", id],
    queryFn: () => fetchVendedorClientes(id as string),
    enabled: !!id,
  });
  const { data: orcamentos = [], isLoading: orcLoading } = useQuery({
    queryKey: ["admin", "vendedor-orcamentos", id],
    queryFn: () => fetchVendedorOrcamentos(id as string),
    enabled: !!id,
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin", "vendedores-overview"] });
    qc.invalidateQueries({ queryKey: ["admin", "vendedor-clientes", id] });
    qc.invalidateQueries({ queryKey: ["admin", "vendedor-orcamentos", id] });
  };

  const stats = useMemo(() => computePropostaStats(orcamentos), [orcamentos]);
  const porMes = useMemo(() => buildMonthlyChartData(orcamentos, 6), [orcamentos]);
  const paradas = useMemo(() => buildParadasBuckets(orcamentos), [orcamentos]);

  const loading = vendLoading || clientesLoading || orcLoading;

  if (vendLoading) {
    return (
      <div className="max-w-5xl mx-auto py-16 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!vendedor) {
    return (
      <PremiumPage>
        <PremiumEmptyState
          icon={Users}
          title="Vendedor não encontrado"
          description="Verifique se o link está correto ou volte para a lista."
          action={
            <Link to="/admin/vendedores" className="text-sm font-medium text-accent hover:underline">
              Voltar para Vendedores
            </Link>
          }
        />
      </PremiumPage>
    );
  }

  const cfg = STATUS_CFG[vendedor.status] ?? STATUS_CFG.ativo;

  return (
    <PremiumPage>
      <div className="max-w-5xl mx-auto space-y-6">
        <button
          onClick={() => navigate("/admin/vendedores")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar para Vendedores
        </button>

        <div className="rounded-xl border border-border/60 bg-card p-5 flex flex-col md:flex-row md:items-center gap-4 md:justify-between">
          <div className="flex items-center gap-4 min-w-0">
            <Avatar className="h-14 w-14 shrink-0">
              {vendedor.foto_url && <AvatarImage src={vendedor.foto_url} alt="" />}
              <AvatarFallback className="text-lg font-semibold">{initials(vendedor.full_name, vendedor.email)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-lg font-bold text-foreground truncate">{vendedor.full_name || "Sem nome"}</p>
                {vendedor.role === "super_admin" && <ShieldCheck className="h-4 w-4 text-accent" aria-label="Super Admin" />}
                <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", cfg.className)}>{cfg.label}</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-sm text-foreground/60">
                {vendedor.email && <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{vendedor.email}</span>}
                {vendedor.telefone && <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{vendedor.telefone}</span>}
                {(vendedor.cidade || vendedor.estado) && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />{[vendedor.cidade, vendedor.estado].filter(Boolean).join(" · ")}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Desde {new Date(vendedor.created_at).toLocaleDateString("pt-BR")}
                </span>
              </div>
            </div>
          </div>
          <VendedorActionsMenu
            vendedor={vendedor}
            currentUserId={user?.id}
            onEdit={() => setEditing(true)}
            onActionDone={refresh}
            hideViewDetails
          />
        </div>

        <PremiumSection label="Desempenho Comercial" description="Derivado somente de propostas — sem financeiro pessoal">
          <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
            <PremiumStat label="Clientes" value={clientes.length} icon={Users} variant="blue" />
            <PremiumStat label="Propostas" value={stats.total} icon={Receipt} variant="default" />
            <PremiumStat label="Aprovadas" value={stats.aprovado + stats.finalizado} icon={TrendingUp} variant="green" />
            <PremiumStat label="Conversão" value={Math.round(stats.conversao)} icon={GitBranch} variant="teal" suffix="%" />
          </div>
          <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
            <PremiumStat label="Recusadas" value={stats.recusado} icon={Target} variant="default" />
            <PremiumStat label="Finalizadas" value={stats.finalizado} icon={Target} variant="default" />
            <PremiumStat label="Valor orçado" value={Math.round(stats.valorOrcado)} icon={Receipt} variant="default" />
            <PremiumStat label="Valor vendido" value={Math.round(stats.valorVendido)} icon={TrendingUp} variant="green" />
          </div>
          <p className="text-sm text-muted-foreground/70">
            {brl(stats.valorOrcado)} orçado · {brl(stats.valorVendido)} vendido · ticket médio {brl(stats.ticketMedio)}
          </p>
        </PremiumSection>

        <PremiumSection label="Evolução">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <PremiumChartCard title="Propostas por Mês" subtitle="Últimos 6 meses" icon={Receipt}>
              {stats.total === 0 ? (
                <PremiumEmptyState icon={Receipt} title="Sem propostas ainda" description="" size="sm" />
              ) : (
                <div className="h-48">
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

            <PremiumChartCard title="Propostas Paradas" subtitle="Em aberto, por dias sem atualização" icon={AlertTriangle}>
              {paradas.every((b) => b.value === 0) ? (
                <PremiumEmptyState icon={AlertTriangle} title="Nenhuma proposta parada" description="" size="sm" />
              ) : (
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={paradas} margin={{ top: 6, right: 4, left: 4, bottom: 0 }}>
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
        </PremiumSection>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <PremiumSection label="Últimos Clientes">
            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-6">Carregando…</p>
            ) : clientes.length === 0 ? (
              <PremiumEmptyState icon={Users} title="Nenhum cliente ainda" description="" size="sm" />
            ) : (
              <div className="rounded-xl border border-border/60 bg-card divide-y divide-border/40">
                {clientes.slice(0, 5).map((c) => (
                  <div key={c.id} className="px-4 py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{c.nome}</p>
                      <p className="text-sm text-foreground/60 truncate">{c.cidade || "—"}</p>
                    </div>
                    <span className="text-sm text-muted-foreground shrink-0">
                      {new Date(c.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </PremiumSection>

          <PremiumSection label="Últimas Propostas">
            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-6">Carregando…</p>
            ) : orcamentos.length === 0 ? (
              <PremiumEmptyState icon={Receipt} title="Nenhuma proposta ainda" description="" size="sm" />
            ) : (
              <div className="rounded-xl border border-border/60 bg-card divide-y divide-border/40">
                {orcamentos.slice(0, 5).map((o) => (
                  <div key={o.id} className="px-4 py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{o.cliente_nome || o.numero_orcamento || "Proposta"}</p>
                      <p className="text-sm text-foreground/60">{new Date(o.created_at).toLocaleDateString("pt-BR")}</p>
                    </div>
                    <span className="text-sm font-semibold tabular-nums text-foreground shrink-0">{brl(o.total)}</span>
                  </div>
                ))}
              </div>
            )}
          </PremiumSection>
        </div>
      </div>

      <EditVendedorDialog
        vendedor={editing ? vendedor : null}
        onOpenChange={(open) => setEditing(open)}
        onSaved={refresh}
      />
    </PremiumPage>
  );
}
