import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchMovimentacoes,
  deleteMovimentacao,
  marcarComoPago,
  cancelarMovimentacao,
  type FinanceiroMovimentacao,
  type MovTipo,
  type MovStatus,
} from "@/lib/financeiroQueries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  Search,
  DollarSign,
  MoreVertical,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  Plus,
} from "lucide-react";
import { cn, safeMoney } from "@/lib/utils";

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const STATUS_CFG: Record<MovStatus, { label: string; cls: string }> = {
  pendente: {
    label: "Pendente",
    cls: "bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-400",
  },
  pago: {
    label: "Pago",
    cls: "bg-green-500/15 text-green-700 border-green-500/30 dark:text-green-400",
  },
  vencido: {
    label: "Vencido",
    cls: "bg-red-500/15 text-red-700 border-red-500/30 dark:text-red-400",
  },
  cancelado: {
    label: "Cancelado",
    cls: "bg-muted text-muted-foreground border-border/60",
  },
};

interface Props {
  onEdit: (item: FinanceiroMovimentacao) => void;
  onNew: (tipo: MovTipo) => void;
}

export function MovimentacoesTab({ onEdit, onNew }: Props) {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterTipo, setFilterTipo] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterMes, setFilterMes] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<FinanceiroMovimentacao | null>(null);

  const { data: movs = [], isLoading } = useQuery({
    queryKey: ["financeiro-movimentacoes"],
    queryFn: fetchMovimentacoes,
  });

  const availableMonths = useMemo(() => {
    const set = new Map<string, string>();
    movs.forEach((m) => {
      const d = m.data_vencimento ?? m.created_at;
      const key = d.slice(0, 7);
      if (!set.has(key)) {
        set.set(
          key,
          new Date(key + "-01").toLocaleDateString("pt-BR", {
            month: "long",
            year: "numeric",
          }),
        );
      }
    });
    return Array.from(set.entries()).sort(([a], [b]) => b.localeCompare(a));
  }, [movs]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return movs.filter((m) => {
      if (
        q &&
        !m.descricao.toLowerCase().includes(q) &&
        !(m.categoria ?? "").toLowerCase().includes(q)
      )
        return false;
      if (filterTipo !== "all" && m.tipo !== filterTipo) return false;
      if (filterStatus !== "all" && m.status !== filterStatus) return false;
      if (filterMes !== "all") {
        const d = (m.data_vencimento ?? m.created_at).slice(0, 7);
        if (d !== filterMes) return false;
      }
      return true;
    });
  }, [movs, search, filterTipo, filterStatus, filterMes]);

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteMovimentacao(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["financeiro-movimentacoes"] });
      qc.invalidateQueries({ queryKey: ["financeiro-real-metrics"] });
      qc.invalidateQueries({ queryKey: ["financeiro-chart"] });
      toast.success("Excluído");
      setDeleteTarget(null);
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro"),
  });

  const pagarMut = useMutation({
    mutationFn: (id: string) =>
      marcarComoPago(id, new Date().toISOString().slice(0, 10)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["financeiro-movimentacoes"] });
      qc.invalidateQueries({ queryKey: ["financeiro-real-metrics"] });
      toast.success("Marcado como pago");
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro"),
  });

  const cancelarMut = useMutation({
    mutationFn: (id: string) => cancelarMovimentacao(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["financeiro-movimentacoes"] });
      qc.invalidateQueries({ queryKey: ["financeiro-real-metrics"] });
      toast.success("Cancelado");
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro"),
  });

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterTipo} onValueChange={setFilterTipo}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="entrada">Entradas</SelectItem>
            <SelectItem value="saida">Saídas</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="pago">Pago</SelectItem>
            <SelectItem value="vencido">Vencido</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterMes} onValueChange={setFilterMes}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Mês" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os meses</SelectItem>
            {availableMonths.map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabela */}
      <div className="rounded-2xl border border-border/40 bg-card/70 backdrop-blur-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/30 hover:bg-transparent">
              <TableHead className="text-xs uppercase text-muted-foreground">Tipo</TableHead>
              <TableHead className="text-xs uppercase text-muted-foreground">Descrição</TableHead>
              <TableHead className="text-xs uppercase text-muted-foreground hidden md:table-cell">Categoria</TableHead>
              <TableHead className="text-xs uppercase text-muted-foreground hidden sm:table-cell">Vencimento</TableHead>
              <TableHead className="text-xs uppercase text-muted-foreground text-right">Valor</TableHead>
              <TableHead className="text-xs uppercase text-muted-foreground text-center hidden md:table-cell">Status</TableHead>
              <TableHead className="text-xs uppercase text-muted-foreground text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-20 mx-auto rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-7 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-14 text-muted-foreground">
                  <DollarSign className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">
                    {movs.length === 0 ? "Nenhuma movimentação registrada" : "Sem resultados"}
                  </p>
                  {movs.length === 0 && (
                    <div className="flex gap-2 justify-center mt-3">
                      <Button size="sm" onClick={() => onNew("entrada")}>
                        <Plus className="h-3.5 w-3.5 mr-1" /> Entrada
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => onNew("saida")}>
                        <Plus className="h-3.5 w-3.5 mr-1" /> Saída
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((m) => {
                const st = STATUS_CFG[m.status];
                const isEntrada = m.tipo === "entrada";
                return (
                  <TableRow
                    key={m.id}
                    className="border-border/20 hover:bg-muted/20 transition-colors"
                  >
                    <TableCell>
                      <span
                        className={cn(
                          "text-xs font-bold",
                          isEntrada
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400",
                        )}
                      >
                        {isEntrada ? "▲ ENT" : "▼ SAÍ"}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium text-sm max-w-[200px] truncate">
                      {m.descricao}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                      {m.categoria || "—"}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      {m.data_vencimento
                        ? new Date(m.data_vencimento + "T00:00:00").toLocaleDateString("pt-BR")
                        : "—"}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-bold tabular-nums text-sm",
                        isEntrada
                          ? "text-green-700 dark:text-green-400"
                          : "text-red-700 dark:text-red-400",
                      )}
                    >
                      {isEntrada ? "+" : "-"}{brl(safeMoney(m.valor))}
                    </TableCell>
                    <TableCell className="text-center hidden md:table-cell">
                      <Badge variant="outline" className={cn("text-xs", st.cls)}>
                        {st.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-7 w-7">
                              <MoreVertical className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(m)}>
                              <Pencil className="h-3.5 w-3.5 mr-2" /> Editar
                            </DropdownMenuItem>
                            {m.status === "pendente" && (
                              <DropdownMenuItem onClick={() => pagarMut.mutate(m.id)}>
                                <CheckCircle2 className="h-3.5 w-3.5 mr-2 text-green-600" />
                                Marcar como Pago
                              </DropdownMenuItem>
                            )}
                            {(m.status === "pendente" || m.status === "vencido") && (
                              <DropdownMenuItem onClick={() => cancelarMut.mutate(m.id)}>
                                <XCircle className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                Cancelar
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeleteTarget(m)}
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

      {/* Delete confirm */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir movimentação?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleteTarget?.descricao}</strong> —{" "}
              {deleteTarget && brl(safeMoney(deleteTarget.valor))} será excluída
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTarget && deleteMut.mutate(deleteTarget.id)}
              disabled={deleteMut.isPending}
            >
              {deleteMut.isPending && (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              )}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
