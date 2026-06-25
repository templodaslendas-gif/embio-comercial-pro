-- Catálogo de itens comerciais (produtos e serviços) por usuário

CREATE TABLE public.catalogo_itens (
  id            uuid          NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  categoria     text,
  nome_item     text          NOT NULL,
  descricao     text,
  unidade       text,
  valor_unitario numeric(12,2) NOT NULL DEFAULT 0,
  ativo         boolean       NOT NULL DEFAULT true,
  ordem         integer       NOT NULL DEFAULT 0,
  created_at    timestamptz   NOT NULL DEFAULT now(),
  updated_at    timestamptz   NOT NULL DEFAULT now()
);

ALTER TABLE public.catalogo_itens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own catalogo_itens"
  ON public.catalogo_itens FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own catalogo_itens"
  ON public.catalogo_itens FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own catalogo_itens"
  ON public.catalogo_itens FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own catalogo_itens"
  ON public.catalogo_itens FOR DELETE USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX idx_catalogo_itens_user_id   ON public.catalogo_itens (user_id);
CREATE INDEX idx_catalogo_itens_categoria ON public.catalogo_itens (user_id, categoria);
CREATE INDEX idx_catalogo_itens_ativo     ON public.catalogo_itens (user_id, ativo);
CREATE INDEX idx_catalogo_itens_ordem     ON public.catalogo_itens (user_id, ordem);

-- updated_at automático (reusa função criada na migração inicial)
CREATE TRIGGER update_catalogo_itens_updated_at
  BEFORE UPDATE ON public.catalogo_itens
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
