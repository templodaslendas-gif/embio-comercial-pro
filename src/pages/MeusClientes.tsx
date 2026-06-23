import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Users, MapPin, Loader2, FileText, ChevronDown, ChevronUp, MessageCircle, Copy, Check, FileDown,
} from "lucide-react";
import { useBranding, generatedByText } from "@/hooks/useBranding";
import { generateQuotePdf } from "@/lib/quotePdf";
import { CompanyFooter } from "@/components/CompanyFooter";

interface Quote {
  id: string;
  numero_pedido: string | null;
  producer_name: string;
  property_name: string | null;
  location: string | null;
  production_type: string;
  product_name: string;
  input_value: number;
  frascos: number;
  frequencia: string;
  detalhes: string | null;
  status: string;
  created_at: string;
  empresa_name: string | null;
  responsavel: string | null;
  aplicacao: string | null;
  propulsores_json: any[] | null;
  aditivos_json: any[] | null;
  forma_envio: string | null;
  forma_pagamento: string | null;
  observacoes: string | null;
}

interface GroupedClient {
  name: string;
  location: string | null;
  quotes: Quote[];
}

const MeusClientes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { branding } = useBranding();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedClient, setExpandedClient] = useState<string | null>(null);
  const [expandedSummary, setExpandedSummary] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  const sanitizeQty = (val: any): number => {
    const s = String(val).replace(/[xX]/g, "").trim();
    return Number(s) || 0;
  };

  const unitLabel = (qty: number) => qty === 1 ? t("common.unit") : t("common.units");

  useEffect(() => {
    if (!user) return;
    const fetchQuotes = async () => {
      const { data } = await supabase.from("quotes").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setQuotes((data as unknown as Quote[]) || []);
      setLoading(false);
    };
    fetchQuotes();
  }, [user]);

  const updateStatus = async (quoteId: string, newStatus: string) => {
    const { error } = await supabase.from("quotes").update({ status: newStatus }).eq("id", quoteId);
    if (error) {
      toast({ title: t("clients.statusUpdateError"), variant: "destructive" });
      return;
    }
    setQuotes((prev) => prev.map((q) => (q.id === quoteId ? { ...q, status: newStatus } : q)));
    toast({ title: t("clients.statusUpdated") });
  };

  const buildQuoteSummary = (q: Quote) => {
    let text = `📋 ${t("quote.whatsappHeader").replace("📋 ", "").replace("*", "").replace("*", "")}\n`;
    if (q.numero_pedido) text += `🔢 ${t("quote.title")}: ${q.numero_pedido}\n`;
    text += `📅 Data: ${new Date(q.created_at).toLocaleDateString("pt-BR")}\n\n`;
    text += `👤 ${t("quote.companyName")}: ${q.empresa_name || q.producer_name}\n`;
    if (q.responsavel) text += `👤 ${t("quote.responsible")}: ${q.responsavel}\n`;
    if (q.location) text += `📍 ${t("quote.location")}: ${q.location}\n`;

    const props = q.propulsores_json as any[];
    if (props && props.length > 0) {
      text += `\n⚙️ ${t("quote.propulsors")}:\n`;
      props.forEach((p: any) => {
        const pQty = p.quantidade || 1;
        text += `  • ${pQty} ${pQty === 1 ? t("common.unit") : t("common.units")} ${p.modelo}`;
        if (p.voltagem) text += ` - ${p.voltagem}`;
        if (p.fase) text += ` ${p.fase}`;
        if (p.caixaEletrica) text += ` - ${p.caixaEletrica}`;
        if (p.aplicacao) text += ` - ${p.aplicacao === "bovino" ? `🐄 ${t("quote.bovine")}` : `🐷 ${t("quote.swine")}`}`;
        text += `\n`;
      });
    }

    const adts = q.aditivos_json as any[];
    if (adts && adts.length > 0) {
      text += `\n🧪 ${t("quote.additives")}:\n`;
      adts.forEach((a: any) => {
        const qty = sanitizeQty(a.quantidade);
        text += `  • ${qty} ${unitLabel(qty)} ${a.produto}\n`;
      });
    }

    if (q.forma_envio) text += `\n📦 ${t("quote.shipping")}: ${q.forma_envio === "retirar" ? t("quote.pickUp") : q.forma_envio === "correios" ? t("quote.postalService") : t("quote.carrier")}\n`;
    if (q.forma_pagamento) text += `💳 ${t("quote.payment")}: ${q.forma_pagamento}\n`;
    if (q.observacoes) text += `\n📝 ${t("quote.observations")}: ${q.observacoes}\n`;

    text += `\n${t("quote.expectedResults")}\n`;
    text += `• ${t("quote.resultGas")}\n`;
    text += `• ${t("quote.resultLarvae")}\n`;
    text += `• ${t("quote.resultFluidity")}\n\n`;
    text += generatedByText(branding);
    return text;
  };

  const handleResendWhatsApp = (q: Quote) => {
    window.open(`https://wa.me/?text=${encodeURIComponent(buildQuoteSummary(q))}`, "_blank", "noopener,noreferrer");
  };

  const handleCopy = async (q: Quote) => {
    try {
      await navigator.clipboard.writeText(buildQuoteSummary(q));
      setCopiedId(q.id);
      toast({ title: t("clients.summaryCopied") });
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast({ title: t("clients.copyError"), variant: "destructive" });
    }
  };

  const handlePdf = async (q: Quote) => {
    try {
      const doc = await generateQuotePdf(q as any, branding);
      const id = (q.numero_pedido || q.id).replace(/[^a-z0-9]+/gi, "-");
      doc.save(`orcamento-${id}.pdf`);
    } catch (e: any) {
      toast({ title: t("quote.pdfError"), description: e?.message, variant: "destructive" });
    }
  };

  const grouped: GroupedClient[] = [];
  const seen = new Map<string, number>();
  quotes.forEach((q) => {
    const key = (q.empresa_name || q.producer_name).toLowerCase().trim();
    if (seen.has(key)) {
      grouped[seen.get(key)!].quotes.push(q);
    } else {
      seen.set(key, grouped.length);
      grouped.push({ name: q.empresa_name || q.producer_name, location: q.location, quotes: [q] });
    }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 animate-fade-in">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">{t("clients.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("clients.subtitle")}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : grouped.length === 0 ? (
        <Card className="border border-border/50 shadow-card">
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">{t("clients.noQuotes")}</p>
            <p className="text-xs text-muted-foreground mt-1">{t("clients.noQuotesHint")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {grouped.map((client) => {
            const isExpanded = expandedClient === client.name;
            return (
              <Card key={client.name} className="border border-border/50 shadow-card hover:shadow-card-hover transition-shadow">
                <CardContent className="p-0">
                  <button className="w-full p-4 flex items-center justify-between text-left" onClick={() => setExpandedClient(isExpanded ? null : client.name)}>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-foreground">{client.name}</h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {client.location && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> {client.location}</span>
                        )}
                        <span className="text-[10px] font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                          {client.quotes.length} {t("clients.quotesCount")}
                        </span>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0 ml-2" /> : <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0 ml-2" />}
                  </button>

                  {isExpanded && (
                    <div className="border-t border-border/50 p-4 space-y-4 animate-fade-in">
                      {client.quotes.map((q) => {
                        const isSummaryOpen = expandedSummary === q.id;
                        const props = q.propulsores_json as any[];
                        const adts = q.aditivos_json as any[];
                        return (
                          <div key={q.id} className="rounded-xl bg-muted/40 p-4 space-y-3">
                            <div className="space-y-1.5 text-sm">
                              <div className="flex items-center gap-2 flex-wrap">
                                <FileText className="h-4 w-4 text-primary shrink-0" />
                                {q.numero_pedido && (
                                  <>
                                    <span className="font-bold text-primary">{q.numero_pedido}</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 px-1.5 text-xs gap-1"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigator.clipboard.writeText(q.numero_pedido!).then(() => {
                                          setCopiedOrderId(q.id);
                                          toast({ title: t("clients.orderNumberCopied") });
                                          setTimeout(() => setCopiedOrderId(null), 2000);
                                        });
                                      }}
                                    >
                                      {copiedOrderId === q.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                      {copiedOrderId === q.id ? t("clients.copied") : t("clients.copyOrderNumber")}
                                    </Button>
                                  </>
                                )}
                                <span className="font-medium">{new Date(q.created_at).toLocaleDateString("pt-BR")}</span>
                              </div>
                              {q.responsavel && <p className="text-muted-foreground">👤 {t("clients.responsible")}: {q.responsavel}</p>}

                              {props && props.length > 0 && (
                                <div>
                                  <p className="font-medium text-foreground">⚙️ {t("clients.propulsors")}:</p>
                                  {props.map((p: any, i: number) => (
                                    <p key={i} className="text-muted-foreground ml-4">
                                      • {p.quantidade || 1} {(p.quantidade || 1) === 1 ? t("common.unit") : t("common.units")} {p.modelo}{p.voltagem ? ` - ${p.voltagem}` : ""}{p.fase ? ` ${p.fase}` : ""}{p.caixaEletrica ? ` - ${p.caixaEletrica}` : ""}{p.aplicacao ? ` - ${p.aplicacao === "bovino" ? `🐄 ${t("quote.bovine")}` : `🐷 ${t("quote.swine")}`}` : ""}
                                    </p>
                                  ))}
                                </div>
                              )}

                              {adts && adts.length > 0 && (
                                <div>
                                  <p className="font-medium text-foreground">🧪 {t("clients.additives")}:</p>
                                  {adts.map((a: any, i: number) => {
                                    const qty = sanitizeQty(a.quantidade);
                                    return (
                                      <p key={i} className="text-muted-foreground ml-4">• {qty} {unitLabel(qty)} {a.produto}</p>
                                    );
                                  })}
                                </div>
                              )}

                              {q.forma_envio && (
                                <p className="text-muted-foreground">📦 {t("clients.shipping")}: {q.forma_envio === "retirar" ? t("clients.pickUp") : q.forma_envio === "correios" ? t("clients.postalService") : t("clients.carrier")}</p>
                              )}
                              {q.forma_pagamento && <p className="text-muted-foreground">💳 {t("clients.payment")}: {q.forma_pagamento}</p>}
                              {q.observacoes && <p className="text-muted-foreground">📝 {t("clients.obs")}: {q.observacoes}</p>}
                            </div>

                            <div className="pt-2 border-t border-border/30 flex flex-wrap items-center gap-2">
                              <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={() => setExpandedSummary(isSummaryOpen ? null : q.id)}>
                                <FileText className="h-3.5 w-3.5" />
                                {isSummaryOpen ? t("clients.hideSummary") : t("clients.showSummary")}
                                {isSummaryOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                              </Button>
                              <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" onClick={() => handlePdf(q)}>
                                <FileDown className="h-3.5 w-3.5" />
                                {t("clients.downloadPdf")}
                              </Button>
                            </div>
                            <div>

                              {isSummaryOpen && (
                                <div className="animate-fade-in space-y-2">
                                  <pre className="whitespace-pre-wrap text-xs bg-background border border-border/50 rounded-lg p-3 font-sans leading-relaxed text-foreground">
                                    {buildQuoteSummary(q)}
                                  </pre>
                                  <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" onClick={() => handleCopy(q)}>
                                      {copiedId === q.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                      {copiedId === q.id ? t("clients.copied") : t("clients.copy")}
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={() => handleResendWhatsApp(q)}>
                                      <MessageCircle className="h-3.5 w-3.5" />
                                      {t("clients.sendWhatsApp")}
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2 pt-2 border-t border-border/30">
                              <span className="text-xs text-muted-foreground">{t("clients.status")}:</span>
                              <Select value={q.status} onValueChange={(v) => updateStatus(q.id, v)}>
                                <SelectTrigger className="h-7 w-auto min-w-[160px] text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="em_aberto">{t("clients.statusOpen")}</SelectItem>
                                  <SelectItem value="fechado">{t("clients.statusApproved")}</SelectItem>
                                  <SelectItem value="finalizado">{t("clients.statusFinished")}</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      <CompanyFooter />
    </div>
  );
};

export default MeusClientes;
