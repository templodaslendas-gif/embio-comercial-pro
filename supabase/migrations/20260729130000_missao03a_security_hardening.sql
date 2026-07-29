-- ============================================================
-- MIGRATION: missao03a_security_hardening
-- Origem: Missão 03A — Auditoria Rápida e Segura do Supabase
-- Escopo: correções pequenas, seguras e comprovadas apenas.
-- Nenhuma tabela, coluna ou dado é apagado/alterado nesta migration.
-- ATENÇÃO: aplicar manualmente no Supabase SQL Editor / CLI —
-- não foi aplicada remotamente por este agente (sem acesso ao
-- projeto remoto neste ambiente).
-- ============================================================

-- 1) SECURITY DEFINER sem search_path explícito (risco de search_path
--    hijacking). seed_catalogo_on_signup roda com privilégios elevados
--    (dispara em AFTER INSERT ON auth.users) e chamava
--    seed_catalogo_base sem search_path fixo em nenhuma das duas.
--    Mesma correção já aplicada em seed_branding_on_signup
--    (20260727000000); aqui apenas retroaplicamos o mesmo padrão.

CREATE OR REPLACE FUNCTION public.seed_catalogo_base(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.catalogo_itens
    (user_id, categoria, nome_item, descricao, unidade, valor_unitario, ativo, ordem)
  VALUES
    (p_user_id, 'Produtos Embio', 'Embio 3000',  'Aditivo biológico para suinocultura',                   'frasco', 0, true, 10),
    (p_user_id, 'Produtos Embio', 'Embio 3100',  'Aditivo biológico de alta eficiência para suinocultura','frasco', 0, true, 11),
    (p_user_id, 'Produtos Embio', 'Embio 5000+', 'Aditivo biológico para bovinocultura',                  'galão',  0, true, 12),
    (p_user_id, 'Produtos Embio', 'Embio 6000',  'Aditivo biológico premium para bovinocultura',          'galão',  0, true, 13),
    (p_user_id, 'Produtos Embio', 'Embio 8000',  'Aditivo biológico de alto rendimento',                  'galão',  0, true, 14),
    (p_user_id, 'Propulsores', 'Propulsor 3CV',   'Propulsor elétrico submersível 3CV',   'unid.', 0, true, 20),
    (p_user_id, 'Propulsores', 'Propulsor 4CV',   'Propulsor elétrico submersível 4CV',   'unid.', 0, true, 21),
    (p_user_id, 'Propulsores', 'Propulsor 5CV',   'Propulsor elétrico submersível 5CV',   'unid.', 0, true, 22),
    (p_user_id, 'Propulsores', 'Propulsor 7.5CV', 'Propulsor elétrico submersível 7.5CV', 'unid.', 0, true, 23),
    (p_user_id, 'Propulsores', 'Propulsor 10CV',  'Propulsor elétrico submersível 10CV',  'unid.', 0, true, 24),
    (p_user_id, 'Serviços', 'Instalação de Propulsor', 'Serviço de instalação e comissionamento', 'serv.',  0, true, 30),
    (p_user_id, 'Serviços', 'Visita Técnica',          'Visita técnica presencial ao cliente',    'visita', 0, true, 31),
    (p_user_id, 'Serviços', 'Manutenção Preventiva',   'Serviço de manutenção preventiva',        'serv.',  0, true, 32),
    (p_user_id, 'Serviços', 'Assessoria Técnica',      'Consultoria e orientação técnica',        'hora',   0, true, 33);
END;
$$;

CREATE OR REPLACE FUNCTION public.seed_catalogo_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.seed_catalogo_base(NEW.id);
  RETURN NEW;
END;
$$;

-- 2) Índice ausente comprovado: quotes.user_id é filtrado em toda
--    leitura da tabela (src/pages/Index.tsx, src/pages/MeusClientes.tsx)
--    e não possuía índice desde a migration inicial.
CREATE INDEX IF NOT EXISTS idx_quotes_user_id ON public.quotes (user_id);

-- 3) Índice ausente comprovado: financeiro_movimentacoes.orcamento_id
--    é filtrado em ensureEntradaFromOrcamento/cancelarEntradaByOrcamento
--    (src/lib/financeiroQueries.ts) e não possuía índice.
CREATE INDEX IF NOT EXISTS idx_financeiro_orcamento_id ON public.financeiro_movimentacoes (orcamento_id);

-- 4) branding_settings.user_id não possuía FK para auth.users(id),
--    ao contrário de todas as outras tabelas do sistema (inconsistência
--    com DATABASE-RULES.md). Sem FK, deleção de um usuário deixa a
--    linha de branding órfã em vez de ser removida em cascata.
--    Idempotente: só adiciona se ainda não existir.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'branding_settings_user_id_fkey'
  ) THEN
    ALTER TABLE public.branding_settings
      ADD CONSTRAINT branding_settings_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END;
$$;
