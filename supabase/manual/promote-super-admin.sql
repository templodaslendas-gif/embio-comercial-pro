-- ============================================================
-- SCRIPT MANUAL: promote-super-admin.sql
-- NÃO faz parte da cadeia de migrations — não é aplicado
-- automaticamente por nenhuma missão. Uso único, sob demanda,
-- sempre com confirmação explícita do responsável sobre QUAL
-- usuário está sendo promovido.
--
-- Desde a Missão 04A.1, public.user_roles tem UNIQUE(user_id):
-- cada usuário só pode ter uma role por vez. Os comandos abaixo usam
-- ON CONFLICT (user_id) DO UPDATE — a role é SUBSTITUÍDA, nunca
-- adicionada como uma segunda linha. Não use DELETE para trocar de
-- role em uso normal.
--
-- Como usar:
-- 1. Rode a consulta abaixo para ver os usuários existentes:
--
--      select id, email, created_at from auth.users order by created_at;
--
-- 2. Confirme com o responsável qual email deve virar super_admin
--    (ou voltar a vendedor).
-- 3. Substitua o e-mail abaixo e rode o comando desejado no SQL
--    Editor do Supabase Dashboard.
-- ============================================================

-- Promover a super_admin:
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'::public.app_role
FROM auth.users
WHERE email = 'SUBSTITUA-PELO-EMAIL-CONFIRMADO@exemplo.com'
ON CONFLICT (user_id)
DO UPDATE SET role = EXCLUDED.role;

-- Rebaixar de volta a vendedor:
-- INSERT INTO public.user_roles (user_id, role)
-- SELECT id, 'vendedor'::public.app_role
-- FROM auth.users
-- WHERE email = 'SUBSTITUA-PELO-EMAIL-CONFIRMADO@exemplo.com'
-- ON CONFLICT (user_id)
-- DO UPDATE SET role = EXCLUDED.role;
