
CREATE TABLE public.branding_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  app_name TEXT NOT NULL DEFAULT 'SUA LOGO AQUI',
  logo_url TEXT,
  primary_color TEXT,
  accent_color TEXT,
  background_color TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.branding_settings TO authenticated;
GRANT ALL ON public.branding_settings TO service_role;

ALTER TABLE public.branding_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own branding" ON public.branding_settings
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own branding" ON public.branding_settings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own branding" ON public.branding_settings
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own branding" ON public.branding_settings
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_branding_settings_updated_at
BEFORE UPDATE ON public.branding_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO storage.buckets (id, name, public)
VALUES ('branding-logos', 'branding-logos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Branding logos are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'branding-logos');

CREATE POLICY "Users upload own branding logo"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'branding-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users update own branding logo"
ON storage.objects FOR UPDATE
USING (bucket_id = 'branding-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own branding logo"
ON storage.objects FOR DELETE
USING (bucket_id = 'branding-logos' AND auth.uid()::text = (storage.foldername(name))[1]);
