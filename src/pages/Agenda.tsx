import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchServicos, createServico, updateServico, deleteServico, type Servico,
} from "@/lib/agendaQueries";
import { fetchClientes } from "@/lib/clientesQueries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  CalendarDays, Plus, Search, Pencil, Trash2, CheckCircle2, XCircle,
  Loader2, RefreshCw, Clock,
} from "lucide-react";
import { PremiumHeader } from "@/components/premium";
import { toast } from "sonner";

const TIPO_OPTIONS = ["visita comercial", "retorno", "entrega", "demonstração", "outro"];

const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  agendado:  { label: "Agendado",  cls: "bg-amber-500/10 text-amber-700 border-amber-500/25" },
  concluido: { label: "Concluído", cls: "bg-primary/8 text-primary border-primary/25" },
  cancelado: { label: "Cancelado", cls: "bg-muted/50 text-muted-foreground border-border/50" },
};

const defaultForm = {
  cliente_id: "", titulo: "", tipo: "visita comercial",
  data: "", hora: "", cidade: "", observacoes: "", status: "agendado",
};

const fmtDate = (d: string) => {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
};

const todayStr = () => new Date().toISOString().slice(0, 10);
const weekStr  = () => {
  const d = new Date(); d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
};
const monthStr = () => {
  const d = new Date();
  d.setMonth(d.getMonth() + 1, 0); // último dia do mês atual
  return d.toISOString().slice(0, 10);
};

