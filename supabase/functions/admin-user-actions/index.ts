// Edge Function: admin-user-actions
//
// Ações administrativas sobre contas de vendedores: bloquear, desbloquear,
// marcar como desligado, reativar, e enviar recuperação de senha.
//
// Por que uma Edge Function: bloquear de verdade no nível de autenticação
// (impedir login mesmo com um token ainda não expirado) exige
// auth.admin.updateUserById, que só existe com a service_role key. Essa
// chave NUNCA pode chegar ao navegador — por isso a ação roda aqui, no
// servidor, nunca no frontend.
//
// Segurança:
// - Exige um JWT válido de usuário autenticado no header Authorization.
// - Confirma que o chamador é super_admin (tabela public.user_roles, lida
//   com a service_role) antes de qualquer ação — nunca confia em um campo
//   vindo do payload do cliente.
// - service_role só é usada aqui dentro, nunca devolvida ao cliente.
// - Payload validado: ação restrita a uma lista fechada, targetUserId
//   precisa ser um UUID de verdade.
// - Um super_admin não pode bloquear/desligar a própria conta (só
//   send_password_reset é permitido sobre si mesmo).
// - Erros são logados no servidor (console.error) com detalhe técnico; a
//   resposta ao cliente é sempre uma mensagem genérica, sem stack trace,
//   sem SQL, sem nomes de coluna, sem service_role.
// - Rate limiting básico em memória por chamador (best-effort — reseta a
//   cada cold start da function; não é um rate limit distribuído. Para um
//   limite robusto entre instâncias, seria necessário um store externo,
//   fora do escopo desta missão).
//
// Deploy e testes: ver README.md nesta mesma pasta.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Action = "block" | "unblock" | "offboard" | "reactivate" | "send_password_reset";

const ALLOWED_ACTIONS: readonly Action[] = [
  "block",
  "unblock",
  "offboard",
  "reactivate",
  "send_password_reset",
];

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Rate limit básico: no máximo 1 ação a cada 2s por admin chamador.
const lastCallByAdmin = new Map<string, number>();
const MIN_INTERVAL_MS = 2000;

function jsonResponse(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return jsonResponse({ success: false, error: "Método não permitido." }, 405);
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !ANON_KEY) {
    console.error("admin-user-actions: variáveis de ambiente ausentes.");
    return jsonResponse({ success: false, error: "Função mal configurada." }, 500);
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return jsonResponse({ success: false, error: "Não autenticado." }, 401);
  }
  const callerJwt = authHeader.replace("Bearer ", "").trim();

  // Cliente escopado ao chamador (anon key + o JWT dele) — só para
  // confirmar quem está chamando. Nunca usado para ações sobre outros
  // usuários.
  const callerClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: callerData, error: callerErr } = await callerClient.auth.getUser(callerJwt);
  if (callerErr || !callerData?.user) {
    return jsonResponse({ success: false, error: "Não autenticado." }, 401);
  }
  const callerId = callerData.user.id;

  // Cliente com service_role — nunca exposto ao cliente, usado só a partir
  // daqui, e só depois de confirmar abaixo que o chamador é super_admin.
  const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const { data: callerRole, error: roleErr } = await adminClient
    .from("user_roles")
    .select("role")
    .eq("user_id", callerId)
    .eq("role", "super_admin")
    .maybeSingle();

  if (roleErr) {
    console.error("admin-user-actions: erro ao checar role do chamador:", roleErr.message);
    return jsonResponse({ success: false, error: "Falha ao validar permissão." }, 500);
  }
  if (!callerRole) {
    return jsonResponse({ success: false, error: "Acesso negado." }, 403);
  }

  // Rate limit básico por admin chamador.
  const now = Date.now();
  const lastCall = lastCallByAdmin.get(callerId) ?? 0;
  if (now - lastCall < MIN_INTERVAL_MS) {
    return jsonResponse({ success: false, error: "Muitas requisições. Aguarde um instante." }, 429);
  }
  lastCallByAdmin.set(callerId, now);

  let payload: { action?: unknown; targetUserId?: unknown };
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ success: false, error: "Corpo da requisição inválido." }, 400);
  }

  const { action, targetUserId } = payload;
  if (typeof action !== "string" || !ALLOWED_ACTIONS.includes(action as Action)) {
    return jsonResponse({ success: false, error: "Ação inválida." }, 400);
  }
  if (typeof targetUserId !== "string" || !UUID_RE.test(targetUserId)) {
    return jsonResponse({ success: false, error: "Usuário alvo inválido." }, 400);
  }

  if (targetUserId === callerId && action !== "send_password_reset") {
    return jsonResponse(
      { success: false, error: "Você não pode aplicar esta ação à sua própria conta." },
      400,
    );
  }

  try {
    if (action === "send_password_reset") {
      const { data: targetUser, error: getErr } = await adminClient.auth.admin.getUserById(targetUserId);
      if (getErr || !targetUser?.user?.email) {
        return jsonResponse({ success: false, error: "Usuário alvo não encontrado." }, 404);
      }
      const { error: resetErr } = await callerClient.auth.resetPasswordForEmail(targetUser.user.email);
      if (resetErr) {
        console.error("admin-user-actions: erro ao enviar recuperação de senha:", resetErr.message);
        return jsonResponse({ success: false, error: "Falha ao enviar recuperação de senha." }, 500);
      }
      return jsonResponse({ success: true, action, targetUserId }, 200);
    }

    // Sem valor literal de "permanente" no GoTrue: usamos uma duração muito
    // longa (~100 anos) como bloqueio efetivamente indefinido, revertida
    // por "none" ao desbloquear/reativar.
    const banDuration = action === "unblock" || action === "reactivate" ? "none" : "876000h";
    const newStatus =
      action === "block" ? "bloqueado" : action === "offboard" ? "desligado" : "ativo";

    const { error: banErr } = await adminClient.auth.admin.updateUserById(targetUserId, {
      ban_duration: banDuration,
    });
    if (banErr) {
      console.error("admin-user-actions: erro ao atualizar auth.users:", banErr.message);
      return jsonResponse({ success: false, error: "Falha ao atualizar acesso do usuário." }, 500);
    }

    // Segunda camada (profile.status), mantida em sincronia com o estado
    // real do Auth. Se isto falhar depois do ban ter sido aplicado com
    // sucesso, o acesso já está bloqueado — reportamos o problema de
    // sincronia sem reverter a ação de segurança já concluída.
    const { error: statusErr } = await adminClient
      .from("profiles")
      .update({ status: newStatus })
      .eq("user_id", targetUserId);
    if (statusErr) {
      console.error("admin-user-actions: erro ao sincronizar profiles.status:", statusErr.message);
      return jsonResponse(
        { success: false, error: "Acesso atualizado, mas falha ao sincronizar status do perfil." },
        500,
      );
    }

    return jsonResponse({ success: true, action, targetUserId, status: newStatus }, 200);
  } catch (err) {
    console.error("admin-user-actions: erro inesperado:", err instanceof Error ? err.message : String(err));
    return jsonResponse({ success: false, error: "Erro interno." }, 500);
  }
});
