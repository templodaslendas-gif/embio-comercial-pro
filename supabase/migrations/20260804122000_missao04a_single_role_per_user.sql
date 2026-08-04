-- ============================================================
-- MIGRATION: missao04a_single_role_per_user
-- Origem: Missão 04A.1 — Garantir uma única role por usuário
-- Contexto: templodaslendas@gmail.com chegou a ter simultaneamente
-- 'vendedor' e 'super_admin' em public.user_roles. A duplicidade já
-- foi removida manualmente (restou apenas 'super_admin'). Esta
-- migration impede que isso volte a acontecer para qualquer usuário.
--
-- Nenhum usuário é apagado, nenhuma senha é alterada, nenhuma tabela
-- comercial é tocada. A UNIQUE(user_id, role) da migration anterior
-- (20260804120000) NÃO é removida — fica redundante, mas inofensiva.
--
-- ATENÇÃO: aplicar manualmente no Supabase SQL Editor / CLI.
-- Antes de aplicar, rode a consulta abaixo e confirme que não há
-- duplicidades (o bloco 1 abaixo também aborta com mensagem clara
-- se encontrar alguma — mas prefira checar antes, a mão):
--
--   SELECT user_id, COUNT(*) AS quantidade
--   FROM public.user_roles
--   GROUP BY user_id
--   HAVING COUNT(*) > 1;
--
-- Se essa consulta retornar alguma linha, PARE. Não decida sozinho
-- qual role manter — liste os casos e peça confirmação do
-- responsável antes de aplicar esta migration.
-- ============================================================

-- 1) Pré-checagem defensiva: aborta com mensagem clara (em vez do
--    erro genérico de violação de UNIQUE) se ainda existir algum
--    user_id duplicado. Idempotente — só falha se houver duplicidade
--    real, não por já ter sido executada antes.
DO $$
DECLARE
  v_dupes text;
BEGIN
  SELECT string_agg(user_id::text || ' (' || quantidade || ' roles)', ', ')
  INTO v_dupes
  FROM (
    SELECT user_id, COUNT(*) AS quantidade
    FROM public.user_roles
    GROUP BY user_id
    HAVING COUNT(*) > 1
  ) d;

  IF v_dupes IS NOT NULL THEN
    RAISE EXCEPTION
      'Missão 04A.1 abortada: usuários com mais de uma role encontrados (%). Resolva manualmente (decida qual role manter) antes de reaplicar esta migration.',
      v_dupes;
  END IF;
END;
$$;

-- 2) Uma linha por usuário, garantida a partir de agora.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_roles_user_id_unique'
  ) THEN
    ALTER TABLE public.user_roles
      ADD CONSTRAINT user_roles_user_id_unique UNIQUE (user_id);
  END IF;
END;
$$;

-- 3) seed_role_on_signup passa a usar ON CONFLICT (user_id) em vez de
--    (user_id, role), coerente com a nova constraint. CREATE OR
--    REPLACE preserva o OID da função, então o trigger
--    trg_seed_role_on_signup (20260804120000) continua apontando
--    para ela automaticamente, sem precisar ser recriado. Resto da
--    função é idêntico ao original.
CREATE OR REPLACE FUNCTION public.seed_role_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'vendedor'::public.app_role)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Nota: a migration 20260804120000 (não editada, conforme regra desta
-- missão) faz um backfill com ON CONFLICT (user_id, role) — se ela for
-- reaplicada manualmente depois desta migration, o backfill tentaria
-- inserir 'vendedor' para um usuário que já só tem 'super_admin' (ex.:
-- templodaslendas@gmail.com) e violaria a nova UNIQUE(user_id). Isso
-- não é um problema em uso normal (cada migration roda uma única vez),
-- só registrado aqui para quem for reaplicar migrations manualmente.
