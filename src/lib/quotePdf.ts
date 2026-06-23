import jsPDF from "jspdf";
import { BrandingSettings, hslToRgb, generatedByText } from "@/hooks/useBranding";

interface QuoteLike {
  numero_pedido?: string | null;
  created_at?: string;
  empresa_name?: string | null;
  producer_name?: string;
  responsavel?: string | null;
  location?: string | null;
  aplicacao?: string | null;
  propulsores_json?: any[] | null;
  aditivos_json?: any[] | null;
  forma_envio?: string | null;
  forma_pagamento?: string | null;
  observacoes?: string | null;
}

async function urlToDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { mode: "cors" });
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function envioLabel(v?: string | null) {
  if (v === "retirar") return "Retirar no local";
  if (v === "correios") return "Correios";
  if (v === "transportadora") return "Transportadora";
  return v || "";
}

export async function generateQuotePdf(quote: QuoteLike, branding: BrandingSettings) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  const primary = branding.primary_color ? hslToRgb(branding.primary_color) : [30, 58, 95] as [number, number, number];
  const accent = branding.accent_color ? hslToRgb(branding.accent_color) : [76, 138, 88] as [number, number, number];

  const logoData = branding.logo_url ? await urlToDataUrl(branding.logo_url) : null;

  // Precompute footer rows for premium business footer
  const companyNamePre = (branding.company_name || branding.app_name || "").trim();
  type FooterRow = { kind: "title" | "address" | "phone"; text: string };
  const footerRows: FooterRow[] = [];
  if (companyNamePre || branding.cnpj) {
    footerRows.push({
      kind: "title",
      text: [companyNamePre, branding.cnpj ? `CNPJ ${branding.cnpj}` : ""].filter(Boolean).join("  ·  "),
    });
  }
  if (branding.address) {
    const wrapped = doc.splitTextToSize(branding.address, pageW - 96) as string[];
    wrapped.forEach((w, i) => footerRows.push({ kind: "address", text: i === 0 ? `End.: ${w}` : w }));
  }
  if (branding.phone) {
    footerRows.push({
      kind: "phone",
      text: `${branding.phone_is_whatsapp ? "WhatsApp" : "Tel"}: ${branding.phone}`,
    });
  }
  const ROW_H = 13;
  const BAND_PAD_Y = 10;
  const BAND_H = footerRows.length > 0 ? footerRows.length * ROW_H + BAND_PAD_Y * 2 : 0;
  const GENERATED_BY_H = 16;
  const BOTTOM_MARGIN = 24;
  const FOOTER_RESERVED = BAND_H + GENERATED_BY_H + BOTTOM_MARGIN + 14;
  const BOTTOM_LIMIT = pageH - FOOTER_RESERVED;

  // Watermark (faded logo centered)
  if (logoData) {
    try {
      const gState = new (doc as any).GState({ opacity: 0.07 });
      (doc as any).setGState(gState);
      const wmSize = Math.min(pageW, pageH) * 0.7;
      doc.addImage(logoData, "PNG", (pageW - wmSize) / 2, (pageH - wmSize) / 2, wmSize, wmSize, undefined, "FAST");
      const reset = new (doc as any).GState({ opacity: 1 });
      (doc as any).setGState(reset);
    } catch { /* ignore */ }
  }

  // Header band
  doc.setFillColor(primary[0], primary[1], primary[2]);
  doc.rect(0, 0, pageW, 90, "F");

  if (logoData) {
    try {
      doc.addImage(logoData, "PNG", 24, 18, 56, 56, undefined, "FAST");
    } catch { /* ignore */ }
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  const headerName = (branding.company_name || branding.app_name || "").trim();
  doc.text(headerName || "Orçamento", logoData ? 96 : 24, 44);
  if (branding.slogan) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.text(branding.slogan, logoData ? 96 : 24, 62);
  }

  // Title bar
  let y = 120;
  doc.setTextColor(primary[0], primary[1], primary[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Orçamento Técnico", 24, y);

  if (quote.numero_pedido) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.text(`Pedido: ${quote.numero_pedido}`, pageW - 24, y, { align: "right" });
  }
  y += 8;
  doc.setDrawColor(accent[0], accent[1], accent[2]);
  doc.setLineWidth(1.5);
  doc.line(24, y, pageW - 24, y);
  y += 20;

  const dateStr = quote.created_at
    ? new Date(quote.created_at).toLocaleDateString("pt-BR")
    : new Date().toLocaleDateString("pt-BR");

  doc.setTextColor(60, 60, 60);
  doc.setFontSize(10);
  doc.text(`Data: ${dateStr}`, 24, y);
  y += 22;

  const section = (title: string) => {
    if (y > BOTTOM_LIMIT - 20) { doc.addPage(); y = 60; }
    doc.setFillColor(accent[0], accent[1], accent[2]);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.roundedRect(24, y - 12, pageW - 48, 20, 3, 3, "F");
    doc.text(title, 32, y + 2);
    y += 22;
    doc.setTextColor(40, 40, 40);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
  };

  const line = (text: string, indent = 0) => {
    const wrapped = doc.splitTextToSize(text, pageW - 48 - indent);
    for (const w of wrapped) {
      if (y > BOTTOM_LIMIT) { doc.addPage(); y = 60; }
      doc.text(w, 24 + indent, y);
      y += 14;
    }
  };

  // Cliente
  section("Cliente");
  line(`Empresa: ${quote.empresa_name || quote.producer_name || "-"}`);
  if (quote.responsavel) line(`Responsável: ${quote.responsavel}`);
  if (quote.location) line(`Local: ${quote.location}`);
  if (quote.aplicacao) line(`Aplicação: ${quote.aplicacao}`);
  y += 6;

  // Propulsores
  const props = (quote.propulsores_json as any[]) || [];
  if (props.length > 0) {
    section("Propulsores");
    props.forEach((p: any) => {
      const qty = p.quantidade || 1;
      const parts = [`${qty}x ${p.modelo || ""}`];
      if (p.voltagem) parts.push(p.voltagem);
      if (p.fase) parts.push(p.fase);
      if (p.caixaEletrica) parts.push(p.caixaEletrica);
      if (p.aplicacao) parts.push(p.aplicacao);
      line(`• ${parts.filter(Boolean).join(" - ")}`);
    });
    y += 6;
  }

  // Aditivos
  const adts = (quote.aditivos_json as any[]) || [];
  if (adts.length > 0) {
    section("Aditivos");
    adts.forEach((a: any) => {
      const qty = String(a.quantidade ?? "").replace(/[xX]/g, "").trim() || "0";
      line(`• ${qty} un. ${a.produto || ""}`);
    });
    y += 6;
  }

  // Logística
  if (quote.forma_envio || quote.forma_pagamento) {
    section("Logística e Pagamento");
    if (quote.forma_envio) line(`Envio: ${envioLabel(quote.forma_envio)}`);
    if (quote.forma_pagamento) line(`Pagamento: ${quote.forma_pagamento}`);
    y += 6;
  }

  // Observações
  if (quote.observacoes) {
    section("Observações");
    line(quote.observacoes);
    y += 6;
  }

  // Premium business footer on every page
  const totalPages = (doc as any).internal.getNumberOfPages();
  const footerText = generatedByText(branding);

  const generatedByY = pageH - BOTTOM_MARGIN;
  const bandBottomY = generatedByY - 10;
  const bandTopY = bandBottomY - BAND_H;
  const firstRowBaselineY = bandTopY + BAND_PAD_Y + 10;

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    if (footerRows.length > 0) {
      // Subtle background band
      doc.setFillColor(247, 248, 250);
      doc.rect(24, bandTopY, pageW - 48, BAND_H, "F");

      // Accent top border (thin, premium)
      doc.setDrawColor(accent[0], accent[1], accent[2]);
      doc.setLineWidth(1);
      doc.line(24, bandTopY, pageW - 24, bandTopY);

      // Render rows with hierarchy
      footerRows.forEach((row, idx) => {
        const y = firstRowBaselineY + idx * ROW_H;
        if (row.kind === "title") {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.setTextColor(primary[0], primary[1], primary[2]);
        } else if (row.kind === "phone") {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9.5);
          doc.setTextColor(primary[0], primary[1], primary[2]);
        } else {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(80, 80, 80);
        }
        doc.text(row.text, pageW / 2, y, { align: "center" });
      });
    }

    // Generated by + page number (discreet, below band)
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(footerText, 24, generatedByY);
    doc.text(`${i}/${totalPages}`, pageW - 24, generatedByY, { align: "right" });
  }

  return doc;
}
