-- ============================================================
-- MIGRATION: missao03b_integrity_hardening
-- Origem: Missão 03B — Validação Remota, Types e Integridade
-- Escopo: correções pequenas, seguras e comprovadas apenas.
-- Nenhuma tabela, coluna ou dado existente é apagado nesta migration.
-- ATENÇÃO: NÃO aplicada remotamente automaticamente por este agente.
-- Requer autorização explícita do responsável antes da aplicação
-- (ver relatório da Missão 03B).
-- ============================================================

-- 1) SECURITY DEFINER exposto como endpoint público via RPC
--    (confirmado pelo `supabase db advisors` contra o projeto remoto real:
--    anon_security_definer_function_executable /
--    authenticated_security_definer_function_executable).
--    handle_new_user, seed_catalogo_on_signup e seed_catalogo_base só
--    devem rodar como parte dos triggers em auth.users — nunca via
--    chamada direta de RPC por um usuário. Revogar EXECUTE de
--    PUBLIC/anon/authenticated não quebra os triggers: uma função
--    SECURITY DEFINER executa com o papel do dono mesmo quando chamada
--    internamente por outra função SECURITY DEFINER.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.seed_catalogo_on_signup() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.seed_catalogo_base(uuid) FROM PUBLIC, anon, authenticated;

-- 2) Coluna ausente comprovada: o formulário de Catálogo
--    (src/modules/commercial/catalogo/CatalogoDialog.tsx) sempre envia
--    "observacoes" ao criar/editar um item, mas a tabela catalogo_itens
--    nunca teve essa coluna (confirmado via information_schema no banco
--    remoto real) — todo salvamento com este campo falha em produção.
--    Corrigido adicionando a coluna que o código já espera, em vez de
--    remover o campo da UI.
ALTER TABLE public.catalogo_itens ADD COLUMN IF NOT EXISTS observacoes text;

-- 3) Integridade cruzada entre usuários — orcamentos.cliente_id.
--    Antes: WITH CHECK só validava o dono do orçamento, não o dono do
--    cliente referenciado. Um usuário conseguia criar/atualizar um
--    orçamento apontando para cliente_id de outro usuário (não vaza
--    dados — SELECT em clientes continua isolado — mas quebra a
--    integridade de negócio). Comprovado: 0 registros existentes hoje
--    violam essa regra (checado no banco remoto antes desta correção),
--    então o novo WITH CHECK não bloqueia nenhum usuário.
DROP POLICY IF EXISTS "Users own orcamentos" ON public.orcamentos;
CREATE POLICY "Users own orcamentos"
  ON public.orcamentos FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND (
      cliente_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.clientes
        WHERE clientes.id = orcamentos.cliente_id
          AND clientes.user_id = auth.uid()
      )
    )
  );

-- 4) Integridade cruzada entre usuários — financeiro_movimentacoes
--    (cliente_id e orcamento_id). Mesmo raciocínio do item 3.
--    Comprovado: 0 registros existentes hoje violam essa regra.
DROP POLICY IF EXISTS "users_own_movimentacoes" ON public.financeiro_movimentacoes;
CREATE POLICY "users_own_movimentacoes"
  ON public.financeiro_movimentacoes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND (
      cliente_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.clientes
        WHERE clientes.id = financeiro_movimentacoes.cliente_id
          AND clientes.user_id = auth.uid()
      )
    )
    AND (
      orcamento_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.orcamentos
        WHERE orcamentos.id = financeiro_movimentacoes.orcamento_id
          AND orcamentos.user_id = auth.uid()
      )
    )
  );

-- 5) Integridade cruzada entre usuários — servicos.cliente_id.
--    A tabela `servicos` (migration 20260626120000_servicos.sql) não
--    existia no banco remoto até esta missão (confirmado via
--    information_schema.tables) — foi criada separadamente, sem
--    alterações, antes desta etapa. Mesmo raciocínio dos itens 3 e 4.
DROP POLICY IF EXISTS "Users can insert own servicos" ON public.servicos;
CREATE POLICY "Users can insert own servicos"
  ON public.servicos FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND (
      cliente_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.clientes
        WHERE clientes.id = servicos.cliente_id
          AND clientes.user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can update own servicos" ON public.servicos;
CREATE POLICY "Users can update own servicos"
  ON public.servicos FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND (
      cliente_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.clientes
        WHERE clientes.id = servicos.cliente_id
          AND clientes.user_id = auth.uid()
      )
    )
  );
--
-- NOTA 2: um índice UNIQUE parcial em
-- financeiro_movimentacoes(orcamento_id) WHERE status <> 'cancelado'
-- foi avaliado para prevenir lançamentos duplicados na aprovação de
-- orçamento, mas NÃO foi incluído aqui: já existem 2 registros ativos
-- duplicados para o mesmo orcamento_id no banco remoto hoje
-- (orcamento_id = 45cf6e5a-4a26-42b1-8ed2-dcd9a8723abc). Aplicar o
-- UNIQUE agora falharia. Requer reconciliação manual primeiro — ver
-- relatório da Missão 03B.
