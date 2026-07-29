-- ============================================================
-- MIGRATION: missao03c_reconcile_orc1008
-- Origem: Missão 03C — reconciliação de duplicidade financeira
-- aprovada explicitamente pelo responsável.
--
-- Contexto (evidência completa no relatório da Missão 03C):
-- O orçamento ORC-1008 (id 45cf6e5a-4a26-42b1-8ed2-dcd9a8723abc,
-- total R$ 250,00) tem 2 lançamentos "entrada" ativos de R$ 250,00
-- cada, com origens diferentes:
--   - 3e1e8b47-5d4a-494c-826d-e4651e55828a (20:27:01): criado pela
--     função automática ensureEntradaFromOrcamento na aprovação
--     (categoria "Propostas", cliente_id preenchido) — PRESERVADO.
--   - 27bf9ab8-d37d-4e6e-b1a2-4884f61c3d4a (20:28:03, 62s depois):
--     criado manualmente via botão "Lançar no financeiro"
--     (categoria/cliente_id nulos, descrição digitada à mão) —
--     duplicata do mesmo pagamento. CANCELADO nesta migration.
--
-- Nenhum registro é apagado. Apenas o status muda para 'cancelado',
-- com nota em `observacoes` para rastreabilidade. Verificado antes
-- da aplicação: nenhuma FK de outra tabela referencia
-- financeiro_movimentacoes.id, portanto não há dependência
-- bloqueando o cancelamento.
-- ============================================================

UPDATE public.financeiro_movimentacoes
SET
  status = 'cancelado',
  observacoes = COALESCE(observacoes || ' | ', '')
    || 'Cancelado em Missão 03C: duplicata do lançamento automático 3e1e8b47-5d4a-494c-826d-e4651e55828a para o mesmo orçamento (ORC-1008). Aprovado explicitamente pelo responsável.',
  updated_at = now()
WHERE id = '27bf9ab8-d37d-4e6e-b1a2-4884f61c3d4a'
  AND orcamento_id = '45cf6e5a-4a26-42b1-8ed2-dcd9a8723abc'
  AND status <> 'cancelado';
