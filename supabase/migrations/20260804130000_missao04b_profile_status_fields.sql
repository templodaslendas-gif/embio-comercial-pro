-- ============================================================
-- MIGRATION: missao04b_profile_status_fields
-- Origem: Missão 04B — Dashboard Administrativo e Gestão de Vendedores
-- Escopo: adiciona status e dados cadastrais a profiles, protege status
-- contra autoedição, e permite ao super_admin editar qualquer profile.
--
-- Nenhum usuário é apagado, nenhuma senha é alterada. Todo usuário
-- existente recebe status = 'ativo' via DEFAULT (nenhum bloqueio por
-- padrão). Não usa user_roles para status — status vive em profiles,
-- conforme preferência da missão.
-- ATENÇÃO: aplicar manualmente no Supabase SQL Editor / CLI.
-- ============================================================

-- 1) Colunas novas em profiles. status usa texto + CHECK, seguindo a
--    mesma convenção já usada em clientes.status, servicos.status e
--    orcamentos.status neste projeto (não um enum, ao contrário de
--    app_role, que é papel de autorização, não estado operacional).
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS status     text NOT NULL DEFAULT 'ativo'
    CHECK (status IN ('ativo', 'bloqueado', 'desligado')),
  ADD COLUMN IF NOT EXISTS telefone   text,
  ADD COLUMN IF NOT EXISTS cidade     text,
  ADD COLUMN IF NOT EXISTS estado     text,
  ADD COLUMN IF NOT EXISTS foto_url   text;

CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles (status);

-- 2) Proteção: só super_admin (ou a Edge Function admin-user-actions,
--    que roda com service_role depois de validar is_super_admin() por
--    conta própria em código — ver supabase/functions/admin-user-actions)
--    pode mudar profiles.status. Qualquer outro UPDATE (inclusive o
--    dono da própria linha, via "Users can update own profile") tem o
--    status silenciosamente revertido ao valor anterior — a coluna, na
--    prática, não é editável por quem não é admin, sem precisar de uma
--    policy por coluna (RLS não suporta isso diretamente).
--    auth.role() é o helper padrão do Supabase que expõe qual chave de
--    API originou a requisição ('anon' | 'authenticated' |
--    'service_role'); é assim que distinguimos a Edge Function (que
--    usa a service_role key) de um usuário comum autenticado.
CREATE OR REPLACE FUNCTION public.protect_profile_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT (public.is_super_admin() OR auth.role() = 'service_role') THEN
    NEW.status := OLD.status;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_status ON public.profiles;
CREATE TRIGGER trg_protect_profile_status
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_status();

-- 3) Super_admin pode editar qualquer profile (dados cadastrais e,
--    através do trigger acima permitindo especificamente para ele,
--    status). Policy aditiva — não substitui "Users can update own
--    profile".
DROP POLICY IF EXISTS "Admin update all profiles" ON public.profiles;
CREATE POLICY "Admin update all profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());
