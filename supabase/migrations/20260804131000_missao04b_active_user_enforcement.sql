-- ============================================================
-- MIGRATION: missao04b_active_user_enforcement
-- Origem: Missão 04B — Dashboard Administrativo e Gestão de Vendedores
-- Escopo: fecha a lacuna de um JWT ainda válido emitido antes de um
-- bloqueio (o Auth do Supabase não invalida tokens já emitidos na
-- hora). Um vendedor bloqueado/desligado que capture o próprio token
-- e chame a API diretamente (sem passar pelo app, que já força
-- sign-out) continuava lendo/gravando os próprios dados até o token
-- expirar. Esta migration fecha essa lacuna no próprio banco.
--
-- Não afeta as policies de leitura administrativa do super_admin
-- (criadas em 20260804121000) — o histórico de um vendedor
-- bloqueado/desligado continua visível para o Super Admin, como
-- pede a missão ("histórico preservado").
--
-- Nenhum dado é apagado, nenhuma tabela nova é criada.
-- ATENÇÃO: aplicar manualmente no Supabase SQL Editor / CLI.
-- ============================================================

-- 1) Função central: o dono do próprio profile está com status ativo?
--    Usuário sem profile (não deveria acontecer, handle_new_user cria
--    um em todo signup) é tratado como ativo — mesma postura "não
--    bloquear usuários atuais" adotada no resto do projeto.
CREATE OR REPLACE FUNCTION public.is_active_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(
    (SELECT status = 'ativo' FROM public.profiles WHERE user_id = auth.uid()),
    true
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_active_user() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_active_user() TO authenticated;

-- 2) Reaplica cada policy de DONO existente com "AND is_active_user()"
--    adicional. Mesmo texto de policy, mesma condição de dono, só com
--    a checagem de status somada. Policies administrativas (is_super_
--    admin()) não são tocadas.

-- clientes
DROP POLICY IF EXISTS "Users can view own clientes" ON public.clientes;
CREATE POLICY "Users can view own clientes"
  ON public.clientes FOR SELECT
  USING (auth.uid() = user_id AND public.is_active_user());

DROP POLICY IF EXISTS "Users can insert own clientes" ON public.clientes;
CREATE POLICY "Users can insert own clientes"
  ON public.clientes FOR INSERT
  WITH CHECK (auth.uid() = user_id AND public.is_active_user());

DROP POLICY IF EXISTS "Users can update own clientes" ON public.clientes;
CREATE POLICY "Users can update own clientes"
  ON public.clientes FOR UPDATE
  USING (auth.uid() = user_id AND public.is_active_user());

DROP POLICY IF EXISTS "Users can delete own clientes" ON public.clientes;
CREATE POLICY "Users can delete own clientes"
  ON public.clientes FOR DELETE
  USING (auth.uid() = user_id AND public.is_active_user());

-- catalogo_itens
DROP POLICY IF EXISTS "Users can view own catalogo_itens" ON public.catalogo_itens;
CREATE POLICY "Users can view own catalogo_itens"
  ON public.catalogo_itens FOR SELECT
  USING (auth.uid() = user_id AND public.is_active_user());

DROP POLICY IF EXISTS "Users can insert own catalogo_itens" ON public.catalogo_itens;
CREATE POLICY "Users can insert own catalogo_itens"
  ON public.catalogo_itens FOR INSERT
  WITH CHECK (auth.uid() = user_id AND public.is_active_user());

DROP POLICY IF EXISTS "Users can update own catalogo_itens" ON public.catalogo_itens;
CREATE POLICY "Users can update own catalogo_itens"
  ON public.catalogo_itens FOR UPDATE
  USING (auth.uid() = user_id AND public.is_active_user());

DROP POLICY IF EXISTS "Users can delete own catalogo_itens" ON public.catalogo_itens;
CREATE POLICY "Users can delete own catalogo_itens"
  ON public.catalogo_itens FOR DELETE
  USING (auth.uid() = user_id AND public.is_active_user());

-- servicos (mantém a integridade cruzada de cliente_id já aplicada em
-- 20260729140000, só soma is_active_user())
DROP POLICY IF EXISTS "Users can view own servicos" ON public.servicos;
CREATE POLICY "Users can view own servicos"
  ON public.servicos FOR SELECT
  USING (auth.uid() = user_id AND public.is_active_user());

DROP POLICY IF EXISTS "Users can insert own servicos" ON public.servicos;
CREATE POLICY "Users can insert own servicos"
  ON public.servicos FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND public.is_active_user()
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
  USING (auth.uid() = user_id AND public.is_active_user())
  WITH CHECK (
    auth.uid() = user_id
    AND public.is_active_user()
    AND (
      cliente_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.clientes
        WHERE clientes.id = servicos.cliente_id
          AND clientes.user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can delete own servicos" ON public.servicos;
CREATE POLICY "Users can delete own servicos"
  ON public.servicos FOR DELETE
  USING (auth.uid() = user_id AND public.is_active_user());

-- orcamentos (mantém a integridade cruzada de cliente_id de 20260729140000)
DROP POLICY IF EXISTS "Users own orcamentos" ON public.orcamentos;
CREATE POLICY "Users own orcamentos"
  ON public.orcamentos FOR ALL
  USING (auth.uid() = user_id AND public.is_active_user())
  WITH CHECK (
    auth.uid() = user_id
    AND public.is_active_user()
    AND (
      cliente_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.clientes
        WHERE clientes.id = orcamentos.cliente_id
          AND clientes.user_id = auth.uid()
      )
    )
  );

-- orcamento_itens (via orcamento do dono)
DROP POLICY IF EXISTS "Users own orcamento_itens via orcamento" ON public.orcamento_itens;
CREATE POLICY "Users own orcamento_itens via orcamento"
  ON public.orcamento_itens FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.orcamentos
      WHERE id = orcamento_id AND user_id = auth.uid()
    )
    AND public.is_active_user()
  );

-- financeiro_movimentacoes (mantém a integridade cruzada de 20260729140000)
DROP POLICY IF EXISTS "users_own_movimentacoes" ON public.financeiro_movimentacoes;
CREATE POLICY "users_own_movimentacoes"
  ON public.financeiro_movimentacoes FOR ALL
  USING (auth.uid() = user_id AND public.is_active_user())
  WITH CHECK (
    auth.uid() = user_id
    AND public.is_active_user()
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
