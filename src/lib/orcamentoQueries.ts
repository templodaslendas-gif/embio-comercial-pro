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
};

// Requires table `catalogo_itens` — migration pending before activation
export async function fetchCatalogo(): Promise<CatalogoItem[]> {
  const { data, error } = await (supabase as any)
    .from("catalogo_itens").select("*").order("nome_item");
  if (error) throw error;
  return data || [];
}

export async function createCatalogoItem(item: CatalogoItemInsert) {
  const { data, error } = await (supabase as any)
    .from("catalogo_itens").insert(item).select().single();
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
