import { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useBranding } from "@/hooks/useBranding";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FileText, CheckCircle2, Clock, XCircle, Package, Cog, ChevronDown, ChevronUp,
  Plus, UserCheck, LayoutList, CalendarDays, Inbox, TrendingUp, PieChart as PieIconLucide, Wheat,
} from "lucide-react";
import { fetchCatalogo } from "@/lib/orcamentoQueries";
import { fetchClientes } from "@/lib/clientesQueries";
import { fetchServicos } from "@/lib/agendaQueries";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { cn } from "@/lib/utils";
import {
  PremiumPage, PremiumSection, PremiumChartCard, PremiumEmptyState,
  PremiumBadge, PremiumAction, PremiumWeather, useCountUp,
} from "@/components/premium";

interface Quote {
  id: string; producer_name: string; empresa_name: string | null;
  location: string | null; production_type: string; product_name: string;
  input_value: number; frascos: number; frequencia: string; detalhes: string | null;
  status: string; created_at: string; propulsores_json: any[] | null; aditivos_json: any[] | null;
}

const Num = ({ v }: { v: number }) => <>{useCountUp(v)}</>;

const Index = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { branding } = useBranding();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState("all");

  const statusLabels: Record<string, { label: string; color: string }> = {
    em_aberto: { label: t("dashboard.statusOpen"), color: "bg-amber-500/10 text-amber-700 border border-amber-500/20" },
    fechado: { label: t("dashboard.statusApproved"), color: "bg-accent/8 text-accent border border-accent/20" },
    finalizado: { label: t("dashboard.statusFinished"), color: "bg-muted text-muted-foreground border border-border/60" },
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
  const fechados = useMemo(() => quotes.filter((q) => q.status === "fechado"), [quotes]);
  const finalizados = useMemo(() => quotes.filter((q) => q.status === "finalizado"), [quotes]);
  const emAberto = useMemo(() => quotes.filter((q) => q.status === "em_aberto"), [quotes]);

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

  const productDetails = useMemo(() => {
    const map: Record<string, { count: number; clients: string[] }> = {};
    const add = (key: string, qty: number, client: string) => {
      if (!map[key]) map[key] = { count: 0, clients: [] };
      map[key].count += qty;
      if (!map[key].clients.includes(client)) map[key].clients.push(client);
    };
    quotes.forEach((q) => {
      const n = q.empresa_name || q.producer_name;
      const adts = q.aditivos_json as any[];
      if (adts?.length > 0) adts.forEach((a: any) => a.produto && add(a.produto, a.quantidade || 1, n));
      else if (q.product_name && q.product_name !== "Sem aditivo") add(q.product_name, q.frascos || 1, n);
    });
    return map;
  }, [quotes]);

  const propulsorDetails = useMemo(() => {
    const map: Record<string, string[]> = {};
    quotes.forEach((q) => {
      const n = q.empresa_name || q.producer_name;
      (q.propulsores_json as any[])?.forEach((p: any) => {
        if (!p.modelo) return;
        if (!map[p.modelo]) map[p.modelo] = [];
        if (!map[p.modelo].includes(n)) map[p.modelo].push(n);
      });
    });
    return map;
  }, [quotes]);

  const evolution = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(today); d.setDate(d.getDate() - (29 - i));
      return { date: d.toISOString().slice(0, 10), label: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }), count: 0 };
    });
    const idx = new Map(days.map((d, i) => [d.date, i]));
    quotes.forEach((q) => { const i = idx.get(new Date(q.created_at).toISOString().slice(0, 10)); if (i !== undefined) days[i].count++; });
    return days;
  }, [quotes]);

  const statusMix = useMemo(() => [
    { name: t("dashboard.statusApproved"), value: fechados.length, color: "hsl(var(--accent))" },
    { name: t("dashboard.statusOpen"), value: emAberto.length, color: "hsl(var(--accent) / 0.4)" },
    { name: t("dashboard.statusFinished"), value: finalizados.length, color: "hsl(var(--muted-foreground) / 0.35)" },
  ], [fechados.length, emAberto.length, finalizados.length, t]);

  const { data: catalogoItens = [] } = useQuery({ queryKey: ["catalogo"], queryFn: fetchCatalogo, staleTime: 5 * 60 * 1000 });
  const { data: clientesData = [] } = useQuery({ queryKey: ["clientes"], queryFn: fetchClientes, staleTime: 5 * 60 * 1000 });
  const { data: servicosData = [] } = useQuery({ queryKey: ["servicos"], queryFn: fetchServicos, staleTime: 5 * 60 * 1000, retry: false });

  const catalogoStats = useMemo(() => ({
    total: catalogoItens.length,
    ativos: catalogoItens.filter((i) => i.ativo).length,
    categorias: new Set(catalogoItens.map((i) => i.categoria).filter(Boolean)).size,
  }), [catalogoItens]);

  const clientesStats = useMemo(() => ({
    total: clientesData.length,
    ativos: clientesData.filter((c) => c.status === "ativo").length,
    cidades: new Set(clientesData.map((c) => c.cidade).filter(Boolean)).size,
  }), [clientesData]);

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const agendaStats = useMemo(() => ({
    agendados: servicosData.filter((s) => s.status === "agendado").length,
    concluidos: servicosData.filter((s) => s.status === "concluido").length,
    hoje: servicosData.filter((s) => s.status === "agendado" && s.data === todayStr).length,
  }), [servicosData, todayStr]);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  const firstName = branding.company_name?.split(" ")[0] || user?.email?.split("@")[0] || "";
  const dateLabel = now.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
  const unitLabel = (n: number) => n === 1 ? t("common.unit") : t("common.units");

  const metricCards = [
    { id: "feitos", label: t("dashboard.quotesMade"), value: total, icon: FileText },
    { id: "fechados", label: t("dashboard.approved"), value: fechados.length, icon: CheckCircle2 },
    { id: "aberto", label: t("dashboard.open"), value: emAberto.length, icon: Clock },
    { id: "finalizados", label: t("dashboard.finished"), value: finalizados.length, icon: XCircle },
  ];
  const quoteListFor = (id: string) =>
    id === "feitos" ? filteredByMonth : id === "fechados" ? fechados : id === "aberto" ? emAberto : finalizados;
  const toggle = (id: string) => setExpandedCard((c) => c === id ? null : id);

  if (loading) return (
    <div className="max-w-5xl mx-auto space-y-6 py-1 animate-pulse">
      <div className="h-[108px] rounded-xl border border-border bg-muted/25" />
      <div className="h-44 rounded-xl border border-border bg-muted/25" />
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 rounded-xl border border-border bg-muted/25" />)}
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

        {/* HERO */}
        <div className="relative overflow-hidden rounded-xl border border-border/60 bg-card px-6 py-5 shadow-[0_1px_3px_hsl(210_20%_20%/0.06)]">
          <div className="absolute inset-y-0 left-0 w-[3px] bg-accent rounded-l-xl" />
          <div className="pl-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1.5">
              <PremiumBadge><Wheat className="h-3 w-3" />Inteligência Comercial Agro</PremiumBadge>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 font-medium capitalize">{dateLabel}</p>
                <h1 className="text-xl font-bold text-foreground tracking-tight mt-0.5">{greeting}{firstName && `, ${firstName}`}</h1>
                <p className="text-xs text-muted-foreground/55 mt-0.5">Suinocultura · Bovinos · Equinos · Biotecnologia</p>
              </div>
            </div>
            <div className="flex gap-6 shrink-0">
              {([{ v: total, l: "Orçamentos" }, { v: clientesStats.total, l: "Clientes" }, { v: agendaStats.agendados, l: "Visitas" }] as { v: number; l: string }[]).map(({ v, l }) => (
                <div key={l}>
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground/40 mb-0.5">{l}</p>
                  <p className="text-[22px] font-bold tabular-nums leading-none text-foreground"><Num v={v} /></p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CLIMA */}
        <PremiumSection label="Clima Operacional" description="planejamento de visitas ao campo">
          <PremiumWeather />
        </PremiumSection>

        {/* MÓDULOS */}
        <PremiumSection label="Módulos Comerciais">
          <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
            {[
              { to: "/clientes", icon: UserCheck, title: "Clientes", subtitle: "Propriedades · Produtores", value: clientesStats.total, detail: `${clientesStats.ativos} ativos · ${clientesStats.cidades} cidades` },
              { to: "/catalogo", icon: LayoutList, title: "Catálogo", subtitle: "Produtos · Serviços · Aditivos", value: catalogoStats.total, detail: `${catalogoStats.ativos} ativos · ${catalogoStats.categorias} categ.` },
              { to: "/agenda", icon: CalendarDays, title: "Agenda", subtitle: "Visitas Técnicas · Campo", value: agendaStats.agendados, detail: `${agendaStats.concluidos} concluídas · ${agendaStats.hoje} hoje` },
              { to: "/novo-orcamento", icon: FileText, title: "Orçamentos", subtitle: "Técnicos · Embio", value: total, detail: `${fechados.length} fechados · ${emAberto.length} abertos` },
            ].map((card) => (
              <Link key={card.to} to={card.to} className="group block rounded-xl border border-border/60 bg-card p-4 transition-all duration-150 hover:border-accent/35 hover:shadow-md">
                <div className="flex items-center gap-2 mb-3.5">
                  <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/15 transition-colors">
                    <card.icon className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-foreground leading-none">{card.title}</p>
                    <p className="text-[9px] text-muted-foreground/55 mt-0.5">{card.subtitle}</p>
                  </div>
                </div>
                <p className="text-2xl font-bold tabular-nums leading-none text-foreground"><Num v={card.value} /></p>
                <p className="text-[10px] text-muted-foreground/55 mt-1.5 leading-snug">{card.detail}</p>
              </Link>
            ))}
          </div>
        </PremiumSection>

        {/* ANÁLISE */}
        <PremiumSection label="Análise Comercial">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-[1fr_260px]">
            <PremiumChartCard title="Evolução" subtitle="Orçamentos · últimos 30 dias" icon={TrendingUp}>
              {quotes.length === 0 ? <PremiumEmptyState icon={Inbox} title="Sem dados ainda" description="Os dados aparecem conforme novos orçamentos são criados." size="sm" /> : (
                <div className="h-40 -mx-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={evolution} margin={{ top: 6, right: 4, left: 4, bottom: 0 }}>
                      <defs>
                        <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.15} />
                          <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="label" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground) / 0.6)" }} axisLine={false} tickLine={false} interval={Math.ceil(evolution.length / 5)} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} labelStyle={{ color: "hsl(var(--muted-foreground))" }} cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }} />
                      <Area type="monotone" dataKey="count" stroke="hsl(var(--accent))" strokeWidth={1.5} fill="url(#aGrad)" dot={false} activeDot={{ r: 3, fill: "hsl(var(--accent))", strokeWidth: 0 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </PremiumChartCard>
            <PremiumChartCard title="Mix de Status" subtitle="Distribuição" icon={PieIconLucide}>
              {quotes.length === 0 ? <PremiumEmptyState icon={Inbox} title="Sem dados" description="" size="sm" /> : (
                <div className="space-y-4">
                  <div className="h-28 w-28 mx-auto">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={statusMix} dataKey="value" innerRadius={32} outerRadius={52} paddingAngle={2} stroke="none">
                          {statusMix.map((s, i) => <Cell key={i} fill={s.color} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <ul className="space-y-1.5">
                    {statusMix.map((s) => (
                      <li key={s.name} className="flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: s.color }} /><span className="text-muted-foreground">{s.name}</span></span>
                        <span className="font-semibold tabular-nums text-foreground">{s.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </PremiumChartCard>
          </div>
        </PremiumSection>

        {/* ORÇAMENTOS */}
        <PremiumSection label="Orçamentos Técnicos">
          <div className="flex flex-wrap gap-2">
            {metricCards.map((m) => (
              <button key={m.id} onClick={() => toggle(m.id)} className={cn(
                "flex items-center gap-2.5 rounded-lg border px-3.5 py-2 text-sm transition-all duration-150",
                expandedCard === m.id ? "border-accent/30 bg-accent/8 shadow-sm" : "border-border/60 bg-card hover:border-accent/20 hover:bg-muted/20",
              )}>
                <m.icon className={cn("h-3.5 w-3.5 shrink-0", expandedCard === m.id ? "text-accent" : "text-muted-foreground")} />
                <span className={cn("text-[17px] font-bold tabular-nums leading-none", expandedCard === m.id ? "text-accent" : "text-foreground")}><Num v={m.value} /></span>
                <span className="text-[11px] text-muted-foreground">{m.label}</span>
                {expandedCard === m.id ? <ChevronUp className="h-3 w-3 text-muted-foreground/60 ml-0.5" /> : <ChevronDown className="h-3 w-3 text-muted-foreground/40 ml-0.5" />}
              </button>
            ))}
          </div>
          {expandedCard && ["feitos", "fechados", "aberto", "finalizados"].includes(expandedCard) && (
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
              {expandedCard === "feitos" && (
                <div className="px-4 py-2.5 border-b border-border/40">
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="h-7 text-[11px] w-[160px] rounded-md border-border/60"><SelectValue placeholder="Filtrar por mês" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("dashboard.allMonths")}</SelectItem>
                      {availableMonths.map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="divide-y divide-border/35 max-h-[260px] overflow-y-auto">
                {quoteListFor(expandedCard).length === 0 ? (
                  <p className="text-[11px] text-muted-foreground/60 text-center py-7">{t("dashboard.noQuotes")}</p>
                ) : quoteListFor(expandedCard).map((q) => {
                  const s = statusLabels[q.status] || statusLabels.em_aberto;
                  return (
                    <div key={q.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/20 transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-medium text-foreground truncate">{q.empresa_name || q.producer_name}</p>
                        <p className="text-[10px] text-muted-foreground/70">{new Date(q.created_at).toLocaleDateString("pt-BR")}{q.product_name && q.product_name !== "Sem aditivo" && ` · ${q.product_name}`}</p>
                      </div>
                      <span className={cn("text-[9px] font-semibold px-2 py-0.5 rounded-full shrink-0 ml-3", s.color)}>{s.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </PremiumSection>

        {/* PIPELINE + AÇÕES */}
        <div className="grid gap-5 grid-cols-1 md:grid-cols-[1fr_240px]">
          <PremiumSection label="Pipeline Técnico">
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border/40 flex items-center justify-between">
                <p className="text-[12px] font-semibold text-foreground">Últimos orçamentos</p>
                <Link to="/novo-orcamento" className="text-[11px] text-accent hover:underline">+ Novo</Link>
              </div>
              {quotes.length === 0 ? <PremiumEmptyState icon={FileText} title="Nenhum orçamento técnico" description="Crie o primeiro orçamento para um produtor rural." /> : (
                <div className="divide-y divide-border/35 max-h-[240px] overflow-y-auto">
                  {quotes.slice(0, 5).map((q) => {
                    const s = statusLabels[q.status] || statusLabels.em_aberto;
                    return (
                      <div key={q.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/15 transition-colors">
                        <div className="h-6 w-6 rounded-full bg-muted/50 flex items-center justify-center shrink-0">
                          <FileText className="h-3 w-3 text-muted-foreground/50" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[12px] font-medium text-foreground truncate">{q.empresa_name || q.producer_name}</p>
                          <p className="text-[10px] text-muted-foreground/60">{new Date(q.created_at).toLocaleDateString("pt-BR")} · {q.product_name}</p>
                        </div>
                        <span className={cn("text-[9px] font-semibold px-2 py-0.5 rounded-full shrink-0", s.color)}>{s.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </PremiumSection>
          <PremiumSection label="Ações Rápidas">
            <div className="space-y-2">
              <PremiumAction icon={Plus} label="Novo Orçamento" description="Orçamento técnico Embio" to="/novo-orcamento" />
              <PremiumAction icon={UserCheck} label="Novo Cliente" description="Propriedade ou produtor" to="/clientes" />
              <PremiumAction icon={LayoutList} label="Catálogo" description="Produtos, serviços e aditivos" to="/catalogo" />
              <PremiumAction icon={CalendarDays} label="Agenda" description="Visitas e atendimentos de campo" to="/agenda" />
            </div>
          </PremiumSection>
        </div>

        {/* PRODUTOS TÉCNICOS */}
        <PremiumSection label="Produtos Técnicos">
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
            {[
              { id: "produtos", icon: Package, label: t("dashboard.quotedProducts"), count: Object.keys(productDetails).length,
                items: Object.entries(productDetails).map(([k, v]) => ({ primary: k, secondary: `${v.count} ${unitLabel(v.count)} · ${v.clients.join(", ")}` })),
                empty: t("dashboard.noProducts") },
              { id: "propulsores", icon: Cog, label: t("dashboard.quotedPropulsors"), count: Object.keys(propulsorDetails).length,
                items: Object.entries(propulsorDetails).map(([k, v]) => ({ primary: k, secondary: `${v.length} ${v.length === 1 ? t("common.client") : t("common.clients")} · ${v.join(", ")}` })),
                empty: t("dashboard.noPropulsors") },
            ].map((sec) => (
              <div key={sec.id} className="rounded-xl border border-border/60 bg-card cursor-pointer shadow-[0_1px_3px_hsl(210_20%_20%/0.06)]" onClick={() => toggle(sec.id)}>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-md bg-accent/10 flex items-center justify-center shrink-0">
                        <sec.icon className="h-3.5 w-3.5 text-accent" />
                      </div>
                      <div>
                        <p className="text-[20px] font-bold tabular-nums leading-none text-foreground">{sec.count}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-0.5">{sec.label}</p>
                      </div>
                    </div>
                    {expandedCard === sec.id ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground/50" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/40" />}
                  </div>
                  {expandedCard === sec.id && (
                    <div className="mt-3 border-t border-border/40 pt-3 space-y-1.5 max-h-[200px] overflow-y-auto">
                      {sec.items.length === 0 ? <p className="text-[11px] text-muted-foreground/60 py-4 text-center">{sec.empty}</p> : sec.items.map((item, i) => (
                        <div key={i} className="rounded-lg bg-muted/25 px-3 py-2">
                          <p className="text-[12px] font-medium text-foreground">{item.primary}</p>
                          <p className="text-[10px] text-muted-foreground/65 mt-0.5 truncate">{item.secondary}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </PremiumSection>

        <p className="text-[10px] text-muted-foreground/30 text-center pb-2">{t("dashboard.dataFooter")}</p>
      </div>
    </PremiumPage>
  );
};

export default Index;
