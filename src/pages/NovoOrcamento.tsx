import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useBranding, generatedByText } from "@/hooks/useBranding";
import { generateQuotePdf } from "@/lib/quotePdf";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  FileText, MessageCircle, Loader2, Save, Plus, Trash2, Zap, FlaskConical, Truck, CreditCard, ClipboardList, Calendar, Hash, FileDown,
} from "lucide-react";
import { CompanyFooter } from "@/components/CompanyFooter";

interface PropulsorEntry {
  modelo: string;
  voltagem: string;
  fase: string;
  caixaEletrica: string;
  aplicacao: string;
  quantidade: number | string;
}

interface AditivoEntry {
  produto: string;
  quantidade: number | string;
}

const EMBIO_PRODUCTS = [
  "Embio 3000", "Embio 3100", "Embio 5000+", "Embio 6000", "Embio 8000",
];

const emptyPropulsor = (): PropulsorEntry => ({
  modelo: "", voltagem: "", fase: "", caixaEletrica: "", aplicacao: "", quantidade: "",
});

const emptyAditivo = (): AditivoEntry => ({ produto: "", quantidade: "" });

const NovoOrcamento = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { branding } = useBranding();

  const dataAtual = useMemo(() => format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }), []);

  const [empresaName, setEmpresaName] = useState("");
  const [localidade, setLocalidade] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [propulsores, setPropulsores] = useState<PropulsorEntry[]>([emptyPropulsor()]);
  const [aditivos, setAditivos] = useState<AditivoEntry[]>([emptyAditivo()]);
  const [formaEnvio, setFormaEnvio] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("");
  const [temObservacoes, setTemObservacoes] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [saving, setSaving] = useState(false);

  const addPropulsor = () => setPropulsores([...propulsores, emptyPropulsor()]);
  const removePropulsor = (i: number) => setPropulsores(propulsores.filter((_, idx) => idx !== i));
  const updatePropulsor = (i: number, field: keyof PropulsorEntry, value: string | number) => {
    const updated = [...propulsores];
    updated[i] = { ...updated[i], [field]: value };
    setPropulsores(updated);
  };

  const addAditivo = () => setAditivos([...aditivos, emptyAditivo()]);
  const removeAditivo = (i: number) => setAditivos(aditivos.filter((_, idx) => idx !== i));
  const updateAditivo = (i: number, field: keyof AditivoEntry, value: string | number) => {
    const updated = [...aditivos];
    updated[i] = { ...updated[i], [field]: value };
    setAditivos(updated);
  };

  const unitLabel = (qty: number | string) => {
    const n = Number(qty);
    return n === 1 ? t("common.unit") : t("common.units");
  };

  const appLabel = (app: string) => app === "bovino" ? `🐄 ${t("quote.bovine")}` : `🐷 ${t("quote.swine")}`;

  const buildWhatsAppText = () => {
    let text = `${t("quote.whatsappHeader")}\n`;
    text += `📅 Data: ${dataAtual}\n\n`;
    text += `👤 ${t("quote.companyName")}: ${empresaName || "—"}\n`;
    text += `👤 ${t("quote.responsible")}: ${responsavel || "—"}\n`;
    text += `📍 ${t("quote.location")}: ${localidade || "—"}\n`;

    const validPropulsores = propulsores.filter((p) => p.modelo);
    if (validPropulsores.length > 0) {
      text += `\n⚙️ *${t("quote.propulsors")}:*\n`;
      validPropulsores.forEach((p) => {
        const qty = Number(p.quantidade) || 0;
        text += `  • ${qty} ${qty === 1 ? t("common.unit") : t("common.units")} ${p.modelo}`;
        if (p.voltagem) text += ` - ${p.voltagem}`;
        if (p.fase) text += ` ${p.fase}`;
        if (p.caixaEletrica) text += ` - ${p.caixaEletrica}`;
        if (p.aplicacao) text += ` - ${appLabel(p.aplicacao)}`;
        text += `\n`;
      });
    }

    const validAditivos = aditivos.filter((a) => a.produto);
    if (validAditivos.length > 0) {
      text += `\n🧪 *${t("quote.additives")}:*\n`;
      validAditivos.forEach((a) => {
        const qty = Number(a.quantidade) || 0;
        text += `  • ${qty} ${unitLabel(qty)} ${a.produto}\n`;
      });
    }

    if (formaEnvio) {
      const envioLabel = formaEnvio === "retirar" ? t("quote.pickUp") : formaEnvio === "correios" ? t("quote.postalService") : t("quote.carrier");
      text += `\n📦 ${t("quote.shipping")}: ${envioLabel}\n`;
    }
    if (formaPagamento) text += `💳 ${t("quote.payment")}: ${formaPagamento}\n`;
    if (temObservacoes === "sim" && observacoes) text += `\n📝 ${t("quote.observations")}: ${observacoes}\n`;

    text += `\n${t("quote.expectedResults")}\n`;
    text += `• ${t("quote.resultGas")}\n`;
    text += `• ${t("quote.resultLarvae")}\n`;
    text += `• ${t("quote.resultFluidity")}\n\n`;
    text += `_${generatedByText(branding)}_`;

    return text;
  };

  const validateForm = (): boolean => {
    if (!empresaName.trim()) {
      toast({ title: t("quote.companyRequired"), variant: "destructive" });
      return false;
    }
    if (!formaEnvio) {
      toast({ title: t("quote.shippingRequired"), variant: "destructive" });
      return false;
    }
    const propulsorNoQty = propulsores.find((p) => p.modelo && (!p.quantidade || Number(p.quantidade) <= 0));
    if (propulsorNoQty) {
      toast({ title: t("quote.quantityRequired"), variant: "destructive" });
      return false;
    }
    const incompletePropulsor = propulsores.find((p) => p.modelo && (!p.fase || !p.caixaEletrica));
    if (incompletePropulsor) {
      if (!incompletePropulsor.fase) {
        toast({ title: t("quote.phaseRequired"), variant: "destructive" });
      } else {
        toast({ title: t("quote.electricBoxRequired"), variant: "destructive" });
      }
      return false;
    }
    if (!formaPagamento.trim()) {
      toast({ title: t("quote.paymentRequired"), variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!user) return;
    if (!validateForm()) return;
    setSaving(true);
    try {
      const validAditivos = aditivos.filter((a) => a.produto);
      const validPropulsores = propulsores.filter((p) => p.modelo);
      const productNames = validAditivos.map((a) => a.produto).join(", ") || t("quote.noAdditive");
      const aplicacao = validPropulsores.length > 0 ? validPropulsores[0].aplicacao || "geral" : "geral";

      const { data, error } = await supabase.from("quotes").insert({
        user_id: user.id,
        producer_name: empresaName.trim(),
        property_name: null,
        location: localidade.trim() || null,
        production_type: aplicacao,
        product_name: productNames,
        input_value: 0,
        frascos: validAditivos.reduce((sum, a) => sum + (Number(a.quantidade) || 0), 0),
        frequencia: "",
        detalhes: buildWhatsAppText(),
        empresa_name: empresaName.trim(),
        responsavel: responsavel.trim() || null,
        aplicacao: aplicacao || null,
        propulsores_json: validPropulsores as unknown as Record<string, unknown>[],
        aditivos_json: validAditivos as unknown as Record<string, unknown>[],
        forma_envio: formaEnvio || null,
        forma_pagamento: formaPagamento.trim() || null,
        observacoes: temObservacoes === "sim" ? observacoes.trim() || null : null,
      } as any).select('numero_pedido').single();
      if (error) throw error;
      toast({ title: `${t("quote.title")} ${data?.numero_pedido || ''} ${t("quote.savedSuccess")}` });
    } catch (e: any) {
      console.error(e);
      toast({ title: t("quote.saveError"), description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleWhatsApp = () => {
    if (!validateForm()) return;
    window.open(`https://wa.me/?text=${encodeURIComponent(buildWhatsAppText())}`, "_blank", "noopener,noreferrer");
  };

  const handlePdf = async () => {
    if (!validateForm()) return;
    try {
      const validAditivos = aditivos.filter((a) => a.produto);
      const validPropulsores = propulsores.filter((p) => p.modelo);
      const doc = await generateQuotePdf({
        empresa_name: empresaName.trim(),
        producer_name: empresaName.trim(),
        responsavel: responsavel.trim() || null,
        location: localidade.trim() || null,
        aplicacao: validPropulsores[0]?.aplicacao || null,
        propulsores_json: validPropulsores,
        aditivos_json: validAditivos,
        forma_envio: formaEnvio || null,
        forma_pagamento: formaPagamento.trim() || null,
        observacoes: temObservacoes === "sim" ? observacoes.trim() || null : null,
        created_at: new Date().toISOString(),
      }, branding);
      const safe = (empresaName.trim() || "orcamento").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
      doc.save(`orcamento-${safe}.pdf`);
    } catch (e: any) {
      toast({ title: t("quote.pdfError"), description: e?.message, variant: "destructive" });
    }
  };


  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">{t("quote.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("quote.subtitle")}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{dataAtual}</span>
          <span className="flex items-center gap-1.5 text-xs bg-muted/50 px-2 py-1 rounded-md"><Hash className="h-3.5 w-3.5" />{t("quote.orderNumber")}</span>
        </div>
      </div>

      {/* Client Data */}
      <Card className="border border-border/50 shadow-card animate-fade-in">
        <CardHeader>
          <CardTitle className="text-lg">{t("quote.clientData")}</CardTitle>
          <CardDescription className="text-xs">{t("quote.clientDataDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("quote.companyName")} *</Label>
            <Input placeholder={t("quote.companyPlaceholder")} value={empresaName} onChange={(e) => setEmpresaName(e.target.value)} className="h-11" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("quote.location")}</Label>
              <Input placeholder={t("quote.locationPlaceholder")} value={localidade} onChange={(e) => setLocalidade(e.target.value)} className="h-11" />
            </div>
            <div className="space-y-2">
              <Label>{t("quote.responsible")}</Label>
              <Input placeholder={t("quote.responsiblePlaceholder")} value={responsavel} onChange={(e) => setResponsavel(e.target.value)} className="h-11" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Propulsors */}
      <Card className="border border-border/50 shadow-card animate-fade-in">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{t("quote.propulsors")}</CardTitle>
          </div>
          <CardDescription className="text-xs">{t("quote.propulsorsDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {propulsores.map((p, i) => (
            <div key={i} className="rounded-xl bg-muted/40 p-4 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{t("quote.propulsor")} {i + 1}</span>
                {propulsores.length > 1 && (
                  <Button variant="ghost" size="sm" onClick={() => removePropulsor(i)} className="h-7 w-7 p-0 text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">{t("quote.application")}</Label>
                  <Select value={p.aplicacao} onValueChange={(v) => updatePropulsor(i, "aplicacao", v)}>
                    <SelectTrigger className="h-10"><SelectValue placeholder={t("common.select")} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bovino">🐄 {t("quote.bovine")}</SelectItem>
                      <SelectItem value="suino">🐷 {t("quote.swine")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{t("quote.model")}</Label>
                  <Input placeholder={t("quote.modelPlaceholder")} value={p.modelo} onChange={(e) => updatePropulsor(i, "modelo", e.target.value)} className="h-10" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{t("quote.propulsorQuantity")}</Label>
                  <Input
                    type="number" min="1" placeholder="0"
                    value={p.quantidade}
                    onChange={(e) => {
                      const val = e.target.value;
                      updatePropulsor(i, "quantidade", val === "" ? "" : Math.max(1, parseInt(val) || 0));
                    }}
                    className="h-10"
                  />
                  {p.quantidade !== "" && Number(p.quantidade) > 1 && (
                    <p className="text-[11px] text-muted-foreground">{Number(p.quantidade)} {t("common.units")}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{t("quote.voltage")}</Label>
                  <Select value={p.voltagem} onValueChange={(v) => updatePropulsor(i, "voltagem", v)}>
                    <SelectTrigger className="h-10"><SelectValue placeholder={t("common.select")} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="220V">220V</SelectItem>
                      <SelectItem value="380V">380V</SelectItem>
                      <SelectItem value="440V">440V</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{t("quote.phase")}</Label>
                  <Select value={p.fase} onValueChange={(v) => updatePropulsor(i, "fase", v)}>
                    <SelectTrigger className="h-10"><SelectValue placeholder={t("common.select")} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Monofásico">{t("quote.singlePhase")}</SelectItem>
                      <SelectItem value="Trifásico">{t("quote.threePhase")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs">{t("quote.electricBox")}</Label>
                  <Select value={p.caixaEletrica} onValueChange={(v) => updatePropulsor(i, "caixaEletrica", v)}>
                    <SelectTrigger className="h-10"><SelectValue placeholder={t("common.select")} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Com caixa elétrica">{t("quote.withBox")}</SelectItem>
                      <SelectItem value="Sem caixa elétrica">{t("quote.withoutBox")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addPropulsor} className="gap-1.5">
            <Plus className="h-4 w-4" /> {t("quote.addPropulsor")}
          </Button>
        </CardContent>
      </Card>

      {/* Additives */}
      <Card className="border border-border/50 shadow-card animate-fade-in">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{t("quote.additives")}</CardTitle>
          </div>
          <CardDescription className="text-xs">{t("quote.additivesDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {aditivos.map((a, i) => (
            <div key={i} className="rounded-xl bg-muted/40 p-4 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{t("quote.additive")} {i + 1}</span>
                {aditivos.length > 1 && (
                  <Button variant="ghost" size="sm" onClick={() => removeAditivo(i)} className="h-7 w-7 p-0 text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">{t("quote.product")}</Label>
                  <Select value={a.produto} onValueChange={(v) => updateAditivo(i, "produto", v)}>
                    <SelectTrigger className="h-10"><SelectValue placeholder={t("quote.productPlaceholder")} /></SelectTrigger>
                    <SelectContent>
                      {EMBIO_PRODUCTS.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{t("quote.quantity")}</Label>
                  <Input
                    type="number" min="0" placeholder={t("quote.quantityPlaceholder")}
                    value={a.quantidade}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateAditivo(i, "quantidade", val === "" ? "" : Math.max(0, parseInt(val) || 0));
                    }}
                    className="h-10"
                  />
                  {a.quantidade !== "" && Number(a.quantidade) > 0 && (
                    <p className="text-[11px] text-muted-foreground">{Number(a.quantidade)} {unitLabel(a.quantidade)}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addAditivo} className="gap-1.5">
            <Plus className="h-4 w-4" /> {t("quote.addAdditive")}
          </Button>
        </CardContent>
      </Card>

      {/* Shipping */}
      <Card className="border border-border/50 shadow-card animate-fade-in">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{t("quote.shipping")}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <RadioGroup value={formaEnvio} onValueChange={setFormaEnvio} className="space-y-2">
            <div className="flex items-center space-x-3 rounded-lg border border-border/50 p-3 hover:bg-muted/30 transition-colors">
              <RadioGroupItem value="retirar" id="retirar" />
              <Label htmlFor="retirar" className="cursor-pointer flex-1">{t("quote.pickUp")}</Label>
            </div>
            <div className="flex items-center space-x-3 rounded-lg border border-border/50 p-3 hover:bg-muted/30 transition-colors">
              <RadioGroupItem value="transportadora" id="transportadora" />
              <Label htmlFor="transportadora" className="cursor-pointer flex-1">{t("quote.carrier")}</Label>
            </div>
            <div className="flex items-center space-x-3 rounded-lg border border-border/50 p-3 hover:bg-muted/30 transition-colors">
              <RadioGroupItem value="correios" id="correios" />
              <Label htmlFor="correios" className="cursor-pointer flex-1">{t("quote.postalService")}</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Payment */}
      <Card className="border border-border/50 shadow-card animate-fade-in">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{t("quote.payment")}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea placeholder={t("quote.paymentPlaceholder")} value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)} className="min-h-[80px]" />
        </CardContent>
      </Card>

      {/* Observations */}
      <Card className="border border-border/50 shadow-card animate-fade-in">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{t("quote.observations")}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup value={temObservacoes} onValueChange={setTemObservacoes} className="flex gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sim" id="obs-sim" />
              <Label htmlFor="obs-sim" className="cursor-pointer">{t("quote.yes")}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="nao" id="obs-nao" />
              <Label htmlFor="obs-nao" className="cursor-pointer">{t("quote.no")}</Label>
            </div>
          </RadioGroup>
          {temObservacoes === "sim" && (
            <Textarea placeholder={t("quote.observationsPlaceholder")} value={observacoes} onChange={(e) => setObservacoes(e.target.value)} className="min-h-[80px] animate-fade-in" />
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 animate-fade-in">
        <Button onClick={handleSave} variant="outline" className="flex-1 h-11 gap-2" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {t("quote.saveQuote")}
        </Button>
        <Button onClick={handlePdf} variant="outline" className="flex-1 h-11 gap-2">
          <FileDown className="h-4 w-4" />
          {t("quote.downloadPdf")}
        </Button>
        <Button onClick={handleWhatsApp} className="flex-1 h-11 gap-2">
          <MessageCircle className="h-4 w-4" />
          {t("quote.sendWhatsApp")}
        </Button>
      </div>

      <p className="text-[11px] text-muted-foreground/60 text-center pb-2">{t("quote.fillFields")}</p>
      <CompanyFooter />
    </div>
  );
};

export default NovoOrcamento;
