
CREATE OR REPLACE FUNCTION public.generate_quote_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.numero_pedido := '#' || nextval('public.quote_order_number_seq')::text;
  RETURN NEW;
END;
$$;
