-- ============================================================
-- MIGRATION: missao04a_admin_read_policies
-- Origem: Missão 04A — Fundação Segura do Super Admin
-- Escopo: concede ao super_admin leitura administrativa dos dados
-- comerciais necessários (profiles, clientes, catálogo, agenda,
-- propostas). NÃO concede nenhum acesso a financeiro_movimentacoes
-- (financeiro privado do vendedor) nem às tabelas legadas
-- quotes/clients (fora de escopo desta missão).
-- Todas as policies abaixo são ADITIVAS: coexistem com as policies
-- de dono já existentes (múltiplas policies permissive = OR),
-- sem substituí-las.
-- ATENÇÃO: aplicar manualmente no Supabase SQL Editor / CLI.
-- ============================================================

DROP POLICY IF EXISTS "Admin read all profiles" ON public.profiles;
CREATE POLICY "Admin read all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.is_super_admin());

DROP POLICY IF EXISTS "Admin read all clientes" ON public.clientes;
CREATE POLICY "Admin read all clientes"
  ON public.clientes FOR SELECT
  TO authenticated
  USING (public.is_super_admin());

DROP POLICY IF EXISTS "Admin read all catalogo_itens" ON public.catalogo_itens;
CREATE POLICY "Admin read all catalogo_itens"
  ON public.catalogo_itens FOR SELECT
  TO authenticated
  USING (public.is_super_admin());

DROP POLICY IF EXISTS "Admin read all servicos" ON public.servicos;
CREATE POLICY "Admin read all servicos"
  ON public.servicos FOR SELECT
  TO authenticated
  USING (public.is_super_admin());

DROP POLICY IF EXISTS "Admin read all orcamentos" ON public.orcamentos;
CREATE POLICY "Admin read all orcamentos"
  ON public.orcamentos FOR SELECT
  TO authenticated
  USING (public.is_super_admin());

DROP POLICY IF EXISTS "Admin read all orcamento_itens" ON public.orcamento_itens;
CREATE POLICY "Admin read all orcamento_itens"
  ON public.orcamento_itens FOR SELECT
  TO authenticated
  USING (public.is_super_admin());

-- Explicitamente NÃO criado nesta migration: nenhuma policy de leitura
-- administrativa em financeiro_movimentacoes. O Super Admin não deve
-- enxergar entradas, saídas, saldo ou observações financeiras privadas
-- do vendedor (regra explícita da Missão 04A). Também não tocamos em
-- quotes/clients (sistema legado, fora de escopo desta missão).
