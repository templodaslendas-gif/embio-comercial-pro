-- Tabela de clientes comerciais por usuário

CREATE TABLE public.clientes (
  id          uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome        text        NOT NULL,
  telefone    text,
  endereco    text,
  cidade      text,
  observacoes text,
  status      text        NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own clientes"
  ON public.clientes FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clientes"
  ON public.clientes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clientes"
  ON public.clientes FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own clientes"
  ON public.clientes FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_clientes_user_id ON public.clientes (user_id);
CREATE INDEX idx_clientes_status  ON public.clientes (user_id, status);
CREATE INDEX idx_clientes_nome    ON public.clientes (user_id, nome);

CREATE TRIGGER update_clientes_updated_at
  BEFORE UPDATE ON public.clientes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
