-- Auto-create an initial branding_settings row for every new user,
-- mirroring the existing on_auth_user_created (profiles) and
-- trg_seed_catalogo_on_signup (catalogo_itens) triggers, so a new
-- account has profile + branding_settings + catalogo base ready
-- without any manual step.

CREATE OR REPLACE FUNCTION public.seed_branding_on_signup()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.branding_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_seed_branding_on_signup ON auth.users;
CREATE TRIGGER trg_seed_branding_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.seed_branding_on_signup();

-- Backfill existing users who don't have a branding_settings row yet
INSERT INTO public.branding_settings (user_id)
SELECT u.id FROM auth.users u
LEFT JOIN public.branding_settings b ON b.user_id = u.id
WHERE b.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;
