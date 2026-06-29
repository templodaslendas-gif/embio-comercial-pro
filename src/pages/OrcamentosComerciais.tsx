import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchOrcamentos, fetchOrcamentoById, deleteOrcamento, updateOrcamentoStatus,
  type OrcamentoComercial, type OrcamentoStatus,
} from "@/lib/orcamentosComercialQueries";
import { generateOrcamentoPdfComercial } from "@/lib/orcamentoPdfComercial";
import { useBranding } from "@/hooks/useBranding";
import { PremiumHeader, PremiumStat } from "@/components/premium";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MovimentacaoModal } from "@/components/financeiro/MovimentacaoModal";
import { toast } from "sonner";
import {
  FileText, Plus, Search, TrendingUp, CheckCircle2,
  MoreVertical, Pencil, Trash2, FileDown, XCircle, Clock, Loader2, DollarSign,
} from "lucide-react";

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const STATUS_CFG: Record<OrcamentoStatus, { label: string; cls: string }> = {
  em_aberto:  { label: "Em aberto",  cls: "bg-amber-500/15 text-amber-700 border-amber-500/30" },
  aprovado:   { label: "Aprovado",   cls: "bg-green-500/15 text-green-700 border-green-500/30" },
  recusado:   { label: "Recusado",   cls: "bg-red-500/15 text-red-700 border-red-500/30" },
  finalizado: { label: "Finalizado", cls: "bg-muted text-muted-foreground border-border/60" },
};

export default function OrcamentosComerciais() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { branding } = useBranding();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<OrcamentoComercial | null>(null);
  const [pdfLoading, setPdfLoading] = useState<string | null>(null);
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

  const totalOrcado = useMemo(() => orcamentos.reduce((s, o) => s + Number(o.total), 0), [orcamentos]);
  const countAprovado = useMemo(
    () => orcamentos.filter((o) => o.status === "aprovado" || o.status === "finalizado").length,
    [orcamentos],
  );

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
    mutationFn: ({ id, status }: { id: string; status: OrcamentoStatus }) =>
      updateOrcamentoStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orcamentos"] });
      toast.success("Status atualizado");
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
        <div className="grid grid-cols-3 gap-3">
          <PremiumStat icon={FileText}    label="Total de Propostas" value={orcamentos.length} variant="blue" />
          <PremiumStat icon={CheckCircle2} label="Aprovadas"         value={countAprovado}     variant="green" />
          <PremiumStat icon={TrendingUp}  label="Total Orçado"      value={brl(totalOrcado)}  variant="default" />
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar por cliente ou número..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="em_aberto">Em aberto</SelectItem>
            <SelectItem value="aprovado">Aprovado</SelectItem>
            <SelectItem value="recusado">Recusado</SelectItem>
            <SelectItem value="finalizado">Finalizado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-2xl border border-border/40 bg-card/70 backdrop-blur-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-border/30 hover:bg-transparent">
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Nº</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Cliente</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Data</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-right">Total</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-center hidden md:table-cell">Status</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-right">Ações</TableHead>
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
                    <TableCell className="text-right font-bold tabular-nums text-sm">{brl(Number(orc.total))}</TableCell>
                    <TableCell className="text-center hidden md:table-cell">
                      <Badge variant="outline" className={`text-xs ${st.cls}`}>{st.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-7 w-7">
                              <MoreVertical className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/orcamentos/${orc.id}`)}>
                              <Pencil className="h-3.5 w-3.5 mr-2" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePdf(orc)} disabled={pdfLoading === orc.id}>
                              {pdfLoading === orc.id
                                ? <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                                : <FileDown className="h-3.5 w-3.5 mr-2" />}
                              Baixar PDF
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {orc.status !== "aprovado" && (
                              <DropdownMenuItem onClick={() => statusMut.mutate({ id: orc.id, status: "aprovado" })}>
                                <CheckCircle2 className="h-3.5 w-3.5 mr-2 text-green-600" /> Marcar Aprovado
                              </DropdownMenuItem>
                            )}
                            {orc.status !== "recusado" && (
                              <DropdownMenuItem onClick={() => statusMut.mutate({ id: orc.id, status: "recusado" })}>
                                <XCircle className="h-3.5 w-3.5 mr-2 text-red-600" /> Marcar Recusado
                              </DropdownMenuItem>
                            )}
                            {orc.status !== "finalizado" && (
                              <DropdownMenuItem onClick={() => statusMut.mutate({ id: orc.id, status: "finalizado" })}>
                                <Clock className="h-3.5 w-3.5 mr-2" /> Finalizar
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
                            <DropdownMenuItem className="text-destructive" onClick={() => setDeleteTarget(orc)}>
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
      {financeiroModal && (
        <MovimentacaoModal
          open={!!financeiroModal}
          onClose={() => setFinanceiroModal(null)}
          defaultTipo="entrada"
          defaultOrcamentoId={financeiroModal.id}
          defaultDescricao={`Proposta ${financeiroModal.numero_orcamento ?? ""} — ${financeiroModal.cliente_nome ?? ""}`}
          defaultValor={Number(financeiroModal.total)}
        />
      )}
    </div>
  );
}
