import { safeMoney } from "@/lib/utils";
import type { OrcamentoComercial } from "@/lib/orcamentosComercialQueries";

export function lastNMonths(n: number) {
  const now = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (n - 1 - i), 1);
    return {
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
    };
  });
}

export function buildMonthlyChartData(orcamentos: OrcamentoComercial[], months = 6) {
  const monthList = lastNMonths(months);
  const buckets = new Map(monthList.map((m) => [m.key, { label: m.label, propostas: 0, valorVendido: 0 }]));
  orcamentos.forEach((o) => {
    const d = new Date(o.created_at);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const bucket = buckets.get(key);
    if (!bucket) return;
    bucket.propostas += 1;
    if (o.status === "aprovado" || o.status === "finalizado") bucket.valorVendido += safeMoney(o.total);
  });
  return Array.from(buckets.values());
}

// "Parada" considera só propostas em_aberto — só faz sentido medir tempo
// parado para o que ainda está pendente de decisão. Usa updated_at (cai
// para created_at se nunca foi atualizada, a melhor data real disponível).
export function buildParadasBuckets(orcamentos: OrcamentoComercial[]) {
  const now = Date.now();
  const buckets = { "7–14 dias": 0, "15–29 dias": 0, "30+ dias": 0 };
  orcamentos
    .filter((o) => o.status === "em_aberto")
    .forEach((o) => {
      const ref = o.updated_at || o.created_at;
      const days = Math.floor((now - new Date(ref).getTime()) / 86_400_000);
      if (days >= 30) buckets["30+ dias"] += 1;
      else if (days >= 15) buckets["15–29 dias"] += 1;
      else if (days >= 7) buckets["7–14 dias"] += 1;
    });
  return Object.entries(buckets).map(([label, value]) => ({ label, value }));
}

export function buildFunilData(orcamentos: OrcamentoComercial[]) {
  const counts = { em_aberto: 0, aprovado: 0, recusado: 0, finalizado: 0 };
  orcamentos.forEach((o) => { counts[o.status] = (counts[o.status] ?? 0) + 1; });
  return [
    { name: "Em aberto", value: counts.em_aberto, fill: "hsl(38, 92%, 50%)" },
    { name: "Aprovado", value: counts.aprovado, fill: "hsl(120, 55%, 40%)" },
    { name: "Recusado", value: counts.recusado, fill: "hsl(0, 65%, 52%)" },
    { name: "Finalizado", value: counts.finalizado, fill: "hsl(199, 20%, 55%)" },
  ];
}

export function computePropostaStats(orcamentos: OrcamentoComercial[]) {
  const counts = { em_aberto: 0, aprovado: 0, recusado: 0, finalizado: 0 };
  orcamentos.forEach((o) => { counts[o.status] = (counts[o.status] ?? 0) + 1; });
  const total = orcamentos.length;
  const valorOrcado = orcamentos.reduce((s, o) => s + safeMoney(o.total), 0);
  const valorVendido = orcamentos
    .filter((o) => o.status === "aprovado" || o.status === "finalizado")
    .reduce((s, o) => s + safeMoney(o.total), 0);
  return {
    total,
    ...counts,
    valorOrcado,
    valorVendido,
    ticketMedio: total > 0 ? valorOrcado / total : 0,
    conversao: total > 0 ? ((counts.aprovado + counts.finalizado) / total) * 100 : 0,
  };
}
