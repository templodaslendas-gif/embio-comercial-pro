import { useEffect, useState, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { useBranding } from "@/hooks/useBranding";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FileText, CheckCircle2, Clock, XCircle, Package, Cog, ChevronDown, ChevronUp,
  Plus, Users, Palette, BookOpen, TrendingUp, BarChart3, PieChart as PieIcon, Inbox,
  LayoutList, CalendarDays,
} from "lucide-react";
import { WeatherWidget } from "@/modules/commercial/dashboard";
import { fetchCatalogo } from "@/lib/orcamentoQueries";
import { fetchClientes } from "@/lib/clientesQueries";
import { fetchServicos } from "@/lib/agendaQueries";
import {
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

interface Quote {
  id: string;
  producer_name: string;
  empresa_name: string | null;
  location: string | null;
  production_type: string;
  product_name: string;
  input_value: number;
  frascos: number;
  frequencia: string;
  detalhes: string | null;
  status: string;
  created_at: string;
  propulsores_json: any[] | null;
  aditivos_json: any[] | null;
}

function useCountUp(target: number, duration = 600) {
  const [val, setVal] = useState(0);
  const fromRef = useRef(0);
  useEffect(() => {
    const from = fromRef.current;
    let start: number | null = null;
    let raf = 0;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min(1, (ts - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const next = Math.round(from + (target - from) * eased);
      setVal(next);
      if (p < 1) raf = requestAnimationFrame(step);
      else fromRef.current = target;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

function Metric({ value }: { value: number }) {
  const v = useCountUp(value);
  return <>{v}</>;
}

const Index = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { branding } = useBranding();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  const statusLabels: Record<string, { label: string; color: string }> = {
    em_aberto: { label: t("dashboard.statusOpen"), color: "bg-yellow-500/10 text-yellow-700" },
    fechado: { label: t("dashboard.statusApproved"), color: "bg-primary/10 text-primary" },
    finalizado: { label: t("dashboard.statusFinished"), color: "bg-muted text-muted-foreground" },
  };

  const months = t("dashboard.months", { returnObjects: true }) as string[];

  useEffect(() => {
    if (!user) return;
    const fetchQuotes = async () => {
      const { data } = await supabase
        .from("quotes").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setQuotes((data as Quote[]) || []);
      setLoading(false);
    };
    fetchQuotes();
  }, [user]);

  const total = quotes.length;
  const fechados = quotes.filter((q) => q.status === "fechado");
  const finalizados = quotes.filter((q) => q.status === "finalizado");
  const emAberto = quotes.filter((q) => q.status === "em_aberto");

  const filteredByMonth = useMemo(() => {
    if (selectedMonth === "all") return quotes;
    const [year, month] = selectedMonth.split("-").map(Number);
    return quotes.filter((q) => {
      const d = new Date(q.created_at);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  }, [quotes, selectedMonth]);

  const availableMonths = useMemo(() => {
    const set = new Map<string, string>();
    quotes.forEach((q) => {
      const d = new Date(q.created_at);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!set.has(key)) set.set(key, `${months[d.getMonth()]} ${d.getFullYear()}`);
    });
    return Array.from(set.entries());
  }, [quotes, months]);

  const productDetails = useMemo(() => {
    const map: Record<string, { count: number; clients: string[] }> = {};
    quotes.forEach((q) => {
      const adts = q.aditivos_json as any[];
      if (adts && adts.length > 0) {
        adts.forEach((a: any) => {
          if (!a.produto) return;
          if (!map[a.produto]) map[a.produto] = { count: 0, clients: [] };
          map[a.produto].count += a.quantidade || 1;
          const name = q.empresa_name || q.producer_name;
          if (!map[a.produto].clients.includes(name)) map[a.produto].clients.push(name);
        });
      } else if (q.product_name && q.product_name !== "Sem aditivo") {
        if (!map[q.product_name]) map[q.product_name] = { count: 0, clients: [] };
        map[q.product_name].count += q.frascos || 1;
        const name = q.empresa_name || q.producer_name;
        if (!map[q.product_name].clients.includes(name)) map[q.product_name].clients.push(name);
      }
    });
    return map;
  }, [quotes]);

  const propulsorDetails = useMemo(() => {
    const map: Record<string, string[]> = {};
    quotes.forEach((q) => {
      const props = q.propulsores_json as any[];
      if (props && props.length > 0) {
        props.forEach((p: any) => {
          if (!p.modelo) return;
          if (!map[p.modelo]) map[p.modelo] = [];
          const name = q.empresa_name || q.producer_name;
          if (!map[p.modelo].includes(name)) map[p.modelo].push(name);
        });
      }
    });
    return map;
  }, [quotes]);

  const valorMovimentado = useMemo(() => {
    return quotes.reduce((acc, q) => {
      const v = Number(q.input_value || 0);
      const f = Number(q.frascos || 0);
      return acc + (f > 0 ? v * f : v);
    }, 0);
  }, [quotes]);

  const taxaAprovacao = useMemo(() => {
    if (total === 0) return 0;
    return Math.round((fechados.length / total) * 100);
  }, [total, fechados.length]);

  const evolution = useMemo(() => {
    const days: { label: string; date: string; count: number }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({
        date: key,
        label: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        count: 0,
      });
    }
    const idx = new Map(days.map((d, i) => [d.date, i]));
    quotes.forEach((q) => {
      const key = new Date(q.created_at).toISOString().slice(0, 10);
      const i = idx.get(key);
      if (i !== undefined) days[i].count += 1;
    });
    return days;
  }, [quotes]);

  const statusMix = useMemo(() => [
    { name: t("dashboard.statusApproved"), value: fechados.length, color: "hsl(var(--primary))" },
    { name: t("dashboard.statusOpen"), value: emAberto.length, color: "hsl(var(--accent))" },
    { name: t("dashboard.statusFinished"), value: finalizados.length, color: "hsl(var(--muted-foreground) / 0.4)" },
  ], [fechados.length, emAberto.length, finalizados.length, t]);

  const toggleCard = (id: string) => setExpandedCard((prev) => (prev === id ? null : id));

  const unitLabel = (count: number) => count === 1 ? t("common.unit") : t("common.units");

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  const firstName = (() => {
    if (branding.company_name) return branding.company_name.split(" ")[0];
    if (user?.email) {
      const local = user.email.split("@")[0];
      return local.charAt(0).toUpperCase() + local.slice(1);
    }
    return "";
  })();
  const dateLabel = now.toLocaleDateString("pt-BR", {
    weekday: "long", day: "2-digit", month: "long",
  });
  const moneyFmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

  const { data: catalogoItens = [] } = useQuery({
    queryKey: ["catalogo"],
    queryFn: fetchCatalogo,
    staleTime: 5 * 60 * 1000,
  });

  const { data: clientesData = [] } = useQuery({
    queryKey: ["clientes"],
    queryFn: fetchClientes,
    staleTime: 5 * 60 * 1000,
  });

  const { data: servicosData = [] } = useQuery({
    queryKey: ["servicos"],
    queryFn: fetchServicos,
    staleTime: 5 * 60 * 1000,
  });

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

  const today = new Date().toISOString().slice(0, 10);
  const agendaStats = useMemo(() => ({
    agendados: servicosData.filter((s) => s.status === "agendado").length,
    concluidos: servicosData.filter((s) => s.status === "concluido").length,
    hoje: servicosData.filter((s) => s.status === "agendado" && s.data === today).length,
  }), [servicosData, today]);

  const premiumCard =
    "border border-border/40 rounded-3xl bg-card/70 backdrop-blur-xl shadow-[0_8px_30px_-12px_hsl(var(--primary)/0.15)] hover:shadow-[0_14px_40px_-12px_hsl(var(--primary)/0.25)] hover:-translate-y-0.5 transition-all duration-300";

  if (loading) {
    return (
      <div className="relative space-y-8 max-w-6xl mx-auto">
        <div className="space-y-3 animate-pulse">
          <div className="h-4 w-40 rounded-full bg-muted/60" />
          <div className="h-8 w-72 rounded-lg bg-muted/60" />
          <div className="h-4 w-96 max-w-full rounded-full bg-muted/40" />
        </div>
        <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-36 rounded-3xl border border-border/40 bg-card/60 backdrop-blur animate-pulse" />
          ))}
        </div>
        <div className="grid gap-5 grid-cols-1 md:grid-cols-2">
          <div className="h-64 rounded-3xl border border-border/40 bg-card/60 backdrop-blur animate-pulse" />
          <div className="h-64 rounded-3xl border border-border/40 bg-card/60 backdrop-blur animate-pulse" />
        </div>
      </div>
    );
  }

  const renderQuoteList = (list: Quote[]) => (
    <div className="mt-4 space-y-2 border-t border-border/30 pt-3 animate-fade-in max-h-[300px] overflow-y-auto">
      {list.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-2">{t("dashboard.noQuotes")}</p>
      ) : (
        list.map((q) => {
          const s = statusLabels[q.status] || statusLabels.em_aberto;
          return (
            <div key={q.id} className="flex items-center justify-between rounded-xl bg-background/60 p-3 hover:bg-background/80 transition-colors">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">{q.empresa_name || q.producer_name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {new Date(q.created_at).toLocaleDateString("pt-BR")}
                  {q.product_name && q.product_name !== "Sem aditivo" ? ` • ${q.product_name}` : ""}
                </p>
              </div>
              <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${s.color}`}>{s.label}</span>
            </div>
          );
        })
      )}
    </div>
  );

  const quickActions = [
    { to: "/novo-orcamento", label: "Novo orçamento", icon: Plus },
    { to: "/clientes", label: "Clientes", icon: Users },
    { to: "/catalogo", label: "Catálogo", icon: LayoutList },
    { to: "/configuracoes-marca", label: "Marca", icon: Palette },
  ];

  const metricCards = [
    { id: "feitos", label: t("dashboard.quotesMade"), value: total, icon: FileText, tint: "primary" as const },
    { id: "fechados", label: t("dashboard.approved"), value: fechados.length, icon: CheckCircle2, tint: "primary" as const },
    { id: "aberto", label: t("dashboard.open"), value: emAberto.length, icon: Clock, tint: "accent" as const },
    { id: "finalizados", label: t("dashboard.finished"), value: finalizados.length, icon: XCircle, tint: "muted" as const },
  ];

  const expandedListFor = (id: string) => {
    if (id === "feitos") return (
      <div className="mt-4 space-y-3 border-t border-border/30 pt-3 animate-fade-in">
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="h-8 text-xs"><SelectValue placeholder={t("dashboard.filterByMonth")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("dashboard.allMonths")}</SelectItem>
            {availableMonths.map(([key, label]) => (<SelectItem key={key} value={key}>{label}</SelectItem>))}
          </SelectContent>
        </Select>
        {renderQuoteList(filteredByMonth)}
      </div>
    );
    if (id === "fechados") return renderQuoteList(fechados);
    if (id === "aberto") return renderQuoteList(emAberto);
    if (id === "finalizados") return renderQuoteList(finalizados);
    return null;
  };

  return (
    <div className="relative space-y-8 max-w-6xl mx-auto">
      {/* Decorative background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 w-[420px] h-[420px] rounded-full bg-accent/15 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            background:
              "radial-gradient(1200px 600px at 50% -100px, hsl(var(--primary) / 0.06), transparent 60%)",
          }}
        />
      </div>

      {/* Watermark logo */}
      {branding.logo_url && (
        <div
          aria-hidden
          className="pointer-events-none select-none absolute inset-0 z-0 flex items-center justify-center"
        >
          <img
            src={branding.logo_url}
            alt=""
            className="w-[70%] max-w-[480px] opacity-[0.05] object-contain"
          />
        </div>
      )}

      <div className="relative z-10 space-y-8">
        {/* HERO */}
        <section className="animate-fade-in">
          <div className={`${premiumCard} p-5 sm:p-7`}>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                  {greeting}{firstName ? `, ${firstName}` : ""} <span aria-hidden>👋</span>
                </p>
                <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                  Painel de Orçamentos
                </h1>
                <p className="text-muted-foreground mt-1.5 text-sm">
                  Acompanhe performance, aprovações e movimentações comerciais
                </p>
                <p className="mt-2 text-[11px] uppercase tracking-wider text-muted-foreground/70">
                  {dateLabel}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:gap-4 sm:min-w-[360px]">
                <div className="rounded-2xl bg-background/50 border border-border/40 p-3 sm:p-4">
                  <p className="text-[10px] sm:text-[11px] uppercase tracking-wider text-muted-foreground">Orçamentos</p>
                  <p className="mt-1 text-lg sm:text-2xl font-bold text-foreground tabular-nums">
                    <Metric value={total} />
                  </p>
                </div>
                <div className="rounded-2xl bg-background/50 border border-border/40 p-3 sm:p-4">
                  <p className="text-[10px] sm:text-[11px] uppercase tracking-wider text-muted-foreground">Movimentado</p>
                  <p className="mt-1 text-sm sm:text-lg font-bold text-foreground tabular-nums truncate">
                    {moneyFmt.format(valorMovimentado)}
                  </p>
                </div>
                <div className="rounded-2xl bg-background/50 border border-border/40 p-3 sm:p-4">
                  <p className="text-[10px] sm:text-[11px] uppercase tracking-wider text-muted-foreground">Aprovação</p>
                  <p className="mt-1 text-lg sm:text-2xl font-bold text-foreground tabular-nums">
                    <Metric value={taxaAprovacao} />%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="animate-fade-in" style={{ animationDelay: "60ms" }}>
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3 px-1">
            Ações Rápidas
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickActions.map((a, i) => (
              <Link
                key={a.to}
                to={a.to}
                className="group flex items-center gap-2.5 rounded-2xl bg-card/60 backdrop-blur border border-border/40 hover:border-primary/40 hover:bg-card/80 px-4 py-3 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${80 + i * 60}ms` }}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <a.icon className="h-4 w-4 text-primary" />
                </span>
                <span className="text-sm font-medium text-foreground truncate">{a.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* WEATHER + CATÁLOGO + CLIENTES + AGENDA */}
        <section className="grid gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <WeatherWidget />
          <Link
            to="/catalogo"
            className="rounded-2xl border border-border/40 bg-card/70 backdrop-blur-xl p-4 hover:border-primary/30 hover:bg-card/90 transition-all duration-300 group block"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <LayoutList className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Catálogo de Itens</p>
                <p className="text-[11px] text-muted-foreground">Produtos e serviços</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-background/50 border border-border/30 p-2 text-center">
                <p className="text-xl font-bold text-foreground tabular-nums"><Metric value={catalogoStats.total} /></p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Total</p>
              </div>
              <div className="rounded-lg bg-background/50 border border-border/30 p-2 text-center">
                <p className="text-xl font-bold text-foreground tabular-nums"><Metric value={catalogoStats.ativos} /></p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Ativos</p>
              </div>
              <div className="rounded-lg bg-background/50 border border-border/30 p-2 text-center">
                <p className="text-xl font-bold text-foreground tabular-nums"><Metric value={catalogoStats.categorias} /></p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Categorias</p>
              </div>
            </div>
          </Link>
          <Link
            to="/clientes"
            className="rounded-2xl border border-border/40 bg-card/70 backdrop-blur-xl p-4 hover:border-primary/30 hover:bg-card/90 transition-all duration-300 group block"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Clientes</p>
                <p className="text-[11px] text-muted-foreground">Base de clientes comerciais</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-background/50 border border-border/30 p-2 text-center">
                <p className="text-xl font-bold text-foreground tabular-nums"><Metric value={clientesStats.total} /></p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Total</p>
              </div>
              <div className="rounded-lg bg-background/50 border border-border/30 p-2 text-center">
                <p className="text-xl font-bold text-foreground tabular-nums"><Metric value={clientesStats.ativos} /></p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Ativos</p>
              </div>
              <div className="rounded-lg bg-background/50 border border-border/30 p-2 text-center">
                <p className="text-xl font-bold text-foreground tabular-nums"><Metric value={clientesStats.cidades} /></p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Cidades</p>
              </div>
            </div>
          </Link>
          <Link
            to="/agenda"
            className="rounded-2xl border border-border/40 bg-card/70 backdrop-blur-xl p-4 hover:border-primary/30 hover:bg-card/90 transition-all duration-300 group block"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <CalendarDays className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Agenda</p>
                <p className="text-[11px] text-muted-foreground">Visitas e compromissos</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-background/50 border border-border/30 p-2 text-center">
                <p className="text-xl font-bold text-foreground tabular-nums"><Metric value={agendaStats.agendados} /></p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Agendados</p>
              </div>
              <div className="rounded-lg bg-background/50 border border-border/30 p-2 text-center">
                <p className="text-xl font-bold text-foreground tabular-nums"><Metric value={agendaStats.concluidos} /></p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Concluídos</p>
              </div>
              <div className="rounded-lg bg-background/50 border border-border/30 p-2 text-center">
                <p className="text-xl font-bold text-foreground tabular-nums"><Metric value={agendaStats.hoje} /></p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Hoje</p>
              </div>
            </div>
          </Link>
        </section>

        {/* METRIC CARDS */}
        <section className="grid gap-4 sm:gap-5 grid-cols-2 lg:grid-cols-4">
          {metricCards.map((m, i) => {
            const tintBg =
              m.tint === "primary" ? "bg-gradient-to-br from-primary/15 to-accent/10"
              : m.tint === "accent" ? "bg-gradient-to-br from-accent/20 to-primary/10"
              : "bg-muted";
            const tintFg =
              m.tint === "primary" ? "text-primary"
              : m.tint === "accent" ? "text-accent-foreground"
              : "text-muted-foreground";
            return (
              <Card
                key={m.id}
                className={`${premiumCard} cursor-pointer animate-fade-in group`}
                style={{ animationDelay: `${120 + i * 70}ms` }}
                onClick={() => toggleCard(m.id)}
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tintBg} group-hover:scale-105 transition-transform`}>
                      <m.icon className={`h-5 w-5 ${tintFg}`} />
                    </div>
                    {expandedCard === m.id
                      ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <p className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight tabular-nums">
                    <Metric value={m.value} />
                  </p>
                  <p className="text-xs text-muted-foreground mt-1.5 font-medium">{m.label}</p>
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground/80">
                    <span className="text-muted-foreground/60">—</span>
                    <span>Últimos 30 dias</span>
                  </div>
                  {expandedCard === m.id && expandedListFor(m.id)}
                </CardContent>
              </Card>
            );
          })}
        </section>

        {/* CHARTS */}
        <section className="grid gap-5 grid-cols-1 md:grid-cols-2">
          <Card className={`${premiumCard} animate-fade-in`} style={{ animationDelay: "300ms" }}>
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Evolução</p>
                    <p className="text-[11px] text-muted-foreground">Orçamentos · últimos 30 dias</p>
                  </div>
                </div>
                <BarChart3 className="h-4 w-4 text-muted-foreground/60" />
              </div>

              {quotes.length === 0 ? (
                <EmptyChart />
              ) : (
                <div className="h-48 -mx-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={evolution} margin={{ top: 10, right: 8, left: 8, bottom: 0 }}>
                      <defs>
                        <linearGradient id="evoGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                        axisLine={false}
                        tickLine={false}
                        interval={Math.ceil(evolution.length / 6)}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 12,
                          fontSize: 12,
                        }}
                        labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        fill="url(#evoGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className={`${premiumCard} animate-fade-in`} style={{ animationDelay: "370ms" }}>
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                    <PieIcon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Mix de Status</p>
                    <p className="text-[11px] text-muted-foreground">Distribuição dos orçamentos</p>
                  </div>
                </div>
              </div>

              {quotes.length === 0 ? (
                <EmptyChart />
              ) : (
                <div className="flex items-center gap-4">
                  <div className="h-44 w-44 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusMix}
                          dataKey="value"
                          innerRadius={48}
                          outerRadius={72}
                          paddingAngle={2}
                          stroke="none"
                        >
                          {statusMix.map((s, i) => (
                            <Cell key={i} fill={s.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: 12,
                            fontSize: 12,
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <ul className="flex-1 space-y-2 min-w-0">
                    {statusMix.map((s) => (
                      <li key={s.name} className="flex items-center justify-between gap-2 text-xs">
                        <span className="flex items-center gap-2 min-w-0">
                          <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                          <span className="text-muted-foreground truncate">{s.name}</span>
                        </span>
                        <span className="font-semibold text-foreground tabular-nums">{s.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* PRODUCTS & PROPULSORS */}
        <section className="grid gap-5 grid-cols-1 md:grid-cols-2">
          <Card className={`${premiumCard} cursor-pointer animate-fade-in group`} style={{ animationDelay: "440ms" }} onClick={() => toggleCard("produtos")}>
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 group-hover:scale-105 transition-transform">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                {expandedCard === "produtos" ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </div>
              <p className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight tabular-nums">
                <Metric value={Object.keys(productDetails).length} />
              </p>
              <p className="text-xs text-muted-foreground mt-1.5 font-medium">{t("dashboard.quotedProducts")}</p>
              {expandedCard === "produtos" && (
                <div className="mt-4 space-y-3 border-t border-border/30 pt-3 animate-fade-in max-h-[300px] overflow-y-auto">
                  {Object.keys(productDetails).length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-2">{t("dashboard.noProducts")}</p>
                  ) : (
                    Object.entries(productDetails).map(([name, info]) => (
                      <div key={name} className="rounded-xl bg-background/60 p-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground">{name}</span>
                          <Badge variant="secondary" className="text-xs">{info.count} {unitLabel(info.count)}</Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground">{t("common.clients")}: {info.clients.join(", ")}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className={`${premiumCard} cursor-pointer animate-fade-in group`} style={{ animationDelay: "510ms" }} onClick={() => toggleCard("propulsores")}>
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 group-hover:scale-105 transition-transform">
                  <Cog className="h-5 w-5 text-primary" />
                </div>
                {expandedCard === "propulsores" ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </div>
              <p className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight tabular-nums">
                <Metric value={Object.keys(propulsorDetails).length} />
              </p>
              <p className="text-xs text-muted-foreground mt-1.5 font-medium">{t("dashboard.quotedPropulsors")}</p>
              {expandedCard === "propulsores" && (
                <div className="mt-4 space-y-3 border-t border-border/30 pt-3 animate-fade-in max-h-[300px] overflow-y-auto">
                  {Object.keys(propulsorDetails).length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-2">{t("dashboard.noPropulsors")}</p>
                  ) : (
                    Object.entries(propulsorDetails).map(([modelo, clients]) => (
                      <div key={modelo} className="rounded-xl bg-background/60 p-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground">{modelo}</span>
                          <Badge variant="secondary" className="text-xs">{clients.length} {clients.length === 1 ? t("common.client") : t("common.clients")}</Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground">{clients.join(", ")}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <p className="text-[11px] text-muted-foreground/60 text-center pt-2">{t("dashboard.dataFooter")}</p>
      </div>
    </div>
  );
};

function EmptyChart() {
  return (
    <div className="h-48 flex flex-col items-center justify-center text-center gap-2 text-muted-foreground">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/60">
        <Inbox className="h-5 w-5" />
      </div>
      <p className="text-xs max-w-[240px]">
        Os dados aparecerão conforme novos orçamentos forem criados.
      </p>
    </div>
  );
}

export default Index;
