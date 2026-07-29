-- ============================================================
-- MIGRATION: missao03c_finance_unique
-- Origem: Missão 03C — proteção definitiva contra duplicidade
-- financeira (Fase 2).
--
-- Regra de negócio confirmada com o responsável: uma vez que exista
-- um lançamento "entrada" ativo (status <> 'cancelado') para um
-- orçamento, nenhum outro lançamento "entrada" ativo pode ser criado
-- para o mesmo orçamento — nem pela aprovação automática, nem pelo
-- botão manual "Lançar no financeiro". É exatamente o que causou a
-- duplicidade do ORC-1008 (reconciliada na migration anterior,
-- 20260729145000).
--
-- Valores reais confirmados no schema remoto antes de criar o índice
-- (não assumidos):
--   tipo   IN ('entrada','saida')            -- financeiro_movimentacoes_tipo_check
--   status IN ('pendente','pago','vencido','cancelado') -- financeiro_movimentacoes_status_check
-- Verificado também: 0 grupos (user_id, orcamento_id, tipo='entrada',
-- status<>'cancelado') com mais de 1 registro no banco remoto no
-- momento desta migration (a única violação existente, ORC-1008, foi
-- reconciliada antes).
-- ============================================================

CREATE UNIQUE INDEX IF NOT EXISTS idx_financeiro_entrada_unica_por_orcamento
  ON public.financeiro_movimentacoes (user_id, orcamento_id)
  WHERE orcamento_id IS NOT NULL
    AND tipo = 'entrada'
    AND status <> 'cancelado';

-- Criação atômica da entrada financeira de aprovação. Roda como
-- SECURITY INVOKER (o chamador, não um dono elevado) para continuar
-- sujeita a toda a RLS/WITH CHECK já existente em
-- financeiro_movimentacoes (dono do orçamento, dono do cliente).
-- A validação explícita de auth.uid()/dono do orçamento aqui serve só
-- para dar um erro claro antes de bater na RLS.
CREATE OR REPLACE FUNCTION public.registrar_entrada_orcamento(
  p_orcamento_id uuid,
  p_data_vencimento date DEFAULT CURRENT_DATE
)
RETURNS public.financeiro_movimentacoes
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_orc     public.orcamentos;
  v_row     public.financeiro_movimentacoes;
  v_descricao text;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT * INTO v_orc
  FROM public.orcamentos
  WHERE id = p_orcamento_id AND user_id = v_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'orcamento % not found or not owned by current user', p_orcamento_id;
  END IF;

  v_descricao := trim(both ' — ' from
    concat_ws(' — ', v_orc.numero_orcamento, v_orc.cliente_nome));
  IF v_descricao = '' THEN
    v_descricao := 'Proposta aprovada';
  END IF;

  INSERT INTO public.financeiro_movimentacoes
    (user_id, tipo, descricao, categoria, valor, status, orcamento_id, cliente_id, data_vencimento)
  VALUES
    (v_user_id, 'entrada', v_descricao, 'Propostas', v_orc.total, 'pendente',
     p_orcamento_id, v_orc.cliente_id, p_data_vencimento)
  ON CONFLICT (user_id, orcamento_id)
    WHERE (orcamento_id IS NOT NULL AND tipo = 'entrada' AND status <> 'cancelado')
  DO NOTHING
  RETURNING * INTO v_row;

  IF v_row.id IS NULL THEN
    -- Já existia uma entrada ativa: devolve a existente em vez de duplicar.
    SELECT * INTO v_row
    FROM public.financeiro_movimentacoes
    WHERE user_id = v_user_id
      AND orcamento_id = p_orcamento_id
      AND tipo = 'entrada'
      AND status <> 'cancelado'
    ORDER BY created_at ASC
    LIMIT 1;
  END IF;

  RETURN v_row;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.registrar_entrada_orcamento(uuid, date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.registrar_entrada_orcamento(uuid, date) TO authenticated;
