import { supabase } from "@/integrations/supabase/client";

export type Cliente = {
  id: string;
  user_id: string;
  nome: string;
  telefone: string | null;
  endereco: string | null;
  cidade: string | null;
  observacoes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type ClienteInsert = {
  nome: string;
  telefone?: string | null;
  endereco?: string | null;
  cidade?: string | null;
  observacoes?: string | null;
  status?: string;
};

export async function fetchClientes(): Promise<Cliente[]> {
  const { data, error } = await (supabase as any)
    .from("clientes").select("*").order("nome");
  if (error) throw error;
  return data || [];
}

export async function createCliente(c: ClienteInsert): Promise<Cliente> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");
  const { data, error } = await (supabase as any)
    .from("clientes").insert({ ...c, user_id: user.id }).select().single();
  if (error) throw error;
  return data as Cliente;
}

export async function updateCliente(id: string, c: Partial<ClienteInsert>): Promise<Cliente> {
  const { data, error } = await (supabase as any)
    .from("clientes").update(c).eq("id", id).select().single();
  if (error) throw error;
  return data as Cliente;
}

export async function deleteCliente(id: string): Promise<void> {
  const { error } = await (supabase as any).from("clientes").delete().eq("id", id);
  if (error) throw error;
}