export default function Agenda() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Servico | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Servico | null>(null);
  const [form, setForm] = useState(defaultForm);

  const { data: servicos = [], isLoading } = useQuery({
    queryKey: ["servicos"],
    queryFn: fetchServicos,
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ["clientes"],
    queryFn: fetchClientes,
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const today = todayStr();
    const week  = weekStr();
    const month = monthStr();
    return servicos.filter((s) => {
      if (q &&
        !s.titulo.toLowerCase().includes(q) &&
        !(s.clientes?.nome ?? "").toLowerCase().includes(q) &&
        !(s.cidade ?? "").toLowerCase().includes(q)) return false;
      if (filterStatus !== "all" && s.status !== filterStatus) return false;
      if (filterPeriod === "hoje"  && s.data !== today) return false;
      if (filterPeriod === "semana" && (s.data < today || s.data > week)) return false;
      if (filterPeriod === "mes"   && (s.data < today || s.data > month)) return false;
      return true;
    });
  }, [servicos, search, filterStatus, filterPeriod]);

  function openNew() {
    setEditing(null);
    setForm({ ...defaultForm, data: todayStr() });
    setSheetOpen(true);
  }

  function openEdit(s: Servico) {
    setEditing(s);
    setForm({
      cliente_id: s.cliente_id ?? "",
      titulo: s.titulo,
      tipo: s.tipo,
      data: s.data,
      hora: s.hora?.slice(0, 5) ?? "",
      cidade: s.cidade ?? "",
      observacoes: s.observacoes ?? "",
      status: s.status,
    });
    setSheetOpen(true);
  }

  function closeSheet() { setSheetOpen(false); setEditing(null); setForm(defaultForm); }

  const saveMut = useMutation({
    mutationFn: async () => {
      if (!form.titulo.trim()) throw new Error("Título obrigatório");
      if (!form.data) throw new Error("Data obrigatória");
      const payload = {
        cliente_id: form.cliente_id || null,
        titulo: form.titulo.trim(),
        tipo: form.tipo,
        data: form.data,
        hora: form.hora || null,
        cidade: form.cidade || null,
        observacoes: form.observacoes || null,
        status: form.status,
      };
      return editing ? updateServico(editing.id, payload) : createServico(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["servicos"] });
      toast.success(editing ? "Compromisso atualizado" : "Compromisso criado");
      closeSheet();
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro ao salvar"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteServico(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["servicos"] });
      toast.success("Compromisso excluído");
      setDeleteTarget(null);
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro ao excluir"),
  });

  const statusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateServico(id, { status }),
    onSuccess: (_, { status }) => {
      qc.invalidateQueries({ queryKey: ["servicos"] });
      const label = STATUS_CFG[status]?.label ?? status;
      toast.success(`Marcado como ${label}`);
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro ao atualizar status"),
  });

  const agendados  = servicos.filter((s) => s.status === "agendado").length;
  const concluidos = servicos.filter((s) => s.status === "concluido").length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PremiumHeader
        icon={CalendarDays}
        badge="Módulo Comercial"
        title="Agenda Comercial"
        subtitle={isLoading ? "Carregando..." : `${agendados} agendado(s) · ${concluidos} concluído(s) · visitas e atendimentos de campo`}
        action={
          <Button onClick={openNew} className="shrink-0 bg-accent hover:bg-accent/90 text-accent-foreground">
            <Plus className="h-4 w-4 mr-1.5" />
            Novo Compromisso
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar por título, cliente ou cidade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterPeriod} onValueChange={setFilterPeriod}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="hoje">Hoje</SelectItem>
            <SelectItem value="semana">Próximos 7 dias</SelectItem>
            <SelectItem value="mes">Este mês</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="agendado">Agendados</SelectItem>
            <SelectItem value="concluido">Concluídos</SelectItem>
            <SelectItem value="cancelado">Cancelados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border/40 bg-card/70 backdrop-blur-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-border/30 hover:bg-transparent">
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground w-[100px]">Data</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground w-[80px] hidden sm:table-cell">Hora</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Título / Cliente</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground hidden md:table-cell">Tipo</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-center">Status</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-border/20">
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20 mx-auto rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-7 w-28 ml-auto rounded-lg" /></TableCell>
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-52 text-center">
                  {servicos.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 text-muted-foreground py-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/40">
                        <CalendarDays className="h-7 w-7" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground">Nenhuma visita agendada.</p>
                        <p className="text-xs mt-0.5">Organize seus próximos atendimentos no campo.</p>
                      </div>
                      <Button size="sm" onClick={openNew}>
                        <Plus className="h-3.5 w-3.5 mr-1" />Novo Compromisso
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground py-6">
                      <Search className="h-8 w-8 opacity-25" />
                      <p className="text-sm">Nenhum resultado para os filtros aplicados</p>
                      <Button size="sm" variant="ghost"
                        onClick={() => { setSearch(""); setFilterStatus("all"); setFilterPeriod("all"); }}>
                        Limpar filtros
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((s) => {
                const cfg = STATUS_CFG[s.status] ?? STATUS_CFG.agendado;
                return (
                  <TableRow key={s.id} className="border-border/20 hover:bg-muted/20 transition-colors">
                    <TableCell>
                      <span className="text-sm font-medium tabular-nums">{fmtDate(s.data)}</span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {s.hora ? (
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />{s.hora.slice(0, 5)}
                        </span>
                      ) : <span className="text-xs text-muted-foreground/40">—</span>}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-sm text-foreground">{s.titulo}</p>
                      {s.clientes && (
                        <p className="text-xs text-muted-foreground mt-0.5">{s.clientes.nome}</p>
                      )}
                      {s.cidade && !s.clientes && (
                        <p className="text-xs text-muted-foreground mt-0.5">{s.cidade}</p>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-sm text-muted-foreground capitalize">{s.tipo}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={`text-xs ${cfg.cls}`}>
                        {cfg.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {s.status === "agendado" && (
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-primary/70 hover:text-primary"
                            title="Marcar como concluído"
                            disabled={statusMut.isPending}
                            onClick={() => statusMut.mutate({ id: s.id, status: "concluido" })}>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {(s.status === "agendado" || s.status === "concluido") && (
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground/70 hover:text-muted-foreground"
                            title="Cancelar"
                            disabled={statusMut.isPending}
                            onClick={() => statusMut.mutate({ id: s.id, status: "cancelado" })}>
                            <XCircle className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {s.status === "cancelado" && (
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground/70 hover:text-muted-foreground"
                            title="Reabrir"
                            disabled={statusMut.isPending}
                            onClick={() => statusMut.mutate({ id: s.id, status: "agendado" })}>
                            <RefreshCw className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button size="icon" variant="ghost" className="h-7 w-7" title="Editar"
                          onClick={() => openEdit(s)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost"
                          className="h-7 w-7 text-destructive/60 hover:text-destructive hover:bg-destructive/10"
                          title="Excluir" onClick={() => setDeleteTarget(s)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {!isLoading && filtered.length > 0 && (
        <p className="text-xs text-muted-foreground/50 text-center pb-2">
          {filtered.length} de {servicos.length} compromisso(s)
          {(search || filterStatus !== "all" || filterPeriod !== "all") ? " (filtrado)" : ""}
        </p>
      )}

      {/* Form Sheet */}
      <Sheet open={sheetOpen} onOpenChange={(o) => { if (!o) closeSheet(); }}>
        <SheetContent className="w-full sm:max-w-md flex flex-col gap-0 overflow-y-auto">
          <SheetHeader className="pb-4">
            <SheetTitle>{editing ? "Editar Compromisso" : "Novo Compromisso"}</SheetTitle>
          </SheetHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveMut.mutate(); }}
            className="flex flex-col gap-4 flex-1">
            <div className="space-y-1.5">
              <Label>Título *</Label>
              <Input placeholder="Ex: Visita ao cliente Silva"
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                required />
            </div>
            <div className="space-y-1.5">
              <Label>Cliente</Label>
              <Select
                value={form.cliente_id || "__none__"}
                onValueChange={(v) => setForm({ ...form, cliente_id: v === "__none__" ? "" : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar cliente (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Nenhum</SelectItem>
                  {clientes.filter((c) => c.status === "ativo").map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIPO_OPTIONS.map((t) => (
                    <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Data *</Label>
                <Input type="date" value={form.data}
                  onChange={(e) => setForm({ ...form, data: e.target.value })}
                  required />
              </div>
              <div className="space-y-1.5">
                <Label>Horário</Label>
                <Input type="time" value={form.hora}
                  onChange={(e) => setForm({ ...form, hora: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Cidade</Label>
              <Input placeholder="Ex: Cascavel"
                value={form.cidade}
                onChange={(e) => setForm({ ...form, cidade: e.target.value })} />
            </div>
            {editing && (
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agendado">Agendado</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Observações</Label>
              <Textarea rows={3} placeholder="Notas sobre o compromisso"
                value={form.observacoes}
                onChange={(e) => setForm({ ...form, observacoes: e.target.value })} />
            </div>
            <div className="flex gap-2 pt-2 mt-auto">
              <Button type="button" variant="outline" className="flex-1" onClick={closeSheet}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={saveMut.isPending}>
                {saveMut.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                Salvar
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir compromisso?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>"{deleteTarget?.titulo}"</strong> será excluído permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTarget && deleteMut.mutate(deleteTarget.id)}
              disabled={deleteMut.isPending}>
              {deleteMut.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
