import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useBranding, hexToHsl, hslToHex } from "@/hooks/useBranding";
import { useToast } from "@/hooks/use-toast";
import { formatCnpj, formatPhone } from "@/lib/format";
import { Loader2, Upload, RotateCcw, Save, Palette, Building2, MessageCircle } from "lucide-react";

const DEFAULT_PRIMARY = "210 70% 25%";
const DEFAULT_ACCENT = "120 55% 38%";
const DEFAULT_BG = "210 15% 97%";

export default function ConfiguracoesMarca() {
  const { t } = useTranslation();
  const { branding, save, reset, uploadLogo } = useBranding();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [appName, setAppName] = useState(branding.app_name);
  const [slogan, setSlogan] = useState(branding.slogan || "");
  const [companyName, setCompanyName] = useState(branding.company_name || "");
  const [cnpj, setCnpj] = useState(branding.cnpj || "");
  const [address, setAddress] = useState(branding.address || "");
  const [phone, setPhone] = useState(branding.phone || "");
  const [phoneIsWhats, setPhoneIsWhats] = useState<boolean>(!!branding.phone_is_whatsapp);
  const [logoUrl, setLogoUrl] = useState<string | null>(branding.logo_url);
  const [primary, setPrimary] = useState(branding.primary_color || DEFAULT_PRIMARY);
  const [accent, setAccent] = useState(branding.accent_color || DEFAULT_ACCENT);
  const [bg, setBg] = useState(branding.background_color || DEFAULT_BG);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { url, error } = await uploadLogo(file);
    setUploading(false);
    if (error || !url) {
      toast({ title: t("branding.uploadError"), description: error?.message, variant: "destructive" });
      return;
    }
    setLogoUrl(url);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await save({
      app_name: appName.trim() || "SUA LOGO AQUI",
      slogan: slogan.trim() || null,
      company_name: companyName.trim() || null,
      cnpj: cnpj.trim() || null,
      address: address.trim() || null,
      phone: phone.trim() || null,
      phone_is_whatsapp: phoneIsWhats,
      logo_url: logoUrl,
      primary_color: primary,
      accent_color: accent,
      background_color: bg,
    });
    setSaving(false);
    if (error) {
      toast({ title: t("common.error"), description: error.message, variant: "destructive" });
    } else {
      toast({ title: t("branding.savedSuccess") });
    }
  };

  const handleReset = async () => {
    const { error } = await reset();
    if (error) {
      toast({ title: t("common.error"), description: error.message, variant: "destructive" });
      return;
    }
    setAppName("SUA LOGO AQUI");
    setSlogan("");
    setCompanyName("");
    setCnpj("");
    setAddress("");
    setPhone("");
    setPhoneIsWhats(false);
    setLogoUrl(null);
    setPrimary(DEFAULT_PRIMARY);
    setAccent(DEFAULT_ACCENT);
    setBg(DEFAULT_BG);
    toast({ title: t("branding.savedSuccess") });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <Palette className="h-6 w-6 text-primary" />
          {t("branding.title")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{t("branding.subtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("branding.appName")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="app-name">{t("branding.appName")}</Label>
            <Input id="app-name" value={appName} onChange={(e) => setAppName(e.target.value)} placeholder="SUA LOGO AQUI" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="slogan">{t("branding.slogan")}</Label>
            <Input id="slogan" value={slogan} onChange={(e) => setSlogan(e.target.value)} placeholder={t("branding.sloganPlaceholder")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            {t("branding.companyData")}
          </CardTitle>
          <CardDescription>{t("branding.companyDataDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="company-name">{t("branding.companyName")}</Label>
            <Input id="company-name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder={t("branding.companyPlaceholder")} />
            <p className="text-[11px] text-muted-foreground">{t("branding.companyHelp")}</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cnpj">{t("branding.cnpj")}</Label>
            <Input id="cnpj" value={cnpj} onChange={(e) => setCnpj(formatCnpj(e.target.value))} placeholder={t("branding.cnpjPlaceholder")} inputMode="numeric" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="address">{t("branding.address")}</Label>
            <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder={t("branding.addressPlaceholder")} className="min-h-[80px]" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">{t("branding.phone")}</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} placeholder={t("branding.phonePlaceholder")} inputMode="tel" />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
            <div className="flex items-center gap-2">
              <MessageCircle className={`h-4 w-4 ${phoneIsWhats ? "text-primary" : "text-muted-foreground"}`} />
              <Label htmlFor="is-whats" className="cursor-pointer">{t("branding.phoneIsWhatsapp")}</Label>
            </div>
            <Switch id="is-whats" checked={phoneIsWhats} onCheckedChange={setPhoneIsWhats} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("branding.logo")}</CardTitle>
          <CardDescription>PNG / JPG</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-xl bg-muted flex items-center justify-center overflow-hidden border">
              {logoUrl ? (
                <img src={logoUrl} alt="logo" className="h-full w-full object-contain" />
              ) : (
                <span className="text-[10px] text-muted-foreground text-center px-1">SUA LOGO AQUI</span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <input ref={fileRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleFile} />
              <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
                {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                {t("branding.uploadLogo")}
              </Button>
              {logoUrl && (
                <Button type="button" variant="ghost" size="sm" onClick={() => setLogoUrl(null)}>
                  {t("branding.removeLogo")}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("branding.colors")}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ColorField label={t("branding.primaryColor")} hsl={primary} onChange={setPrimary} />
          <ColorField label={t("branding.accentColor")} hsl={accent} onChange={setAccent} />
          <ColorField label={t("branding.backgroundColor")} hsl={bg} onChange={setBg} />
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {t("branding.save")}
        </Button>
        <Button variant="outline" onClick={handleReset} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          {t("branding.reset")}
        </Button>
      </div>
    </div>
  );
}

function ColorField({ label, hsl, onChange }: { label: string; hsl: string; onChange: (hsl: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={hslToHex(hsl)}
          onChange={(e) => onChange(hexToHsl(e.target.value))}
          className="h-10 w-14 rounded border cursor-pointer"
        />
        <Input value={hsl} onChange={(e) => onChange(e.target.value)} className="font-mono text-xs" />
      </div>
    </div>
  );
}
