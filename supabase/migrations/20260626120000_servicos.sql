-- Compromissos e visitas comerciais por usuário

CREATE TABLE public.servicos (
  id          uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cliente_id  uuid        REFERENCES public.clientes(id) ON DELETE SET NULL,
  titulo      text        NOT NULL,
  tipo        text        NOT NULL DEFAULT 'visita comercial'
                          CHECK (tipo IN ('visita comercial','retorno','entrega','demonstração','outro')),
  data        date        NOT NULL,
  hora        time,
  cidade      text,
  observacoes text,
  status      text        NOT NULL DEFAULT 'agendado'
                          CHECK (status IN ('agendado','concluido','cancelado')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own servicos"
  ON public.servicos FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own servicos"
  ON public.servicos FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own servicos"
  ON public.servicos FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own servicos"
  ON public.servicos FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_servicos_user_id    ON public.servicos (user_id);
CREATE INDEX idx_servicos_cliente_id ON public.servicos (user_id, cliente_id);
CREATE INDEX idx_servicos_data       ON public.servicos (user_id, data);
CREATE INDEX idx_servicos_status     ON public.servicos (user_id, status);

CREATE TRIGGER update_servicos_updated_at
  BEFORE UPDATE ON public.servicos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
