import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchOrcamentos, fetchOrcamentoById, deleteOrcamento, updateOrcamentoStatus,
  duplicateOrcamento,
  type OrcamentoComercial, type OrcamentoStatus,
} from "@/lib/orcamentosComercialQueries";
import { ensureEntradaFromOrcamento, cancelarEntradaByOrcamento } from "@/lib/financeiroQueries";
import { generateOrcamentoPdfComercial } from "@/lib/orcamentoPdfComercial";
import { useBranding } from "@/hooks/useBranding";
import { PremiumHeader, PremiumStat } from "@/components/premium";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MovimentacaoModal } from "@/components/financeiro/MovimentacaoModal";
import { toast } from "sonner";
import {
  FileText, Plus, Search, CheckCircle2, Eye,
  ChevronDown, Pencil, Trash2, XCircle, Clock, Loader2,
  DollarSign, Copy, MessageCircle, RotateCcw, FileDown,
} from "lucide-react";

const toNum = (v: any): number => parseFloat(String(v ?? 0)) || 0;
const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const STATUS_CFG: Record<OrcamentoStatus, { label: string; cls: string }> = {
  em_aberto:  { label: "Em aberto",  cls: "bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-400" },
  aprovado:   { label: "Aprovado",   cls: "bg-green-500/15 text-green-700 border-green-500/30 dark:text-green-400" },
  recusado:   { label: "Recusado",   cls: "bg-red-500/15 text-red-700 border-red-500/30 dark:text-red-400" },
  finalizado: { label: "Finalizado", cls: "bg-blue-500/15 text-blue-700 border-blue-500/30 dark:text-blue-400" },
};

