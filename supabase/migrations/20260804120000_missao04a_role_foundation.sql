-- ============================================================
-- MIGRATION: missao04a_role_foundation
-- Origem: Missão 04A — Fundação Segura do Super Admin
-- Escopo: cria a arquitetura de roles (super_admin / vendedor).
-- Nenhuma tabela existente é alterada de forma destrutiva.
-- Nenhum usuário existente é bloqueado — todos recebem 'vendedor'.
-- ATENÇÃO: aplicar manualmente no Supabase SQL Editor / CLI,
-- seguindo o padrão das migrations anteriores deste projeto.
-- ============================================================

-- 1) Tipo de role da aplicação
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('vendedor', 'super_admin');
  END IF;
END;
$$;

-- 2) Tabela de roles — fonte única e oficial de autorização.
--    Separada de profiles de propósito: nenhuma policy de INSERT/UPDATE/
--    DELETE é concedida a authenticated, então um vendedor não consegue
--    se autopromover mesmo tendo controle total da própria linha em
--    profiles (que permanece sem coluna de role).
CREATE TABLE IF NOT EXISTS public.user_roles (
  id         uuid            NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid            NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       public.app_role NOT NULL,
  created_at timestamptz     NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles (user_id);

-- Leitura: cada usuário lê apenas a própria role.
DROP POLICY IF EXISTS "Users read own role" ON public.user_roles;
CREATE POLICY "Users read own role"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Nenhuma policy de INSERT/UPDATE/DELETE para authenticated/anon é
-- criada aqui de propósito: somente service_role (Dashboard/SQL
-- Editor/futura Edge Function) pode escrever em user_roles. É isso
-- que impede escalada de privilégio via API pública.

-- 3) Função auxiliar central: has_role().
--    STABLE + SECURITY DEFINER + search_path fixo (vazio, com
--    referências totalmente qualificadas) evita search_path hijacking.
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- 4) Atalho usado nas policies de RLS (checa o usuário autenticado atual).
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT public.has_role(auth.uid(), 'super_admin'::public.app_role);
$$;

REVOKE EXECUTE ON FUNCTION public.is_super_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;

-- 5) Transição de usuários atuais: todo usuário existente sem role
--    'vendedor' a recebe agora. Idempotente — não duplica em reexecução.
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'vendedor'::public.app_role
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id AND ur.role = 'vendedor'
WHERE ur.user_id IS NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- 6) Todo novo cadastro recebe 'vendedor' automaticamente, seguindo o
--    mesmo padrão de seed_branding_on_signup / seed_catalogo_on_signup.
CREATE OR REPLACE FUNCTION public.seed_role_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'vendedor'::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.seed_role_on_signup() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_seed_role_on_signup ON auth.users;
CREATE TRIGGER trg_seed_role_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.seed_role_on_signup();
