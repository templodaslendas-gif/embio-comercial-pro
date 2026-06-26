import { useEffect, useState, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { useBranding } from "@/hooks/useBranding";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  FileText, CheckCircle2, Clock, XCircle, Package, Cog, ChevronDown, ChevronUp,
  Plus, Users, Palette, LayoutList, CalendarDays, Inbox, TrendingUp, PieChart as PieIcon,
} from "lucide-react";
import { WeatherWidget } from "@/modules/commercial/dashboard";
import { fetchCatalogo } from "@/lib/orcamentoQueries";
import { fetchClientes } from "@/lib/clientesQueries";
import { fetchServicos } from "@/lib/agendaQueries";
import {
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { cn } from "@/lib/utils";

interface Quote {
  id: string; producer_name: string; empresa_name: string | null;
  location: string | null; production_type: string; product_name: string;
  input_value: number; frascos: number; frequencia: string; detalhes: string | null;
  status: string; created_at: string; propulsores_json: any[] | null; aditivos_json: any[] | null;
}

function useCountUp(target: number, duration = 500) {
  const [val, setVal] = useState(0);
  const fromRef = useRef(0);
  useEffect(() => {
    const from = fromRef.current;
    let start: number | null = null;
    let raf = 0;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / duration);
      setVal(Math.round(from + (target - from) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
      else fromRef.current = target;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

function Metric({ value }: { value: number }) {
  return <>{useCountUp(value)}</>;
}

function Sec({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("space-y-3", className)}>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/45">{label}</p>
      {children}
    </section>
  );
}

const EmptyChart = () => (
  <div className="h-40 flex flex-col items-center justify-center gap-2 text-center">
    <Inbox className="h-5 w-5 text-muted-foreground/35" />
    <p className="text-[11px] text-muted-foreground/55 max-w-[180px] leading-snug">Os dados aparecerão conforme novos orçamentos forem criados.</p>
  </div>
);

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
    fechado: { label: t("dashboard.statusApproved"), color: "bg-primary/8 text-primary border border-primary/20" },
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
    const addProd = (key: string, qty: number, client: string) => {
      if (!map[key]) map[key] = { count: 0, clients: [] };
      map[key].count += qty;
      if (!map[key].clients.includes(client)) map[key].clients.push(client);
    };
    quotes.forEach((q) => {
      const n = q.empresa_name || q.producer_name;
      const adts = q.aditivos_json as any[];
      if (adts?.length > 0) adts.forEach((a: any) => a.produto && addProd(a.produto, a.quantidade || 1, n));
      else if (q.product_name && q.product_name !== "Sem aditivo") addProd(q.product_name, q.frascos || 1, n);
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

  const valorMovimentado = useMemo(() =>
    quotes.reduce((acc, q) => acc + (q.frascos > 0 ? q.input_value * q.frascos : q.input_value), 0),
    [quotes]);

  const taxaAprovacao = useMemo(() =>
    total === 0 ? 0 : Math.round((fechados.length / total) * 100),
    [total, fechados.length]);

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
    { name: t("dashboard.statusApproved"), value: fechados.length, color: "hsl(var(--primary))" },
    { name: t("dashboard.statusOpen"), value: emAberto.length, color: "hsl(var(--accent))" },
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
  const moneyFmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
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
    <div className="max-w-5xl mx-auto space-y-8 py-1 animate-pulse">
      <div className="pb-6 border-b border-border space-y-2">
        <div className="h-2.5 w-28 rounded-full bg-muted/50" /><div className="h-6 w-52 rounded-lg bg-muted/40" />
      </div>
      <div className="grid gap-5 grid-cols-1 md:grid-cols-[1fr_280px]">
        <div className="h-56 rounded-xl border border-border bg-muted/25" /><div className="h-56 rounded-xl border border-border bg-muted/25" />
      </div>
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {[1,2,3,4].map((i) => <div key={i} className="h-32 rounded-xl border border-border bg-muted/25" />)}
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-1">

      {branding.logo_url && (
        <div aria-hidden className="pointer-events-none select-none fixed inset-0 z-0 flex items-center justify-center">
          <img src={branding.logo_url} alt="" className="w-[55%] max-w-[400px] opacity-[0.025] object-contain" />
        </div>
      )}

      <div className="relative z-10 space-y-10">

        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between pb-6 border-b border-border">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/45 font-medium mb-1">{dateLabel}</p>
            <h1 className="text-xl font-bold text-foreground tracking-tight leading-none">
              {greeting}{firstName && `, ${firstName}`}
            </h1>
            <p className="mt-1 text-xs text-muted-foreground/70">Painel comercial · Embio</p>
          </div>
          <div className="flex gap-7 sm:pb-0.5 shrink-0">
            <div>
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground/45 mb-1">Orçamentos</p>
              <p className="text-[22px] font-bold tabular-nums leading-none text-foreground"><Metric value={total} /></p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground/45 mb-1">Movimentado</p>
              <p className="text-[18px] font-bold tabular-nums leading-none text-foreground max-w-[140px] truncate">{moneyFmt.format(valorMovimentado)}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground/45 mb-1">Aprovação</p>
              <p className="text-[22px] font-bold tabular-nums leading-none text-foreground"><Metric value={taxaAprovacao} />%</p>
            </div>
          </div>
        </div>

        <Sec label="Análise Comercial">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-[1fr_260px]">
            <Card className="rounded-xl border border-border shadow-none bg-card">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <p className="text-[13px] font-semibold text-foreground">Evolução</p>
                    <p className="text-[11px] text-muted-foreground/70 mt-0.5">Orçamentos · últimos 30 dias</p>
                  </div>
                  <TrendingUp className="h-3.5 w-3.5 text-muted-foreground/30 mt-0.5" />
                </div>
                {quotes.length === 0 ? <EmptyChart /> : (
                  <div className="h-40 -mx-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={evolution} margin={{ top: 6, right: 4, left: 4, bottom: 0 }}>
                        <defs>
                          <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.12} />
                            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="label" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground) / 0.6)" }} axisLine={false} tickLine={false} interval={Math.ceil(evolution.length / 5)} />
                        <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11, boxShadow: "0 4px 12px -2px rgba(0,0,0,0.08)" }} labelStyle={{ color: "hsl(var(--muted-foreground))" }} cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }} />
                        <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={1.5} fill="url(#grad)" dot={false} activeDot={{ r: 3, fill: "hsl(var(--primary))", strokeWidth: 0 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-xl border border-border shadow-none bg-card">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <p className="text-[13px] font-semibold text-foreground">Mix de Status</p>
                    <p className="text-[11px] text-muted-foreground/70 mt-0.5">Distribuição</p>
                  </div>
                  <PieIcon className="h-3.5 w-3.5 text-muted-foreground/30 mt-0.5" />
                </div>
                {quotes.length === 0 ? <EmptyChart /> : (
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
                    <ul className="space-y-2">
                      {statusMix.map((s) => (
                        <li key={s.name} className="flex items-center justify-between text-[11px]">
                          <span className="flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: s.color }} />
                            <span className="text-muted-foreground">{s.name}</span>
                          </span>
                          <span className="font-semibold tabular-nums text-foreground">{s.value}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </Sec>

        <Sec label="Visão Operacional">
          <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
            {[
              { to: "/agenda", icon: CalendarDays, title: "Agenda", stats: [{ label: "Agendados", v: agendaStats.agendados },{ label: "Concluídos", v: agendaStats.concluidos },{ label: "Hoje", v: agendaStats.hoje }]},
              { to: "/catalogo", icon: LayoutList, title: "Catálogo", stats: [{ label: "Total", v: catalogoStats.total },{ label: "Ativos", v: catalogoStats.ativos },{ label: "Categ.", v: catalogoStats.categorias }]},
              { to: "/clientes", icon: Users, title: "Clientes", stats: [{ label: "Total", v: clientesStats.total },{ label: "Ativos", v: clientesStats.ativos },{ label: "Cidades", v: clientesStats.cidades }]},
            ].map((card) => (
              <Link key={card.to} to={card.to}
                className="group block rounded-xl border border-border bg-card p-4 hover:border-primary/30 hover:shadow-sm transition-all duration-150"
              >
                <div className="flex items-center gap-2 mb-3.5">
                  <div className="h-6 w-6 rounded-md bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors shrink-0">
                    <card.icon className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-[12px] font-semibold text-foreground">{card.title}</p>
                </div>
                <dl className="grid grid-cols-3 gap-1.5">
                  {card.stats.map(({ label, v }) => (
                    <div key={label} className="rounded-md bg-muted/35 p-1.5 text-center">
                      <dd className="text-[15px] font-bold tabular-nums text-foreground leading-none"><Metric value={v} /></dd>
                      <dt className="text-[9px] text-muted-foreground leading-tight mt-1">{label}</dt>
                    </div>
                  ))}
                </dl>
              </Link>
            ))}
            <div className="col-span-1">
              <WeatherWidget />
            </div>
          </div>
        </Sec>

        <Sec label="Orçamentos Embio">
          <div className="flex flex-wrap gap-2">
            {metricCards.map((m) => (
              <button
                key={m.id}
                onClick={() => toggle(m.id)}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg border px-3.5 py-2 text-sm transition-all duration-150",
                  expandedCard === m.id
                    ? "border-primary/25 bg-primary/5 shadow-sm"
                    : "border-border bg-card hover:border-border/70 hover:bg-muted/30"
                )}
              >
                <m.icon className={cn("h-3.5 w-3.5 shrink-0", expandedCard === m.id ? "text-primary" : "text-muted-foreground")} />
                <span className={cn("text-[17px] font-bold tabular-nums leading-none", expandedCard === m.id ? "text-primary" : "text-foreground")}>
                  <Metric value={m.value} />
                </span>
                <span className="text-[11px] text-muted-foreground leading-none">{m.label}</span>
                {expandedCard === m.id
                  ? <ChevronUp className="h-3 w-3 text-muted-foreground/60 ml-0.5" />
                  : <ChevronDown className="h-3 w-3 text-muted-foreground/40 ml-0.5" />}
              </button>
            ))}
          </div>

          {expandedCard && ["feitos", "fechados", "aberto", "finalizados"].includes(expandedCard) && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              {expandedCard === "feitos" && (
                <div className="px-4 py-2.5 border-b border-border/40 flex items-center gap-2">
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="h-7 text-[11px] w-[160px] rounded-md border-border/60">
                      <SelectValue placeholder="Filtrar por mês" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("dashboard.allMonths")}</SelectItem>
                      {availableMonths.map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="divide-y divide-border/35 max-h-[260px] overflow-y-auto">
                {quoteListFor(expandedCard).length === 0 ? (
                  <p className="text-[11px] text-muted-foreground/60 text-center py-7">{t("dashboard.noQuotes")}</p>
                ) : (
                  quoteListFor(expandedCard).map((q) => {
                    const s = statusLabels[q.status] || statusLabels.em_aberto;
                    return (
                      <div key={q.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/20 transition-colors">
                        <div className="min-w-0 flex-1">
                          <p className="text-[12px] font-medium text-foreground truncate">{q.empresa_name || q.producer_name}</p>
                          <p className="text-[10px] text-muted-foreground/70">
                            {new Date(q.created_at).toLocaleDateString("pt-BR")}
                            {q.product_name && q.product_name !== "Sem aditivo" && ` · ${q.product_name}`}
                          </p>
                        </div>
                        <span className={cn("text-[9px] font-semibold px-2 py-0.5 rounded-full shrink-0 ml-3", s.color)}>{s.label}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </Sec>

        <Sec label="Produtos & Propulsores">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {[
              { id: "produtos", icon: Package, label: t("dashboard.quotedProducts"), count: Object.keys(productDetails).length,
                items: Object.entries(productDetails).map(([k, v]) => ({ primary: k, secondary: `${v.count} ${unitLabel(v.count)} · ${v.clients.join(", ")}` })),
                empty: t("dashboard.noProducts") },
              { id: "propulsores", icon: Cog, label: t("dashboard.quotedPropulsors"), count: Object.keys(propulsorDetails).length,
                items: Object.entries(propulsorDetails).map(([k, v]) => ({ primary: k, secondary: `${v.length} ${v.length === 1 ? t("common.client") : t("common.clients")} · ${v.join(", ")}` })),
                empty: t("dashboard.noPropulsors") },
            ].map((sec) => (
              <Card key={sec.id} className="rounded-xl border border-border shadow-none bg-card cursor-pointer" onClick={() => toggle(sec.id)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-md bg-muted flex items-center justify-center shrink-0">
                        <sec.icon className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-[20px] font-bold tabular-nums leading-none text-foreground">{sec.count}</p>
                        <p className="text-[10px] text-muted-foreground/70 mt-0.5">{sec.label}</p>
                      </div>
                    </div>
                    {expandedCard === sec.id
                      ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground/50" />
                      : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/40" />}
                  </div>
                  {expandedCard === sec.id && (
                    <div className="mt-3 border-t border-border/40 pt-3 space-y-1.5 max-h-[200px] overflow-y-auto">
                      {sec.items.length === 0 ? (
                        <p className="text-[11px] text-muted-foreground/60 py-4 text-center">{sec.empty}</p>
                      ) : sec.items.map((item, i) => (
                        <div key={i} className="rounded-lg bg-muted/30 px-3 py-2">
                          <p className="text-[12px] font-medium text-foreground">{item.primary}</p>
                          <p className="text-[10px] text-muted-foreground/70 mt-0.5 truncate">{item.secondary}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </Sec>

        <Sec label="Ações Rápidas">
          <div className="flex flex-wrap gap-2">
            {[
              { to: "/novo-orcamento", label: "Novo orçamento", icon: Plus },
              { to: "/clientes", label: "Clientes", icon: Users },
              { to: "/catalogo", label: "Catálogo", icon: LayoutList },
              { to: "/configuracoes-marca", label: "Marca", icon: Palette },
            ].map((a) => (
              <Link key={a.to} to={a.to}
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-[12px] font-medium text-foreground hover:border-primary/30 hover:bg-muted/30 transition-colors"
              >
                <a.icon className="h-3.5 w-3.5 text-muted-foreground" />
                {a.label}
              </Link>
            ))}
          </div>
        </Sec>

        <p className="text-[10px] text-muted-foreground/35 text-center pb-2">{t("dashboard.dataFooter")}</p>
      </div>
    </div>
  );
};

export default Index;
