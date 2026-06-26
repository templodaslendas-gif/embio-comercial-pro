import { supabase } from "@/integrations/supabase/client";

export type Servico = {
  id: string;
  user_id: string;
  cliente_id: string | null;
  titulo: string;
  tipo: string;
  data: string;
  hora: string | null;
  cidade: string | null;
  observacoes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  clientes: { nome: string } | null;
};

export type ServicoInsert = {
  cliente_id?: string | null;
  titulo: string;
  tipo?: string;
  data: string;
  hora?: string | null;
  cidade?: string | null;
  observacoes?: string | null;
  status?: string;
};

export async function fetchServicos(): Promise<Servico[]> {
  const { data, error } = await (supabase as any)
    .from("servicos")
    .select("*, clientes(nome)")
    .order("data", { ascending: true })
    .order("hora", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return data || [];
}

export async function createServico(s: ServicoInsert): Promise<Servico> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");
  const { data, error } = await (supabase as any)
    .from("servicos")
    .insert({ ...s, user_id: user.id })
    .select("*, clientes(nome)")
    .single();
  if (error) throw error;
  return data as Servico;
}

export async function updateServico(id: string, s: Partial<ServicoInsert>): Promise<Servico> {
  const { data, error } = await (supabase as any)
    .from("servicos")
    .update(s)
    .eq("id", id)
    .select("*, clientes(nome)")
    .single();
  if (error) throw error;
  return data as Servico;
}

export async function deleteServico(id: string): Promise<void> {
  const { error } = await (supabase as any).from("servicos").delete().eq("id", id);
  if (error) throw error;
}
