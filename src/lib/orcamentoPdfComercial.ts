import jsPDF from "jspdf";
import { BrandingSettings, hslToRgb, generatedByText } from "@/hooks/useBranding";
import { OrcamentoComercial, OrcamentoItem } from "@/lib/orcamentosComercialQueries";

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

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

export async function generateOrcamentoPdfComercial(
  orcamento: OrcamentoComercial,
  itens: OrcamentoItem[],
  branding: BrandingSettings,
) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  const primary = branding.primary_color
    ? hslToRgb(branding.primary_color)
    : ([30, 58, 95] as [number, number, number]);
  const accent = branding.accent_color
    ? hslToRgb(branding.accent_color)
    : ([76, 138, 88] as [number, number, number]);
  const logoData = branding.logo_url ? await urlToDataUrl(branding.logo_url) : null;

  const companyName = (branding.company_name || branding.app_name || "").trim();

  // Footer rows
  type FRow = { kind: "title" | "contact"; text: string };
  const fRows: FRow[] = [];
  if (companyName)
    fRows.push({
      kind: "title",
      text: companyName + (branding.cnpj ? `  ·  CNPJ ${branding.cnpj}` : ""),
    });
  if (branding.address) fRows.push({ kind: "contact", text: `Endereço: ${branding.address}` });
  if (branding.phone)
    fRows.push({
      kind: "contact",
      text: `${branding.phone_is_whatsapp ? "WhatsApp" : "Tel"}: ${branding.phone}`,
    });

  const ROW_H = 13;
  const PAD_Y = 10;
  const BAND_H = fRows.length > 0 ? fRows.length * ROW_H + PAD_Y * 2 : 0;
  const FOOTER_H = BAND_H + 30;
  const BOTTOM_LIMIT = pageH - FOOTER_H - 10;

  const drawFooter = (pageNum: number, totalPages: number) => {
    const bandTop = pageH - FOOTER_H;
    if (fRows.length > 0) {
      doc.setFillColor(247, 248, 250);
      doc.rect(24, bandTop, pageW - 48, BAND_H, "F");
      doc.setDrawColor(accent[0], accent[1], accent[2]);
      doc.setLineWidth(1);
      doc.line(24, bandTop, pageW - 24, bandTop);
      fRows.forEach((row, idx) => {
        const fy = bandTop + PAD_Y + 10 + idx * ROW_H;
        if (row.kind === "title") {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.setTextColor(primary[0], primary[1], primary[2]);
        } else {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(80, 80, 80);
        }
        doc.text(row.text, pageW / 2, fy, { align: "center" });
      });
    }
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(generatedByText(branding), 24, pageH - 10);
    doc.text(`${pageNum}/${totalPages}`, pageW - 24, pageH - 10, { align: "right" });
  };

  // Watermark
  if (logoData) {
    try {
      const g = new (doc as any).GState({ opacity: 0.06 });
      (doc as any).setGState(g);
      const s = Math.min(pageW, pageH) * 0.65;
      doc.addImage(logoData, "PNG", (pageW - s) / 2, (pageH - s) / 2, s, s, undefined, "FAST");
      (doc as any).setGState(new (doc as any).GState({ opacity: 1 }));
    } catch {
      /* ignore */
    }
  }

  // Header band
  doc.setFillColor(primary[0], primary[1], primary[2]);
  doc.rect(0, 0, pageW, 86, "F");
  if (logoData) {
    try {
      doc.addImage(logoData, "PNG", 24, 16, 54, 54, undefined, "FAST");
    } catch {
      /* ignore */
    }
  }
  const logoOffset = logoData ? 92 : 24;
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.text(companyName || "Proposta Comercial", logoOffset, 42);
  if (branding.slogan) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.text(branding.slogan, logoOffset, 60);
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255, 0.8);
  doc.text("PROPOSTA COMERCIAL", pageW - 24, 34, { align: "right" });
  if (orcamento.numero_orcamento) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(orcamento.numero_orcamento, pageW - 24, 50, { align: "right" });
  }

  let y = 104;
  doc.setDrawColor(accent[0], accent[1], accent[2]);
  doc.setLineWidth(1.5);
  doc.line(24, y, pageW - 24, y);
  y += 16;

  // Date + validity
  const dateStr = new Date(orcamento.created_at).toLocaleDateString("pt-BR");
  const validDate = new Date(orcamento.created_at);
  validDate.setDate(validDate.getDate() + (orcamento.validade_dias || 30));
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(70, 70, 70);
  doc.text(`Data: ${dateStr}`, 24, y);
  doc.text(`Válida até: ${validDate.toLocaleDateString("pt-BR")}`, pageW - 24, y, { align: "right" });
  y += 20;

  const section = (title: string) => {
    if (y > BOTTOM_LIMIT - 20) {
      doc.addPage();
      y = 50;
    }
    doc.setFillColor(accent[0], accent[1], accent[2]);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.roundedRect(24, y - 12, pageW - 48, 19, 3, 3, "F");
    doc.text(title, 32, y + 1);
    y += 20;
    doc.setTextColor(40, 40, 40);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
  };

  const row = (text: string, indent = 0) => {
    const wrapped = doc.splitTextToSize(text, pageW - 48 - indent) as string[];
    for (const w of wrapped) {
      if (y > BOTTOM_LIMIT) {
        doc.addPage();
        y = 50;
      }
      doc.text(w, 24 + indent, y);
      y += 14;
    }
  };

  // Cliente
  section("Dados do Cliente");
  if (orcamento.cliente_nome) row(`Cliente: ${orcamento.cliente_nome}`);
  y += 4;

  // Itens — tabela
  if (itens.length > 0) {
    section("Itens da Proposta");
    const cols = { desc: 24, unit: 258, qty: 318, price: 388, sub: pageW - 28 };

    // Header row
    doc.setFillColor(245, 246, 248);
    doc.rect(24, y - 10, pageW - 48, 16, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(60, 60, 60);
    doc.text("Descrição", cols.desc + 4, y);
    doc.text("Unid.", cols.unit, y);
    doc.text("Qtd", cols.qty, y);
    doc.text("Valor Unit.", cols.price, y);
    doc.text("Subtotal", cols.sub, y, { align: "right" });
    y += 14;

    doc.setLineWidth(0.3);
    doc.setDrawColor(220, 222, 226);
    doc.line(24, y - 2, pageW - 24, y - 2);

    itens.forEach((item, idx) => {
      if (y > BOTTOM_LIMIT - 14) {
        doc.addPage();
        y = 50;
      }
      const bg = idx % 2 === 0 ? [255, 255, 255] : [250, 251, 252];
      doc.setFillColor(bg[0], bg[1], bg[2]);
      doc.rect(24, y - 10, pageW - 48, 14, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(30, 30, 30);
      const nameW = cols.unit - cols.desc - 8;
      const nameTrunc = (doc.splitTextToSize(item.nome_item, nameW) as string[])[0];
      doc.text(nameTrunc, cols.desc + 4, y);
      doc.setTextColor(80, 80, 80);
      doc.text(item.unidade || "—", cols.unit, y);
      const qtyDisplay = Number(item.quantidade) % 1 === 0
        ? String(Math.floor(Number(item.quantidade)))
        : String(item.quantidade);
      doc.text(qtyDisplay, cols.qty, y);
      doc.text(brl(Number(item.valor_unitario)), cols.price, y);
      doc.setFont("helvetica", "bold");
      doc.text(brl(Number(item.subtotal)), cols.sub, y, { align: "right" });
      y += 14;
    });

    doc.setLineWidth(0.5);
    doc.setDrawColor(accent[0], accent[1], accent[2]);
    doc.line(24, y, pageW - 24, y);
    y += 6;
  }

  // Total box
  if (y > BOTTOM_LIMIT - 30) {
    doc.addPage();
    y = 50;
  }
  const totalBoxW = 200;
  const totalBoxX = pageW - 24 - totalBoxW;
  doc.setFillColor(primary[0], primary[1], primary[2]);
  doc.roundedRect(totalBoxX, y, totalBoxW, 28, 4, 4, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text("TOTAL", totalBoxX + 12, y + 17);
  doc.setFontSize(14);
  doc.text(brl(Number(orcamento.total)), pageW - 32, y + 18, { align: "right" });
  y += 44;

  // Condições
  const hasCond = orcamento.forma_pagamento || orcamento.validade_dias;
  if (hasCond) {
    section("Condições Comerciais");
    if (orcamento.forma_pagamento) row(`Pagamento: ${orcamento.forma_pagamento}`);
    row(`Validade: ${orcamento.validade_dias} dias`);
    y += 4;
  }

  // Observações
  if (orcamento.observacoes) {
    section("Observações");
    row(orcamento.observacoes);
    y += 4;
  }

  // Assinatura
  if (y > BOTTOM_LIMIT - 60) {
    doc.addPage();
    y = 50;
  }
  y += 16;
  const sigX = 40;
  const sigX2 = pageW / 2 + 20;
  const sigY = y + 30;
  doc.setDrawColor(120, 120, 120);
  doc.setLineWidth(0.8);
  doc.line(sigX, sigY, sigX + 180, sigY);
  doc.line(sigX2, sigY, sigX2 + 180, sigY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 100, 100);
  doc.text(companyName || "Vendedor", sigX + 90, sigY + 11, { align: "center" });
  doc.text("Cliente / Aprovação", sigX2 + 90, sigY + 11, { align: "center" });

  // Draw footer on all pages
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawFooter(p, totalPages);
  }

  return doc;
}
