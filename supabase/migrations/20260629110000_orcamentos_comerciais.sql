-- Sequência para número de orçamento
CREATE SEQUENCE IF NOT EXISTS public.orcamentos_seq START 1000;

-- Tabela de cabeçalho dos orçamentos comerciais
CREATE TABLE IF NOT EXISTS public.orcamentos (
  id               uuid          NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          uuid          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  numero_orcamento text,
  cliente_id       uuid          REFERENCES public.clientes(id) ON DELETE SET NULL,
  cliente_nome     text,
  status           text          NOT NULL DEFAULT 'em_aberto',
  validade_dias    integer       NOT NULL DEFAULT 30,
  forma_pagamento  text,
  observacoes      text,
  total            numeric(14,2) NOT NULL DEFAULT 0,
  created_at       timestamptz   NOT NULL DEFAULT now(),
  updated_at       timestamptz   NOT NULL DEFAULT now(),
  CONSTRAINT orcamentos_status_check
    CHECK (status IN ('em_aberto','aprovado','recusado','finalizado'))
);

-- Tabela de itens do orçamento
CREATE TABLE IF NOT EXISTS public.orcamento_itens (
  id               uuid          NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  orcamento_id     uuid          NOT NULL REFERENCES public.orcamentos(id) ON DELETE CASCADE,
  catalogo_item_id uuid          REFERENCES public.catalogo_itens(id) ON DELETE SET NULL,
  nome_item        text          NOT NULL,
  descricao        text,
  unidade          text,
  quantidade       numeric(10,3) NOT NULL DEFAULT 1,
  valor_unitario   numeric(12,2) NOT NULL DEFAULT 0,
  subtotal         numeric(14,2) GENERATED ALWAYS AS (quantidade * valor_unitario) STORED,
  ordem            integer       NOT NULL DEFAULT 0,
  created_at       timestamptz   NOT NULL DEFAULT now()
);

-- Auto-numerar orçamentos
CREATE OR REPLACE FUNCTION public.set_numero_orcamento()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.numero_orcamento IS NULL THEN
    NEW.numero_orcamento := 'ORC-' || LPAD(nextval('public.orcamentos_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_numero_orcamento ON public.orcamentos;
CREATE TRIGGER trg_set_numero_orcamento
  BEFORE INSERT ON public.orcamentos
  FOR EACH ROW EXECUTE FUNCTION public.set_numero_orcamento();

-- Atualizar total automaticamente quando itens mudam
CREATE OR REPLACE FUNCTION public.update_orcamento_total()
RETURNS trigger LANGUAGE plpgsql AS $$
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

DROP TRIGGER IF EXISTS trg_update_orcamento_total ON public.orcamento_itens;
CREATE TRIGGER trg_update_orcamento_total
  AFTER INSERT OR UPDATE OR DELETE ON public.orcamento_itens
  FOR EACH ROW EXECUTE FUNCTION public.update_orcamento_total();

-- updated_at automático em orcamentos (reutiliza função existente)
DROP TRIGGER IF EXISTS update_orcamentos_updated_at ON public.orcamentos;
CREATE TRIGGER update_orcamentos_updated_at
  BEFORE UPDATE ON public.orcamentos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.orcamentos      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orcamento_itens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users own orcamentos" ON public.orcamentos;
CREATE POLICY "Users own orcamentos"
  ON public.orcamentos FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users own orcamento_itens via orcamento" ON public.orcamento_itens;
CREATE POLICY "Users own orcamento_itens via orcamento"
  ON public.orcamento_itens FOR ALL
  USING (EXISTS (SELECT 1 FROM public.orcamentos WHERE id = orcamento_id AND user_id = auth.uid()));

-- Índices
CREATE INDEX IF NOT EXISTS idx_orcamentos_user_id  ON public.orcamentos (user_id);
CREATE INDEX IF NOT EXISTS idx_orcamentos_status   ON public.orcamentos (user_id, status);
CREATE INDEX IF NOT EXISTS idx_orcamento_itens_orc ON public.orcamento_itens (orcamento_id);
