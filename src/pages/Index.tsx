import { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useBranding } from "@/hooks/useBranding";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FileText, CheckCircle2, Clock, XCircle, ChevronDown, ChevronUp,
  Plus, UserCheck, LayoutList, CalendarDays, Inbox, TrendingUp, PieChart as PieIconLucide,
  Receipt, Landmark,
} from "lucide-react";
import { fetchCatalogo } from "@/lib/orcamentoQueries";
import { fetchClientes } from "@/lib/clientesQueries";
import { fetchServicos } from "@/lib/agendaQueries";
import { fetchOrcamentos } from "@/lib/orcamentosComercialQueries";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { cn, safeMoney } from "@/lib/utils";
import {
  PremiumPage, PremiumSection, PremiumChartCard, PremiumEmptyState,
  PremiumAction, PremiumWeather, useCountUp,
} from "@/components/premium";

interface Quote {
  id: string; producer_name: string; empresa_name: string | null;
  location: string | null; production_type: string; product_name: string;
  input_value: number; frascos: number; frequencia: string; detalhes: string | null;
  status: string; created_at: string; propulsores_json: any[] | null; aditivos_json: any[] | null;
}

const Num = ({ v }: { v: number }) => <>{useCountUp(v)}</>;
const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const METRIC_CFG: Record<string, { card: string; icon: string; value: string; label: string }> = {
  feitos:     { card: "bg-gradient-to-br from-[hsl(210,70%,22%)] to-[hsl(215,65%,18%)] shadow-[0_4px_14px_hsl(210_70%_22%/0.3)]", icon: "text-white/70", value: "text-white", label: "text-white/60" },
  fechados:   { card: "bg-gradient-to-br from-[hsl(120,55%,32%)] to-[hsl(140,50%,26%)] shadow-[0_4px_14px_hsl(120_55%_32%/0.3)]", icon: "text-white/70", value: "text-white", label: "text-white/60" },
  aberto:     { card: "bg-gradient-to-br from-amber-500 to-amber-600 shadow-[0_4px_14px_hsl(38_92%_50%/0.3)]", icon: "text-white/70", value: "text-white", label: "text-white/60" },
  finalizados:{ card: "border border-border/60 bg-card shadow-[0_1px_3px_hsl(210_20%_20%/0.06)]", icon: "text-muted-foreground/55", value: "text-foreground", label: "text-muted-foreground/55" },
};

