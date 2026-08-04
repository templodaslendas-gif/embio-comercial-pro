import { supabase } from "@/integrations/supabase/client";

export type AdminUserAction = "block" | "unblock" | "offboard" | "reactivate" | "send_password_reset";

interface AdminUserActionResponse {
  success: boolean;
  error?: string;
  status?: string;
}

export async function callAdminUserAction(action: AdminUserAction, targetUserId: string): Promise<void> {
  const { data, error } = await supabase.functions.invoke<AdminUserActionResponse>("admin-user-actions", {
    body: { action, targetUserId },
  });
  if (error) throw new Error(error.message || "Falha ao executar ação administrativa.");
  if (!data?.success) throw new Error(data?.error || "Falha ao executar ação administrativa.");
}
