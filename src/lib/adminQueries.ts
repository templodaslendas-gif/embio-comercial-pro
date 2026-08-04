import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/hooks/useAuth";

export type VendedorStatus = "ativo" | "bloqueado" | "desligado";

export type VendedorOverview = {
  user_id: string;
  full_name: string | null;
  email: string | null;
  telefone: string | null;
  cidade: string | null;
  estado: string | null;
  foto_url: string | null;
  status: VendedorStatus;
  role: AppRole | null;
  created_at: string;
  clientes_count: number;
  propostas_count: number;
  propostas_aprovadas: number;
  propostas_recusadas: number;
  propostas_finalizadas: number;
  valor_orcado: number;
  valor_vendido: number;
};

export type VendedorProfilePatch = {
  full_name?: string | null;
  telefone?: string | null;
  cidade?: string | null;
  estado?: string | null;
  foto_url?: string | null;
};

export async function fetchVendedoresOverview(): Promise<VendedorOverview[]> {
  const { data, error } = await supabase.rpc("admin_vendedores_overview");
  if (error) throw error;
  return (data || []) as VendedorOverview[];
}

export async function fetchVendedorProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error) throw error;
  return data;
}

export async function updateVendedorProfile(userId: string, patch: VendedorProfilePatch): Promise<void> {
  const { error } = await supabase.from("profiles").update(patch).eq("user_id", userId);
  if (error) throw error;
}

export async function fetchVendedorClientes(userId: string) {
  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchVendedorOrcamentos(userId: string) {
  const { data, error } = await supabase
    .from("orcamentos")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}
