import { supabase } from "@/integrations/supabase/client";
import { safeMoney } from "@/lib/utils";

export type MovTipo = "entrada" | "saida";
export type MovStatus = "pendente" | "pago" | "vencido" | "cancelado";

export interface FinanceiroMovimentacao {
  id: string;
  user_id: string;
  tipo: MovTipo;
  descricao: string;
  categoria: string | null;
  valor: number;
  data_vencimento: string | null;
  data_pagamento: string | null;
  status: MovStatus;
  forma_pagamento: string | null;
  observacoes: string | null;
  orcamento_id: string | null;
  cliente_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface MovimentacaoDraft {
  tipo: MovTipo;
  descricao: string;
  categoria?: string | null;
  valor: number;
  data_vencimento?: string | null;
  data_pagamento?: string | null;
  status?: MovStatus;
  forma_pagamento?: string | null;
  observacoes?: string | null;
  orcamento_id?: string | null;
  cliente_id?: string | null;
}

export interface FinanceiroRealMetrics {
  totalEntradas: number;
  totalSaidas: number;
  saldoPrevisto: number;
  saldoRealizado: number;
  contasPendentes: number;
  contasVencidas: number;
  countPendentes: number;
  countVencidas: number;
  entradasMes: number;
  saidasMes: number;
  pendentesMes: number;
}

const db = () => (supabase as any).from("financeiro_movimentacoes");

export async function fetchMovimentacoes(): Promise<FinanceiroMovimentacao[]> {
  const { data, error } = await db()
    .select("*")
    .order("data_vencimento", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createMovimentacao(
  draft: MovimentacaoDraft,
): Promise<FinanceiroMovimentacao> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");
  const { data, error } = await db()
    .insert({ ...draft, user_id: user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateMovimentacao(
  id: string,
  draft: Partial<MovimentacaoDraft>,
): Promise<void> {
  const { error } = await db().update(draft).eq("id", id);
  if (error) throw error;
}

export async function deleteMovimentacao(id: string): Promise<void> {
  const { error } = await db().delete().eq("id", id);
  if (error) throw error;
}

export async function marcarComoPago(
  id: string,
  data_pagamento: string,
): Promise<void> {
  const { error } = await db()
    .update({ status: "pago", data_pagamento })
    .eq("id", id);
  if (error) throw error;
}

export async function cancelarMovimentacao(id: string): Promise<void> {
  const { error } = await db().update({ status: "cancelado" }).eq("id", id);
  if (error) throw error;
}

export async function ensureEntradaFromOrcamento(orc: {
  id: string;
  cliente_id: string | null;
  cliente_nome: string | null;
  numero_orcamento: string | null;
  total: number | string;
}): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { data: existing } = await db()
    .select("id")
    .eq("orcamento_id", orc.id)
    .neq("status", "cancelado")
    .limit(1);
  if (existing && existing.length > 0) return;
  const valor = safeMoney(orc.total);
  const descricao = [orc.numero_orcamento, orc.cliente_nome].filter(Boolean).join(" — ") || "Proposta aprovada";
  await db().insert({
    user_id: user.id,
    tipo: "entrada",
    descricao,
    categoria: "Propostas",
    valor,
    status: "pendente",
    orcamento_id: orc.id,
    cliente_id: orc.cliente_id,
    data_vencimento: new Date().toISOString().slice(0, 10),
  });
}

export async function cancelarEntradaByOrcamento(orcamentoId: string): Promise<void> {
  await db()
    .update({ status: "cancelado" })
    .eq("orcamento_id", orcamentoId)
    .neq("status", "cancelado");
}

export async function fetchRealMetrics(): Promise<FinanceiroRealMetrics> {
  const { data, error } = await db().select(
    "tipo,valor,status,data_vencimento",
  );
  if (error) throw error;
  const rows: Array<{
    tipo: string;
    valor: number;
    status: string;
    data_vencimento: string | null;
  }> = data ?? [];

  const today = new Date().toISOString().slice(0, 10);
  const paid = rows.filter((r) => r.status === "pago");
  const pending = rows.filter((r) => r.status === "pendente");
  const vencidas = rows.filter(
    (r) =>
      r.status === "pendente" &&
      r.data_vencimento &&
      r.data_vencimento < today,
  );

  const sum = (arr: typeof rows, tipo: string) =>
    arr
      .filter((r) => r.tipo === tipo)
      .reduce((s, r) => s + safeMoney(r.valor), 0);

  const notCanceled = rows.filter((r) => r.status !== "cancelado");
  const entPrev = sum(notCanceled, "entrada");
  const saiPrev = sum(notCanceled, "saida");

  const mes = today.slice(0, 7);
  const rowsMes = notCanceled.filter((r) => (r.data_vencimento ?? "").startsWith(mes));
  const pendingMes = pending.filter((r) => (r.data_vencimento ?? "").startsWith(mes));

  return {
    totalEntradas: entPrev,
    totalSaidas: saiPrev,
    saldoPrevisto: entPrev - saiPrev,
    saldoRealizado: sum(paid, "entrada") - sum(paid, "saida"),
    contasPendentes: sum(pending, "entrada") + sum(pending, "saida"),
    contasVencidas: sum(vencidas, "entrada") + sum(vencidas, "saida"),
    countPendentes: pending.length,
    countVencidas: vencidas.length,
    entradasMes: sum(rowsMes, "entrada"),
    saidasMes: sum(rowsMes, "saida"),
    pendentesMes: sum(pendingMes, "entrada") + sum(pendingMes, "saida"),
  };
}

export async function fetchChartData(): Promise<
  Array<{ mes: string; entradas: number; saidas: number; saldo: number }>
> {
  const { data, error } = await db()
    .select("tipo,valor,status,data_vencimento")
    .neq("status", "cancelado");
  if (error) throw error;
  const rows: Array<{
    tipo: string;
    valor: number;
    status: string;
    data_vencimento: string | null;
  }> = data ?? [];

  const map: Record<string, { entradas: number; saidas: number }> = {};
  rows.forEach((r) => {
    const key = (r.data_vencimento ?? r.tipo).slice(0, 7);
    if (!map[key]) map[key] = { entradas: 0, saidas: 0 };
    if (r.tipo === "entrada") map[key].entradas += safeMoney(r.valor);
    else map[key].saidas += safeMoney(r.valor);
  });

  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([mes, v]) => ({
      mes: new Date(mes + "-01").toLocaleDateString("pt-BR", {
        month: "short",
        year: "2-digit",
      }),
      entradas: v.entradas,
      saidas: v.saidas,
      saldo: v.entradas - v.saidas,
    }));
}

export async function fetchCategoriaData(): Promise<
  Array<{ categoria: string; valor: number; tipo: string }>
> {
  const { data, error } = await db()
    .select("categoria,valor,tipo,status")
    .neq("status", "cancelado");
  if (error) throw error;
  const rows: Array<{
    categoria: string | null;
    valor: number;
    tipo: string;
  }> = data ?? [];

  const map: Record<string, { valor: number; tipo: string }> = {};
  rows.forEach((r) => {
    const key = r.categoria || "Sem categoria";
    if (!map[key]) map[key] = { valor: 0, tipo: r.tipo };
    map[key].valor += safeMoney(r.valor);
  });

  return Object.entries(map)
    .map(([categoria, v]) => ({ categoria, ...v }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 8);
}
