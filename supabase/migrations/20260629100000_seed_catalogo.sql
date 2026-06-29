-- Função que popula o catálogo base para um usuário
CREATE OR REPLACE FUNCTION public.seed_catalogo_base(p_user_id uuid)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO public.catalogo_itens
    (user_id, categoria, nome_item, descricao, unidade, valor_unitario, ativo, ordem)
  VALUES
    -- Produtos Embio
    (p_user_id, 'Produtos Embio', 'Embio 3000',  'Aditivo biológico para suinocultura',                   'frasco', 0, true, 10),
    (p_user_id, 'Produtos Embio', 'Embio 3100',  'Aditivo biológico de alta eficiência para suinocultura','frasco', 0, true, 11),
    (p_user_id, 'Produtos Embio', 'Embio 5000+', 'Aditivo biológico para bovinocultura',                  'galão',  0, true, 12),
    (p_user_id, 'Produtos Embio', 'Embio 6000',  'Aditivo biológico premium para bovinocultura',          'galão',  0, true, 13),
    (p_user_id, 'Produtos Embio', 'Embio 8000',  'Aditivo biológico de alto rendimento',                  'galão',  0, true, 14),
    -- Propulsores
    (p_user_id, 'Propulsores', 'Propulsor 3CV',   'Propulsor elétrico submersível 3CV',   'unid.', 0, true, 20),
    (p_user_id, 'Propulsores', 'Propulsor 4CV',   'Propulsor elétrico submersível 4CV',   'unid.', 0, true, 21),
    (p_user_id, 'Propulsores', 'Propulsor 5CV',   'Propulsor elétrico submersível 5CV',   'unid.', 0, true, 22),
    (p_user_id, 'Propulsores', 'Propulsor 7.5CV', 'Propulsor elétrico submersível 7.5CV', 'unid.', 0, true, 23),
    (p_user_id, 'Propulsores', 'Propulsor 10CV',  'Propulsor elétrico submersível 10CV',  'unid.', 0, true, 24),
    -- Serviços
    (p_user_id, 'Serviços', 'Instalação de Propulsor', 'Serviço de instalação e comissionamento', 'serv.',  0, true, 30),
    (p_user_id, 'Serviços', 'Visita Técnica',          'Visita técnica presencial ao cliente',    'visita', 0, true, 31),
    (p_user_id, 'Serviços', 'Manutenção Preventiva',   'Serviço de manutenção preventiva',        'serv.',  0, true, 32),
    (p_user_id, 'Serviços', 'Assessoria Técnica',      'Consultoria e orientação técnica',        'hora',   0, true, 33);
END;
$$;

-- Trigger para novos usuários (auto-seed ao criar conta)
CREATE OR REPLACE FUNCTION public.seed_catalogo_on_signup()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  PERFORM public.seed_catalogo_base(NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_seed_catalogo_on_signup ON auth.users;
CREATE TRIGGER trg_seed_catalogo_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.seed_catalogo_on_signup();

-- Seed para todos os usuários existentes sem itens no catálogo
DO $$
DECLARE
  u RECORD;
BEGIN
  FOR u IN SELECT id FROM auth.users LOOP
    IF (SELECT COUNT(*) FROM public.catalogo_itens WHERE user_id = u.id) = 0 THEN
      PERFORM public.seed_catalogo_base(u.id);
    END IF;
  END LOOP;
END;
$$;
