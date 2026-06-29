import { supabase } from "@/integrations/supabase/client";

export type OrcamentoStatus = 'em_aberto' | 'aprovado' | 'recusado' | 'finalizado';

export type OrcamentoComercial = {
  id: string;
  user_id: string;
  numero_orcamento: string | null;
  cliente_id: string | null;
  cliente_nome: string | null;
  status: OrcamentoStatus;
  validade_dias: number;
  forma_pagamento: string | null;
  observacoes: string | null;
  total: number;
  created_at: string;
  updated_at: string;
};

export type OrcamentoItem = {
  id: string;
  orcamento_id: string;
  catalogo_item_id: string | null;
  nome_item: string;
  descricao: string | null;
  unidade: string | null;
  quantidade: number;
  valor_unitario: number;
  subtotal: number;
  ordem: number;
};

export type OrcamentoItemDraft = {
  catalogo_item_id?: string | null;
  nome_item: string;
  descricao?: string | null;
  unidade?: string | null;
  quantidade: number;
  valor_unitario: number;
  ordem?: number;
};

export type OrcamentoDraft = {
  cliente_id?: string | null;
  cliente_nome?: string | null;
  validade_dias?: number;
  forma_pagamento?: string | null;
  observacoes?: string | null;
};

export type FinanceiroMetrics = {
  totalOrcado: number;
  totalAprovado: number;
  totalFinalizado: number;
  countTotal: number;
  countAprovado: number;
  taxaConversao: number;
  ticketMedio: number;
};

export async function fetchOrcamentos(): Promise<OrcamentoComercial[]> {
  const { data, error } = await (supabase as any)
    .from('orcamentos')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchOrcamentoById(id: string): Promise<OrcamentoComercial & { itens: OrcamentoItem[] }> {
  const { data, error } = await (supabase as any)
    .from('orcamentos')
    .select('*, orcamento_itens(*)')
    .eq('id', id)
    .single();
  if (error) throw error;
  const itens = (data.orcamento_itens || []).sort((a: OrcamentoItem, b: OrcamentoItem) => a.ordem - b.ordem);
  return { ...data, itens };
}

export async function createOrcamento(
  draft: OrcamentoDraft,
  itens: OrcamentoItemDraft[],
): Promise<OrcamentoComercial> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');
  const { data: orc, error: orcErr } = await (supabase as any)
    .from('orcamentos')
    .insert({ ...draft, user_id: user.id })
    .select()
    .single();
  if (orcErr) throw orcErr;
  if (itens.length > 0) {
    const rows = itens.map((item, i) => ({ ...item, orcamento_id: orc.id, ordem: item.ordem ?? i }));
    const { error: iErr } = await (supabase as any).from('orcamento_itens').insert(rows);
    if (iErr) throw iErr;
  }
  const { data: fresh, error: fErr } = await (supabase as any)
    .from('orcamentos').select('*').eq('id', orc.id).single();
  if (fErr) throw fErr;
  return fresh;
}

export async function updateOrcamento(
  id: string,
  draft: OrcamentoDraft,
  itens: OrcamentoItemDraft[],
): Promise<void> {
  const { error: oErr } = await (supabase as any)
    .from('orcamentos')
    .update({ ...draft, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (oErr) throw oErr;
  const { error: dErr } = await (supabase as any)
    .from('orcamento_itens').delete().eq('orcamento_id', id);
  if (dErr) throw dErr;
  if (itens.length > 0) {
    const rows = itens.map((item, i) => ({ ...item, orcamento_id: id, ordem: item.ordem ?? i }));
    const { error: iErr } = await (supabase as any).from('orcamento_itens').insert(rows);
    if (iErr) throw iErr;
  }
}

export async function updateOrcamentoStatus(id: string, status: OrcamentoStatus): Promise<void> {
  const { error } = await (supabase as any)
    .from('orcamentos')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteOrcamento(id: string): Promise<void> {
  const { error } = await (supabase as any).from('orcamentos').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchFinanceiroMetrics(): Promise<FinanceiroMetrics> {
  const { data, error } = await (supabase as any)
    .from('orcamentos').select('status, total');
  if (error) throw error;
  const all: { status: string; total: number }[] = data || [];
  const totalOrcado = all.reduce((s, r) => s + Number(r.total), 0);
  const aprovados = all.filter((r) => r.status === 'aprovado' || r.status === 'finalizado');
  const finalizados = all.filter((r) => r.status === 'finalizado');
  return {
    totalOrcado,
    totalAprovado: aprovados.reduce((s, r) => s + Number(r.total), 0),
    totalFinalizado: finalizados.reduce((s, r) => s + Number(r.total), 0),
    countTotal: all.length,
    countAprovado: aprovados.length,
    taxaConversao: all.length > 0 ? (aprovados.length / all.length) * 100 : 0,
    ticketMedio: all.length > 0 ? totalOrcado / all.length : 0,
  };
}