const Index = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { branding } = useBranding();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState("all");

  const statusLabels: Record<string, { label: string; color: string }> = {
    em_aberto: { label: t("dashboard.statusOpen"),     color: "bg-amber-500/18 text-amber-700 border border-amber-500/35" },
    fechado:   { label: t("dashboard.statusApproved"), color: "bg-accent/18 text-accent border border-accent/35" },
    finalizado:{ label: t("dashboard.statusFinished"), color: "bg-muted text-muted-foreground border border-border/60" },
  };
  const months = t("dashboard.months", { returnObjects: true }) as string[];

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("quotes").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setQuotes((data as Quote[]) || []);
      setLoading(false);
    })();
  }, [user]);

  const total = quotes.length;
  const fechados  = useMemo(() => quotes.filter((q) => q.status === "fechado"),    [quotes]);
  const finalizados = useMemo(() => quotes.filter((q) => q.status === "finalizado"), [quotes]);
  const emAberto  = useMemo(() => quotes.filter((q) => q.status === "em_aberto"),  [quotes]);

  const availableMonths = useMemo(() => {
    const set = new Map<string, string>();
    quotes.forEach((q) => {
      const d = new Date(q.created_at);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!set.has(key)) set.set(key, `${months[d.getMonth()]} ${d.getFullYear()}`);
    });
    return Array.from(set.entries());
  }, [quotes, months]);

  const filteredByMonth = useMemo(() => {
    if (selectedMonth === "all") return quotes;
    const [year, month] = selectedMonth.split("-").map(Number);
    return quotes.filter((q) => {
      const d = new Date(q.created_at);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  }, [quotes, selectedMonth]);


  const evolution = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(today); d.setDate(d.getDate() - (29 - i));
      return {
        date: d.toISOString().slice(0, 10),
        label: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        count: 0,
      };
    });
    const idx = new Map(days.map((d, i) => [d.date, i]));
    quotes.forEach((q) => {
      const i = idx.get(new Date(q.created_at).toISOString().slice(0, 10));
      if (i !== undefined) days[i].count++;
    });
    return days;
  }, [quotes]);

  const statusMix = useMemo(() => [
    { name: t("dashboard.statusApproved"), value: fechados.length,    color: "hsl(120, 55%, 38%)" },
    { name: t("dashboard.statusOpen"),     value: emAberto.length,    color: "hsl(38, 92%, 50%)" },
    { name: t("dashboard.statusFinished"), value: finalizados.length, color: "hsl(210, 20%, 72%)" },
  ], [fechados.length, emAberto.length, finalizados.length, t]);

  const { data: catalogoItens = [] } = useQuery({ queryKey: ["catalogo"], queryFn: fetchCatalogo, staleTime: 5 * 60 * 1000 });
  const { data: clientesData = [] }  = useQuery({ queryKey: ["clientes"], queryFn: fetchClientes, staleTime: 5 * 60 * 1000 });
  const { data: servicosData = [] }  = useQuery({ queryKey: ["servicos"], queryFn: fetchServicos, staleTime: 5 * 60 * 1000, retry: false });
  const { data: orcamentosData = [] } = useQuery({ queryKey: ["orcamentos"], queryFn: fetchOrcamentos });
  const totalVendido = useMemo(
    () =>
      orcamentosData
        .filter((o) => o.status === "aprovado" || o.status === "finalizado")
        .reduce((s, o) => s + safeMoney(o.total), 0),
    [orcamentosData],
  );

  const catalogoStats = useMemo(() => ({
    total:      catalogoItens.length,
    ativos:     catalogoItens.filter((i) => i.ativo).length,
    categorias: new Set(catalogoItens.map((i) => i.categoria).filter(Boolean)).size,
  }), [catalogoItens]);

  const clientesStats = useMemo(() => ({
    total:  clientesData.length,
    ativos: clientesData.filter((c) => c.status === "ativo").length,
    cidades: new Set(clientesData.map((c) => c.cidade).filter(Boolean)).size,
  }), [clientesData]);

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const agendaStats = useMemo(() => ({
    agendados:  servicosData.filter((s) => s.status === "agendado").length,
    concluidos: servicosData.filter((s) => s.status === "concluido").length,
    hoje:       servicosData.filter((s) => s.status === "agendado" && s.data === todayStr).length,
  }), [servicosData, todayStr]);

  const metricCards = [
    { id: "feitos",      label: t("dashboard.quotesMade"), value: total,             icon: FileText },
    { id: "fechados",    label: t("dashboard.approved"),   value: fechados.length,   icon: CheckCircle2 },
    { id: "aberto",      label: t("dashboard.open"),       value: emAberto.length,   icon: Clock },
    { id: "finalizados", label: t("dashboard.finished"),   value: finalizados.length, icon: XCircle },
  ];
  const quoteListFor = (id: string) =>
    id === "feitos" ? filteredByMonth : id === "fechados" ? fechados : id === "aberto" ? emAberto : finalizados;
  const toggle = (id: string) => setExpandedCard((c) => c === id ? null : id);

  if (loading) return (
    <div className="max-w-5xl mx-auto space-y-6 py-1 animate-pulse">
      <div className="h-[340px] rounded-2xl border border-border bg-muted/25" />
      <div className="h-44 rounded-xl border border-border bg-muted/25" />
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-32 rounded-xl border border-border bg-muted/25" />)}
      </div>
    </div>
  );

  return (
    <PremiumPage>
      {branding.logo_url && (
        <div aria-hidden className="pointer-events-none select-none fixed inset-0 z-0 flex items-center justify-center">
          <img src={branding.logo_url} alt="" className="w-[55%] max-w-[400px] opacity-[0.02] object-contain" />
        </div>
      )}
      <div className="relative z-10 space-y-8">

        {/* 1. CLIMA + RESUMO INTELIGENTE */}
        <PremiumSection label="Clima Operacional" description="previsão e planejamento de campo">
          <PremiumWeather showSummary />
        </PremiumSection>

        {/* 2. MÓDULOS COMERCIAIS */}
        <PremiumSection label="Módulos Comerciais">
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
            {[
              { to: "/clientes",       icon: UserCheck,    title: "Clientes",   subtitle: "Propriedades · Produtores",  value: clientesStats.total,   detail: `${clientesStats.ativos} ativos · ${clientesStats.cidades} cidades`,   iconBg: "bg-[hsl(210,70%,22%)] text-white" },
              { to: "/catalogo",       icon: LayoutList,   title: "Catálogo",   subtitle: "Produtos · Serviços",        value: catalogoStats.total,   detail: `${catalogoStats.ativos} ativos · ${catalogoStats.categorias} categ.`,  iconBg: "bg-accent text-white" },
              { to: "/agenda",         icon: CalendarDays, title: "Agenda",     subtitle: "Visitas Técnicas · Campo",   value: agendaStats.agendados, detail: `${agendaStats.concluidos} concluídas · ${agendaStats.hoje} hoje`,      iconBg: "bg-amber-500 text-white" },
              { to: "/orcamentos",     icon: FileText,     title: "Orçamentos", subtitle: "Comerciais · Gestão",        value: orcamentosData.length, detail: `${orcamentosData.filter(o => o.status === "aprovado" || o.status === "finalizado").length} aprovados · ${orcamentosData.filter(o => o.status === "em_aberto").length} abertos`, iconBg: "bg-teal-600 text-white" },
              { to: "/orcamentos",     icon: Receipt,      title: "Propostas",  subtitle: "Comerciais · Negociações",   value: orcamentosData.length, detail: `${orcamentosData.filter(o => o.status === "aprovado" || o.status === "finalizado").length} aprovadas · ${brl(totalVendido)}`, iconBg: "bg-indigo-600 text-white" },
              { to: "/financeiro",     icon: Landmark,     title: "Financeiro", subtitle: "Painel · Metas Comerciais",  value: orcamentosData.filter(o => o.status === "aprovado" || o.status === "finalizado").length, detail: `Total aprovado: ${brl(totalVendido)}`, iconBg: "bg-emerald-600 text-white" },
            ].map((card) => (
              <Link key={card.to} to={card.to} className="group block rounded-xl border border-border/60 bg-card p-5 transition-all duration-150 hover:border-accent/35 hover:shadow-md hover:-translate-y-0.5">
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center shrink-0 shadow-sm", card.iconBg)}>
                    <card.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground leading-none">{card.title}</p>
                    <p className="text-xs text-muted-foreground/65 mt-1">{card.subtitle}</p>
                  </div>
                </div>
                <p className="text-3xl font-bold tabular-nums leading-none text-foreground"><Num v={card.value} /></p>
                <p className="text-xs text-muted-foreground/65 mt-2 leading-snug">{card.detail}</p>
              </Link>
            ))}
          </div>
        </PremiumSection>

        {/* 3. AÇÕES RÁPIDAS */}
        <PremiumSection label="Ações Rápidas">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <PremiumAction icon={Plus}         label="Novo Orçamento" description="Orçamento técnico Embio"        to="/novo-orcamento" />
            <PremiumAction icon={UserCheck}    label="Novo Cliente"   description="Propriedade ou produtor"        to="/clientes" />
            <PremiumAction icon={LayoutList}   label="Catálogo"       description="Produtos, serviços e aditivos"  to="/catalogo" />
            <PremiumAction icon={CalendarDays} label="Agenda"         description="Visitas e atendimentos"         to="/agenda" />
          </div>
        </PremiumSection>

        {/* 4. ORÇAMENTOS */}
        <PremiumSection label="Orçamentos Técnicos">
          <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
            {metricCards.map((m) => {
              const cfg = METRIC_CFG[m.id];
              return (
                <button key={m.id} onClick={() => toggle(m.id)} className={cn(
                  "rounded-xl p-5 text-left transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0",
                  cfg.card,
                  expandedCard === m.id && "ring-2 ring-white/15 shadow-xl scale-[1.01]",
                )}>
                  <div className="flex items-center justify-between mb-4">
                    <m.icon className={cn("h-5 w-5", cfg.icon)} />
                    {expandedCard === m.id
                      ? <ChevronUp className={cn("h-4 w-4", cfg.icon)} />
                      : <ChevronDown className={cn("h-4 w-4 opacity-40", cfg.icon)} />}
                  </div>
                  <p className={cn("text-4xl font-bold tabular-nums leading-none", cfg.value)}><Num v={m.value} /></p>
                  <p className={cn("text-sm mt-2.5", cfg.label)}>{m.label}</p>
                </button>
              );
            })}
          </div>
          {expandedCard && ["feitos", "fechados", "aberto", "finalizados"].includes(expandedCard) && (
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
              {expandedCard === "feitos" && (
                <div className="px-5 py-3 border-b border-border/40">
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="h-8 text-sm w-[180px] rounded-md border-border/60">
                      <SelectValue placeholder="Filtrar por mês" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("dashboard.allMonths")}</SelectItem>
                      {availableMonths.map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="divide-y divide-border/35 max-h-[280px] overflow-y-auto">
                {quoteListFor(expandedCard).length === 0 ? (
                  <p className="text-sm text-muted-foreground/60 text-center py-8">{t("dashboard.noQuotes")}</p>
                ) : quoteListFor(expandedCard).map((q) => {
                  const s = statusLabels[q.status] || statusLabels.em_aberto;
                  return (
                    <div key={q.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/20 transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">{q.empresa_name || q.producer_name}</p>
                        <p className="text-xs text-muted-foreground/70">{new Date(q.created_at).toLocaleDateString("pt-BR")}{q.product_name && q.product_name !== "Sem aditivo" && ` · ${q.product_name}`}</p>
                      </div>
                      <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ml-3", s.color)}>{s.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </PremiumSection>

        {/* 6. GRÁFICOS */}
        <PremiumSection label="Análise Comercial">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-[1fr_280px]">
            <PremiumChartCard title="Evolução" subtitle="Orçamentos · últimos 30 dias" icon={TrendingUp}>
              {quotes.length === 0 ? (
                <PremiumEmptyState icon={Inbox} title="Sem dados ainda" description="Os dados aparecem conforme novos orçamentos são criados." size="sm" />
              ) : (
                <div className="h-44 -mx-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={evolution} margin={{ top: 6, right: 4, left: 4, bottom: 0 }}>
                      <defs>
                        <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground) / 0.6)" }} axisLine={false} tickLine={false} interval={Math.ceil(evolution.length / 5)} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} labelStyle={{ color: "hsl(var(--muted-foreground))" }} cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }} />
                      <Area type="monotone" dataKey="count" stroke="hsl(var(--accent))" strokeWidth={2} fill="url(#aGrad)" dot={false} activeDot={{ r: 4, fill: "hsl(var(--accent))", strokeWidth: 0 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </PremiumChartCard>
            <PremiumChartCard title="Mix de Status" subtitle="Distribuição" icon={PieIconLucide}>
              {quotes.length === 0 ? (
                <PremiumEmptyState icon={Inbox} title="Sem dados" description="" size="sm" />
              ) : (
                <div className="space-y-4">
                  <div className="h-32 w-32 mx-auto">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={statusMix} dataKey="value" innerRadius={36} outerRadius={58} paddingAngle={2} stroke="none">
                          {statusMix.map((s, i) => <Cell key={i} fill={s.color} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <ul className="space-y-2">
                    {statusMix.map((s) => (
                      <li key={s.name} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full shrink-0" style={{ background: s.color }} />
                          <span className="text-muted-foreground">{s.name}</span>
                        </span>
                        <span className="font-semibold tabular-nums text-foreground">{s.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </PremiumChartCard>
          </div>
        </PremiumSection>

      </div>
    </PremiumPage>
  );
};

export default Index;
