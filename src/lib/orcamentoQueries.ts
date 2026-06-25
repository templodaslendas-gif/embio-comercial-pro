import { supabase } from "@/integrations/supabase/client";

export type CatalogoItem = {
  id: string;
  user_id: string;
  nome_item: string;
  descricao: string | null;
  categoria: string | null;
  unidade: string | null;
  valor_unitario: number;
  observacoes: string | null;
  ativo: boolean;
  ordem: number;
  created_at: string;
  updated_at: string;
};

export type CatalogoItemInsert = {
  nome_item: string;
  descricao?: string | null;
  categoria?: string | null;
  unidade?: string | null;
  valor_unitario: number;
  observacoes?: string | null;
  ativo?: boolean;
  ordem?: number;
};

export async function fetchCatalogo(): Promise<CatalogoItem[]> {
  const { data, error } = await (supabase as any)
    .from("catalogo_itens").select("*").order("ordem").order("nome_item");
  if (error) throw error;
  return data || [];
}

export async function createCatalogoItem(item: CatalogoItemInsert) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");
  const { data, error } = await (supabase as any)
    .from("catalogo_itens").insert({ ...item, user_id: user.id }).select().single();
  if (error) throw error;
  return data as CatalogoItem;
}

export async function updateCatalogoItem(id: string, item: Partial<CatalogoItemInsert>) {
  const { data, error } = await (supabase as any)
    .from("catalogo_itens").update(item).eq("id", id).select().single();
  if (error) throw error;
  return data as CatalogoItem;
}

export async function deleteCatalogoItem(id: string) {
  const { error } = await (supabase as any).from("catalogo_itens").delete().eq("id", id);
  if (error) throw error;
}

export async function ativarCatalogoItem(id: string) {
  const { error } = await (supabase as any)
    .from("catalogo_itens").update({ ativo: true }).eq("id", id);
  if (error) throw error;
}

export async function desativarCatalogoItem(id: string) {
  const { error } = await (supabase as any)
    .from("catalogo_itens").update({ ativo: false }).eq("id", id);
  if (error) throw error;
}

export async function duplicarCatalogoItem(id: string): Promise<CatalogoItem> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");
  const { data: original, error: fetchErr } = await (supabase as any)
    .from("catalogo_itens").select("*").eq("id", id).single();
  if (fetchErr) throw fetchErr;
  const { id: _id, created_at: _c, updated_at: _u, user_id: _uid, ...rest } = original;
  const { data, error } = await (supabase as any)
    .from("catalogo_itens")
    .insert({ ...rest, nome_item: `${rest.nome_item} (cópia)`, user_id: user.id })
    .select()
    .single();
  if (error) throw error;
  return data as CatalogoItem;
}
