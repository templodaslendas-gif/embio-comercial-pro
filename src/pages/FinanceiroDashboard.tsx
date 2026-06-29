import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchFinanceiroMetrics } from "@/lib/orcamentosComercialQueries";
import { useBranding } from "@/hooks/useBranding";
import { PremiumHeader, PremiumSection, PremiumCard } from "@/components/premium";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  TrendingUp, DollarSign, Target, BarChart3, CheckCircle2, Percent, Save,
} from "lucide-react";

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const pct = (v: number) => `${v.toFixed(1)}%`;

function MetricCard({
  icon: Icon, label, value, sub, accent = false,
}: {
  icon: React.ElementType; label: string; value: string; sub?: string; accent?: boolean;
}) {
  return (
    <PremiumCard className={`p-5 ${accent ? "ring-2 ring-primary/20 bg-primary/5" : ""}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${accent ? "bg-primary/15" : "bg-muted/60"}`}>
          <Icon className={`h-5 w-5 ${accent ? "text-primary" : "text-muted-foreground"}`} />
        </div>
      </div>
      <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      {sub && <p className="text-xs text-muted-foreground/60 mt-1">{sub}</p>}
    </PremiumCard>
  );
}

export default function FinanceiroDashboard() {
  const { branding, save } = useBranding();
  const [metaInput, setMetaInput] = useState("");
  const [savingMeta, setSavingMeta] = useState(false);

  const { data: metrics, isLoading } = useQuery({
    queryKey: ["financeiro-metrics"],
    queryFn: fetchFinanceiroMetrics,
    refetchInterval: 60_000,
  });

  const metaMensal = Number(branding.meta_mensal ?? 0);
  const progressMeta =
    metaMensal > 0 && metrics ? Math.min(100, (metrics.totalAprovado / metaMensal) * 100) : 0;

  const handleSaveMeta = async () => {
    const v = parseFloat(metaInput.replace(",", "."));
    if (isNaN(v) || v < 0) { toast.error("Valor inválido"); return; }
    setSavingMeta(true);
    const { error } = await save({ meta_mensal: v });
    setSavingMeta(false);
    if (error) toast.error("Erro ao salvar meta");
    else { toast.success("Meta mensal salva"); setMetaInput(""); }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PremiumHeader
        icon={BarChart3}
        badge="Módulo Comercial"
        title="Painel Financeiro"
        subtitle="Indicadores comerciais em tempo real"
        variant="gradient"
      />

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : metrics ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <MetricCard
              icon={DollarSign} label="Total Orçado" value={brl(metrics.totalOrcado)}
              sub={`${metrics.countTotal} proposta(s)`}
            />
            <MetricCard
              icon={CheckCircle2} label="Total Aprovado" value={brl(metrics.totalAprovado)}
              sub={`${metrics.countAprovado} fechada(s)`} accent
            />
            <MetricCard
              icon={TrendingUp} label="Receita Confirmada" value={brl(metrics.totalFinalizado)}
              sub="Propostas finalizadas"
            />
            <MetricCard
              icon={BarChart3} label="Ticket Médio" value={brl(metrics.ticketMedio)}
              sub="Por proposta"
            />
            <MetricCard
              icon={Percent} label="Taxa de Conversão" value={pct(metrics.taxaConversao)}
              sub="Aprovadas / total"
            />
            <MetricCard
              icon={Target} label="Meta Mensal" value={brl(metaMensal)}
              sub={metaMensal > 0 ? `${pct(progressMeta)} atingido` : "Não definida"}
            />
          </div>

          {metaMensal > 0 && (
            <PremiumSection label="Progresso da Meta Mensal">
              <PremiumCard className="p-5">
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-muted-foreground">
                    Aprovado: <strong className="text-foreground">{brl(metrics.totalAprovado)}</strong>
                  </span>
                  <span className="text-muted-foreground">
                    Meta: <strong className="text-foreground">{brl(metaMensal)}</strong>
                  </span>
                </div>
                <Progress value={progressMeta} className="h-3" />
                <p className="text-right text-xs text-muted-foreground mt-1.5">
                  {pct(progressMeta)} da meta atingida
                </p>
              </PremiumCard>
            </PremiumSection>
          )}
        </>
      ) : null}

      <PremiumSection label="Configurar Meta Mensal">
        <PremiumCard className="p-5">
          <p className="text-sm text-muted-foreground mb-4">
            Defina a meta de vendas mensais para acompanhar o progresso.
          </p>
          <div className="flex gap-3 items-end max-w-sm">
            <div className="flex-1 space-y-1.5">
              <Label>Meta mensal (R$)</Label>
              <Input
                type="number" min="0" step="100"
                placeholder={metaMensal > 0 ? String(metaMensal) : "Ex: 50000"}
                value={metaInput}
                onChange={(e) => setMetaInput(e.target.value)}
              />
            </div>
            <Button onClick={handleSaveMeta} disabled={savingMeta || !metaInput}>
              <Save className="h-4 w-4 mr-1.5" /> Salvar
            </Button>
          </div>
        </PremiumCard>
      </PremiumSection>
    </div>
  );
}
