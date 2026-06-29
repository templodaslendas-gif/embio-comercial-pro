-- ============================================================
-- MIGRATION: financeiro_movimentacoes
-- ATENÇÃO: Esta migration deve ser aplicada MANUALMENTE no
-- Supabase SQL Editor (https://supabase.com/dashboard).
-- O CLI local não está configurado neste projeto.
-- ============================================================

-- Tabela de movimentações financeiras
CREATE TABLE IF NOT EXISTS public.financeiro_movimentacoes (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tipo          text NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  descricao     text NOT NULL,
  categoria     text,
  valor         numeric(14,2) NOT NULL DEFAULT 0,
  data_vencimento date,
  data_pagamento  date,
  status        text NOT NULL DEFAULT 'pendente'
                CHECK (status IN ('pendente', 'pago', 'vencido', 'cancelado')),
  forma_pagamento text,
  observacoes   text,
  orcamento_id  uuid REFERENCES public.orcamentos(id) ON DELETE SET NULL,
  cliente_id    uuid REFERENCES public.clientes(id) ON DELETE SET NULL,
  created_at    timestamptz DEFAULT now() NOT NULL,
  updated_at    timestamptz DEFAULT now() NOT NULL
);

-- RLS
ALTER TABLE public.financeiro_movimentacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_movimentacoes"
  ON public.financeiro_movimentacoes
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.update_financeiro_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_financeiro_movimentacoes_updated_at
  BEFORE UPDATE ON public.financeiro_movimentacoes
  FOR EACH ROW EXECUTE FUNCTION public.update_financeiro_updated_at();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_financeiro_user_id ON public.financeiro_movimentacoes (user_id);
CREATE INDEX IF NOT EXISTS idx_financeiro_data_venc ON public.financeiro_movimentacoes (data_vencimento);
CREATE INDEX IF NOT EXISTS idx_financeiro_status ON public.financeiro_movimentacoes (status);
