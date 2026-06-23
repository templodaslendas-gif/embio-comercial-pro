
-- Create a sequence for order numbers starting at 1831456
CREATE SEQUENCE IF NOT EXISTS public.quote_order_number_seq START WITH 1831456;

-- Add numero_pedido column
ALTER TABLE public.quotes ADD COLUMN numero_pedido text;

-- Create a trigger to auto-generate the order number
CREATE OR REPLACE FUNCTION public.generate_quote_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.numero_pedido := '#' || nextval('public.quote_order_number_seq')::text;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_quote_order_number
  BEFORE INSERT ON public.quotes
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_quote_order_number();
