-- ============================================================
-- MIGRATION: missao04b_admin_vendedores_overview
-- Origem: Missão 04B — Dashboard Administrativo e Gestão de Vendedores
-- Escopo: RPC de leitura agregada para a lista de vendedores do painel
-- admin, evitando dezenas de queries separadas no frontend (uma por
-- vendedor) e evitando expor auth.users diretamente (só é legível via
-- SECURITY DEFINER).
--
-- Não retorna nenhum dado de financeiro_movimentacoes. Não altera
-- nenhuma tabela existente.
-- ATENÇÃO: aplicar manualmente no Supabase SQL Editor / CLI.
-- ============================================================

CREATE OR REPLACE FUNCTION public.admin_vendedores_overview()
RETURNS TABLE (
  user_id                uuid,
  full_name               text,
  email                   text,
  telefone                text,
  cidade                  text,
  estado                  text,
  foto_url                text,
  status                  text,
  role                    public.app_role,
  created_at              timestamptz,
  clientes_count          bigint,
  propostas_count         bigint,
  propostas_aprovadas     bigint,
  propostas_recusadas     bigint,
  propostas_finalizadas   bigint,
  valor_orcado            numeric,
  valor_vendido           numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    p.user_id,
    p.full_name,
    u.email,
    p.telefone,
    p.cidade,
    p.estado,
    p.foto_url,
    p.status,
    ur.role,
    p.created_at,
    COALESCE(c.clientes_count, 0)        AS clientes_count,
    COALESCE(o.propostas_count, 0)       AS propostas_count,
    COALESCE(o.propostas_aprovadas, 0)   AS propostas_aprovadas,
    COALESCE(o.propostas_recusadas, 0)   AS propostas_recusadas,
    COALESCE(o.propostas_finalizadas, 0) AS propostas_finalizadas,
    COALESCE(o.valor_orcado, 0)          AS valor_orcado,
    COALESCE(o.valor_vendido, 0)         AS valor_vendido
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.user_id
  LEFT JOIN public.user_roles ur ON ur.user_id = p.user_id
  LEFT JOIN (
    SELECT user_id, COUNT(*) AS clientes_count
    FROM public.clientes
    GROUP BY user_id
  ) c ON c.user_id = p.user_id
  LEFT JOIN (
    SELECT
      user_id,
      COUNT(*)                                                       AS propostas_count,
      COUNT(*) FILTER (WHERE status = 'aprovado')                    AS propostas_aprovadas,
      COUNT(*) FILTER (WHERE status = 'recusado')                    AS propostas_recusadas,
      COUNT(*) FILTER (WHERE status = 'finalizado')                  AS propostas_finalizadas,
      COALESCE(SUM(total), 0)                                        AS valor_orcado,
      COALESCE(SUM(total) FILTER (WHERE status IN ('aprovado', 'finalizado')), 0) AS valor_vendido
    FROM public.orcamentos
    GROUP BY user_id
  ) o ON o.user_id = p.user_id
  WHERE public.is_super_admin();
$$;

REVOKE EXECUTE ON FUNCTION public.admin_vendedores_overview() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_vendedores_overview() TO authenticated;