export default function OrcamentosComerciais() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { branding } = useBranding();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [deleteTarget, setDeleteTarget] = useState<OrcamentoComercial | null>(null);
  const [pdfLoading, setPdfLoading] = useState<string | null>(null);
  const [duplicating, setDuplicating] = useState<string | null>(null);
  const [financeiroModal, setFinanceiroModal] = useState<OrcamentoComercial | null>(null);

  const { data: orcamentos = [], isLoading } = useQuery({
    queryKey: ["orcamentos"],
    queryFn: fetchOrcamentos,
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return orcamentos.filter((o) => {
      if (q && !(o.cliente_nome ?? "").toLowerCase().includes(q) && !(o.numero_orcamento ?? "").toLowerCase().includes(q)) return false;
      if (filterStatus !== "all" && o.status !== filterStatus) return false;
      return true;
    });
  }, [orcamentos, search, filterStatus]);

  const countAprovado = useMemo(
    () => orcamentos.filter((o) => o.status === "aprovado" || o.status === "finalizado").length,
    [orcamentos],
  );
  const counts = useMemo(() => ({
    all:        orcamentos.length,
    em_aberto:  orcamentos.filter((o) => o.status === "em_aberto").length,
    aprovado:   orcamentos.filter((o) => o.status === "aprovado").length,
    recusado:   orcamentos.filter((o) => o.status === "recusado").length,
    finalizado: orcamentos.filter((o) => o.status === "finalizado").length,
  }), [orcamentos]);

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteOrcamento(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orcamentos"] });
      toast.success("Proposta excluída");
      setDeleteTarget(null);
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro"),
  });

  const statusMut = useMutation({
    mutationFn: async ({ id, status, orc }: { id: string; status: OrcamentoStatus; orc: OrcamentoComercial }) => {
      await updateOrcamentoStatus(id, status);
      if (status === "aprovado" || status === "finalizado") {
        await ensureEntradaFromOrcamento(orc);
      } else if (status === "em_aberto" || status === "recusado") {
        await cancelarEntradaByOrcamento(id);
      }
    },
    onSuccess: (_, { status }) => {
      qc.invalidateQueries({ queryKey: ["orcamentos"] });
      qc.invalidateQueries({ queryKey: ["financeiro-movimentacoes"] });
      qc.invalidateQueries({ queryKey: ["financeiro-real-metrics"] });
      qc.invalidateQueries({ queryKey: ["financeiro-chart"] });
      qc.invalidateQueries({ queryKey: ["financeiro-cat"] });
      toast.success(`Status atualizado: ${STATUS_CFG[status].label}`);
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro"),
  });

  const handlePdf = async (orc: OrcamentoComercial) => {
    setPdfLoading(orc.id);
    try {
      const full = await fetchOrcamentoById(orc.id);
      const doc = await generateOrcamentoPdfComercial(full, full.itens, branding);
      const safe = (orc.cliente_nome || orc.numero_orcamento || "proposta")
        .replace(/[^a-z0-9]+/gi, "-").toLowerCase();
      doc.save(`proposta-${safe}.pdf`);
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao gerar PDF");
    } finally {
      setPdfLoading(null);
    }
  };

  const handleWhatsApp = (orc: OrcamentoComercial) => {
    const num = orc.numero_orcamento ?? "";
    const cliente = orc.cliente_nome ?? "";
    const valor = brl(toNum(orc.total));
    const msg = encodeURIComponent(
      `Olá! Segue o orçamento${num ? ` ${num}` : ""}${cliente ? ` para ${cliente}` : ""} no valor de ${valor}. Qualquer dúvida, estou à disposição.`,
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  const handleDuplicate = async (orc: OrcamentoComercial) => {
    setDuplicating(orc.id);
    try {
      await duplicateOrcamento(orc.id);
      qc.invalidateQueries({ queryKey: ["orcamentos"] });
      toast.success("Proposta duplicada com sucesso");
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao duplicar");
    } finally {
      setDuplicating(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PremiumHeader
        icon={FileText}
        badge="Módulo Comercial"
        title="Propostas Comerciais"
        subtitle={isLoading ? "Carregando..." : `${orcamentos.length} proposta(s)`}
        variant="gradient"
        action={
          <Button
            onClick={() => navigate("/orcamentos/novo")}
            className="bg-white/15 hover:bg-white/25 text-white border border-white/20 font-semibold"
          >
            <Plus className="h-4 w-4 mr-1.5" /> Nova Proposta
          </Button>
        }
      />

      {!isLoading && (
        <div className="grid grid-cols-2 gap-3">
          <PremiumStat icon={FileText}     label="Total de Propostas" value={orcamentos.length} variant="blue" />
          <PremiumStat icon={CheckCircle2} label="Aprovadas"          value={countAprovado}     variant="green" />
        </div>
      )}

      {/* Abas por status */}
      <Tabs value={filterStatus} onValueChange={setFilterStatus}>
        <TabsList className="flex h-auto flex-wrap gap-1 rounded-xl bg-muted/40 p-1">
          {([
            { value: "all",        label: "Todos",       count: counts.all },
            { value: "em_aberto",  label: "Em aberto",   count: counts.em_aberto },
            { value: "aprovado",   label: "Aprovados",   count: counts.aprovado },
            { value: "recusado",   label: "Recusados",   count: counts.recusado },
            { value: "finalizado", label: "Finalizados", count: counts.finalizado },
          ] as const).map(({ value, label, count }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              {label}
              <span className="inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-muted px-1 text-[10px] tabular-nums text-muted-foreground">
                {count}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Buscar por cliente ou número..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Tabela */}
      <div className="rounded-2xl border border-border/40 bg-card/70 backdrop-blur-xl overflow-x-auto shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-border/30 hover:bg-transparent">
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Nº</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Cliente</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Data</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-right">Total</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-center hidden sm:table-cell">Status</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-right w-24">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-20 mx-auto rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-7 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-14 text-muted-foreground">
                  <FileText className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">{orcamentos.length === 0 ? "Nenhuma proposta criada" : "Sem resultados"}</p>
                  {orcamentos.length === 0 && (
                    <Button size="sm" className="mt-3" onClick={() => navigate("/orcamentos/novo")}>
                      <Plus className="h-3.5 w-3.5 mr-1" /> Nova Proposta
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((orc) => {
                const st = STATUS_CFG[orc.status as OrcamentoStatus] ?? STATUS_CFG.em_aberto;
                return (
                  <TableRow key={orc.id} className="border-border/20 hover:bg-muted/20 transition-colors">
                    <TableCell className="font-mono text-xs text-muted-foreground">{orc.numero_orcamento || "—"}</TableCell>
                    <TableCell className="font-medium text-sm">{orc.cliente_nome || "—"}</TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      {new Date(orc.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right font-bold tabular-nums text-sm">{brl(toNum(orc.total))}</TableCell>
                    <TableCell className="text-center hidden sm:table-cell">
                      <Badge variant="outline" className={`text-xs ${st.cls}`}>{st.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 gap-1.5 text-xs border-border/70 hover:border-border hover:bg-muted/60"
                            >
                              Ações <ChevronDown className="h-3 w-3 opacity-60" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52">
                            <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-normal py-1">
                              {orc.numero_orcamento ?? "Proposta"}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            {/* Ações principais */}
                            <DropdownMenuItem onClick={() => handlePdf(orc)} disabled={pdfLoading === orc.id}>
                              {pdfLoading === orc.id
                                ? <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                                : <Eye className="h-3.5 w-3.5 mr-2" />}
                              Visualizar PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/orcamentos/${orc.id}`)}>
                              <Pencil className="h-3.5 w-3.5 mr-2" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePdf(orc)} disabled={pdfLoading === orc.id}>
                              <FileDown className="h-3.5 w-3.5 mr-2" /> Baixar PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleWhatsApp(orc)}>
                              <MessageCircle className="h-3.5 w-3.5 mr-2 text-green-600" /> Enviar WhatsApp
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(orc)} disabled={duplicating === orc.id}>
                              {duplicating === orc.id
                                ? <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                                : <Copy className="h-3.5 w-3.5 mr-2" />}
                              Duplicar
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />
                            <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-normal py-1">
                              Alterar status
                            </DropdownMenuLabel>

                            {orc.status !== "em_aberto" && (
                              <DropdownMenuItem onClick={() => statusMut.mutate({ id: orc.id, status: "em_aberto", orc })}>
                                <RotateCcw className="h-3.5 w-3.5 mr-2 text-amber-600" /> Em Aberto
                              </DropdownMenuItem>
                            )}
                            {orc.status !== "aprovado" && (
                              <DropdownMenuItem onClick={() => statusMut.mutate({ id: orc.id, status: "aprovado", orc })}>
                                <CheckCircle2 className="h-3.5 w-3.5 mr-2 text-green-600" /> Aprovado
                              </DropdownMenuItem>
                            )}
                            {orc.status !== "finalizado" && (
                              <DropdownMenuItem onClick={() => statusMut.mutate({ id: orc.id, status: "finalizado", orc })}>
                                <Clock className="h-3.5 w-3.5 mr-2 text-blue-600" /> Finalizado
                              </DropdownMenuItem>
                            )}
                            {orc.status !== "recusado" && (
                              <DropdownMenuItem onClick={() => statusMut.mutate({ id: orc.id, status: "recusado", orc })}>
                                <XCircle className="h-3.5 w-3.5 mr-2 text-red-600" /> Recusado
                              </DropdownMenuItem>
                            )}

                            {(orc.status === "aprovado" || orc.status === "finalizado") && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setFinanceiroModal(orc)}>
                                  <DollarSign className="h-3.5 w-3.5 mr-2 text-green-600" /> Gerar entrada financeira
                                </DropdownMenuItem>
                              </>
                            )}

                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteTarget(orc)}
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-2" /> Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Confirmar exclusão */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir proposta?</AlertDialogTitle>
            <AlertDialogDescription>
              A proposta <strong>{deleteTarget?.numero_orcamento}</strong> de{" "}
              <strong>{deleteTarget?.cliente_nome}</strong> será excluída permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTarget && deleteMut.mutate(deleteTarget.id)}
              disabled={deleteMut.isPending}
            >
              {deleteMut.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal financeiro */}
      {financeiroModal && (
        <MovimentacaoModal
          open={!!financeiroModal}
          onClose={() => setFinanceiroModal(null)}
          defaultTipo="entrada"
          defaultOrcamentoId={financeiroModal.id}
          defaultDescricao={`Proposta ${financeiroModal.numero_orcamento ?? ""} — ${financeiroModal.cliente_nome ?? ""}`}
          defaultValor={toNum(financeiroModal.total)}
        />
      )}
    </div>
  );
}
