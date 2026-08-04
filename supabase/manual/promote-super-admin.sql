-- ============================================================
-- SCRIPT MANUAL: promote-super-admin.sql
-- NÃO faz parte da cadeia de migrations — não é aplicado
-- automaticamente por nenhuma missão. Uso único, sob demanda,
-- sempre com confirmação explícita do responsável sobre QUAL
-- usuário está sendo promovido.
--
-- Como usar:
-- 1. Rode a consulta abaixo para ver os usuários existentes:
--
--      select id, email, created_at from auth.users order by created_at;
--
-- 2. Confirme com o responsável qual email deve virar super_admin.
-- 3. Substitua o e-mail abaixo e rode o INSERT no SQL Editor do
--    Supabase Dashboard.
-- ============================================================

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'::public.app_role
FROM auth.users
WHERE email = 'SUBSTITUA-PELO-EMAIL-CONFIRMADO@exemplo.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Para reverter uma promoção (rebaixar de volta a vendedor apenas):
-- DELETE FROM public.user_roles
-- WHERE role = 'super_admin'
--   AND user_id = (SELECT id FROM auth.users WHERE email = 'SUBSTITUA@exemplo.com');
