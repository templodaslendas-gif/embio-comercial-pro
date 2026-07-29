-- ============================================================
-- MIGRATION: missao03c_function_hardening
-- Origem: Missão 03C — Fase 4 (funções pendentes da Missão 03B).
--
-- set_numero_orcamento, update_orcamento_total e
-- update_financeiro_updated_at são SECURITY INVOKER (confirmado no
-- schema remoto: prosecdef=false, owner=postgres) — risco bem menor
-- que SECURITY DEFINER, mas nenhuma tinha search_path explícito
-- (proconfig=null), sinalizado pelo `supabase db advisors`
-- (function_search_path_mutable). Todas já referenciam objetos
-- qualificados com "public." no corpo; aqui só adicionamos
-- SET search_path = public como hardening — assinatura, retorno,
-- corpo e comportamento ficam idênticos aos já aplicados no remoto.
-- CREATE OR REPLACE preserva o OID da função, então os triggers
-- existentes (trg_set_numero_orcamento, trg_update_orcamento_total,
-- trg_financeiro_movimentacoes_updated_at) continuam apontando para
-- a mesma função automaticamente, sem precisar recriá-los.
-- ============================================================

CREATE OR REPLACE FUNCTION public.set_numero_orcamento()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF NEW.numero_orcamento IS NULL THEN
    NEW.numero_orcamento := 'ORC-' || LPAD(nextval('public.orcamentos_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_financeiro_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_orcamento_total()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_orcamento_id uuid;
BEGIN
  v_orcamento_id := COALESCE(NEW.orcamento_id, OLD.orcamento_id);
  UPDATE public.orcamentos
  SET
    total      = (SELECT COALESCE(SUM(subtotal), 0) FROM public.orcamento_itens WHERE orcamento_id = v_orcamento_id),
    updated_at = now()
  WHERE id = v_orcamento_id;
  RETURN COALESCE(NEW, OLD);
END;
$$;
