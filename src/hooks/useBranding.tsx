import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface BrandingSettings {
  app_name: string;
  slogan: string | null;
  company_name: string | null;
  logo_url: string | null;
  primary_color: string | null;
  accent_color: string | null;
  background_color: string | null;
  cnpj: string | null;
  address: string | null;
  phone: string | null;
  phone_is_whatsapp: boolean;
  meta_mensal: number | null;
}

const DEFAULTS: BrandingSettings = {
  app_name: "SUA LOGO AQUI",
  slogan: null,
  company_name: null,
  logo_url: null,
  primary_color: null,
  accent_color: null,
  background_color: null,
  cnpj: null,
  address: null,
  phone: null,
  phone_is_whatsapp: false,
  meta_mensal: null,
};

interface BrandingContextValue {
  branding: BrandingSettings;
  loading: boolean;
  save: (patch: Partial<BrandingSettings>) => Promise<{ error: Error | null }>;
  reset: () => Promise<{ error: Error | null }>;
  uploadLogo: (file: File) => Promise<{ url: string | null; error: Error | null }>;
  refresh: () => Promise<void>;
}

const BrandingContext = createContext<BrandingContextValue | undefined>(undefined);

export function hexToHsl(hex: string): string {
  const m = hex.replace("#", "");
  const r = parseInt(m.substring(0, 2), 16) / 255;
  const g = parseInt(m.substring(2, 4), 16) / 255;
  const b = parseInt(m.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function hslToHex(hsl: string): string {
  const parts = hsl.match(/(-?\d+(?:\.\d+)?)/g);
  if (!parts || parts.length < 3) return "#000000";
  const h = parseFloat(parts[0]);
  const s = parseFloat(parts[1]) / 100;
  const l = parseFloat(parts[2]) / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const mm = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const toHex = (v: number) => Math.round((v + mm) * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// "h s% l%" -> [r,g,b] 0-255
export function hslToRgb(hsl: string): [number, number, number] {
  const hex = hslToHex(hsl);
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

export function generatedByText(b: BrandingSettings): string {
  const name = (b.company_name || b.app_name || "").trim();
  return name ? `Gerado por ${name}` : "Gerado";
}

function applyCssVars(b: BrandingSettings) {
  const root = document.documentElement;
  if (b.primary_color) {
    root.style.setProperty("--primary", b.primary_color);
    root.style.setProperty("--ring", b.primary_color);
    root.style.setProperty("--sidebar-primary", b.primary_color);
  } else {
    root.style.removeProperty("--primary");
    root.style.removeProperty("--ring");
    root.style.removeProperty("--sidebar-primary");
  }
  if (b.accent_color) root.style.setProperty("--accent", b.accent_color);
  else root.style.removeProperty("--accent");
  if (b.background_color) root.style.setProperty("--background", b.background_color);
  else root.style.removeProperty("--background");
}

export function BrandingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [branding, setBranding] = useState<BrandingSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setBranding(DEFAULTS);
      applyCssVars(DEFAULTS);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("branding_settings")
      .select("app_name, slogan, company_name, logo_url, primary_color, accent_color, background_color, cnpj, address, phone, phone_is_whatsapp, meta_mensal")
      .eq("user_id", user.id)
      .maybeSingle();
    const next = (data as BrandingSettings) ?? DEFAULTS;
    setBranding(next);
    applyCssVars(next);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const save = useCallback<BrandingContextValue["save"]>(async (patch) => {
    if (!user) return { error: new Error("not authenticated") };
    const next = { ...branding, ...patch };
    const { error } = await supabase
      .from("branding_settings")
      .upsert({ user_id: user.id, ...next }, { onConflict: "user_id" });
    if (!error) {
      setBranding(next);
      applyCssVars(next);
    }
    return { error: error as Error | null };
  }, [user, branding]);

  const reset = useCallback(async () => {
    if (!user) return { error: new Error("not authenticated") };
    const { error } = await supabase
      .from("branding_settings")
      .delete()
      .eq("user_id", user.id);
    if (!error) {
      setBranding(DEFAULTS);
      applyCssVars(DEFAULTS);
    }
    return { error: error as Error | null };
  }, [user]);

  const uploadLogo = useCallback<BrandingContextValue["uploadLogo"]>(async (file) => {
    if (!user) return { url: null, error: new Error("not authenticated") };
    const ext = file.name.split(".").pop() || "png";
    const path = `${user.id}/logo-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("branding-logos")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) return { url: null, error: upErr as Error };
    const { data } = supabase.storage.from("branding-logos").getPublicUrl(path);
    return { url: data.publicUrl, error: null };
  }, [user]);

  return (
    <BrandingContext.Provider value={{ branding, loading, save, reset, uploadLogo, refresh: load }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const ctx = useContext(BrandingContext);
  if (!ctx) throw new Error("useBranding must be used inside BrandingProvider");
  return ctx;
}
