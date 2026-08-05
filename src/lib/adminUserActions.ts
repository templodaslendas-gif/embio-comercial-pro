import { supabase } from "@/integrations/supabase/client";

export type AdminUserAction =
  | "block"
  | "unblock"
  | "offboard"
  | "reactivate"
  | "send_password_reset"
  | "resend_invite";

interface AdminUserActionResponse {
  success: boolean;
  error?: string;
  status?: string;
  targetUserId?: string;
}

export interface InviteVendedorInput {
  email: string;
  fullName: string;
  telefone?: string;
  cidade?: string;
  estado?: string;
}

export async function callAdminUserAction(action: AdminUserAction, targetUserId: string): Promise<void> {
  const { data, error } = await supabase.functions.invoke<AdminUserActionResponse>("admin-user-actions", {
    body: { action, targetUserId },
  });
  if (error) throw new Error(error.message || "Falha ao executar ação administrativa.");
  if (!data?.success) throw new Error(data?.error || "Falha ao executar ação administrativa.");
}

export async function inviteVendedor(input: InviteVendedorInput): Promise<string> {
  const { data, error } = await supabase.functions.invoke<AdminUserActionResponse>("admin-user-actions", {
    body: { action: "invite_user", ...input },
  });
  if (error) throw new Error(error.message || "Falha ao enviar convite.");
  if (!data?.success || !data.targetUserId) throw new Error(data?.error || "Falha ao enviar convite.");
  return data.targetUserId;
}
