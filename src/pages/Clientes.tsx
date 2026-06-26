import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchClientes, createCliente, updateCliente, deleteCliente,
  type Cliente,
} from "@/lib/clientesQueries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
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
  Plus, Search, Pencil, Trash2, Users, MapPin, Phone,
  Loader2, CheckCircle2, XCircle, UserCheck,
} from "lucide-react";
import { PremiumHeader } from "@/components/premium";
import { toast } from "sonner";

const defaultForm = {
  nome: "", telefone: "", endereco: "", cidade: "", observacoes: "", ativo: true,
};

export default function Clientes() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterCidade, setFilterCidade] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Cliente | null>(null);
  const [form, setForm] = useState(defaultForm);

  const { data: clientes = [], isLoading } = useQuery({
    queryKey: ["clientes"],
    queryFn: fetchClientes,
  });

  const cidades = useMemo(
    () => [...new Set(clientes.map((c) => c.cidade).filter(Boolean) as string[])].sort(),
    [clientes],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return clientes.filter((c) => {
      if (q && !c.nome.toLowerCase().includes(q) && !(c.cidade ?? "").toLowerCase().includes(q) && !(c.telefone ?? "").includes(q)) return false;
      if (filterCidade !== "all" && c.cidade !== filterCidade) return false;
      if (filterStatus === "ativo" && c.status !== "ativo") return false;
      if (filterStatus === "inativo" && c.status !== "inativo") return false;
      return true;
    });
  }, [clientes, search, filterCidade, filterStatus]);

  function openNew() {
    setEditing(null);
    setForm(defaultForm);
    setSheetOpen(true);
  }

  function openEdit(c: Cliente) {
    setEditing(c);
    setForm({
      nome: c.nome,
      telefone: c.telefone ?? "",
      endereco: c.endereco ?? "",
      cidade: c.cidade ?? "",
      observacoes: c.observacoes ?? "",
      ativo: c.status === "ativo",
    });
    setSheetOpen(true);
  }

  function closeSheet() {
    setSheetOpen(false);
    setEditing(null);
    setForm(defaultForm);
  }

  const saveMut = useMutation({
    mutationFn: async () => {
      const payload = {
        nome: form.nome.trim(),
        telefone: form.telefone || null,
        endereco: form.endereco || null,
        cidade: form.cidade || null,
        observacoes: form.observacoes || null,
        status: form.ativo ? "ativo" : "inativo",
      };
      if (!payload.nome) throw new Error("Nome obrigatório");
      return editing
        ? updateCliente(editing.id, payload)
        : createCliente(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clientes"] });
      toast.success(editing ? "Cliente atualizado" : "Cliente cadastrado");
      closeSheet();
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro ao salvar"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteCliente(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clientes"] });
      toast.success("Cliente excluído");
      setDeleteTarget(null);
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro ao excluir"),
  });

  const ativos = clientes.filter((c) => c.status === "ativo").length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PremiumHeader
        icon={UserCheck}
        badge="Módulo Comercial"
        title="Clientes"
        subtitle={isLoading ? "Carregando..." : clientes.length > 0 ? `${clientes.length} cadastrado(s) · ${ativos} ativo(s) · ${cidades.length} cidade(s)` : "Cadastre sua base de clientes e produtores"}
        action={
          <Button onClick={openNew} className="shrink-0 bg-accent hover:bg-accent/90 text-accent-foreground">
            <Plus className="h-4 w-4 mr-1.5" />
            Novo Cliente
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar por nome, cidade ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterCidade} onValueChange={setFilterCidade}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Cidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as cidades</SelectItem>
            {cidades.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="ativo">Ativos</SelectItem>
            <SelectItem value="inativo">Inativos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border/40 bg-card/70 backdrop-blur-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-border/30 hover:bg-transparent">
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground w-[35%]">Nome</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Telefone</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground hidden md:table-cell">Cidade</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-center">Status</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-border/20">
                  <TableCell><Skeleton className="h-4 w-3/4" /></TableCell>
                  <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-14 mx-auto rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-7 w-20 ml-auto rounded-lg" /></TableCell>
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-52 text-center">
                  {clientes.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 text-muted-foreground py-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/40">
                        <Users className="h-7 w-7" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground">Nenhum cliente cadastrado ainda.</p>
                        <p className="text-xs mt-0.5">Comece pela primeira propriedade.</p>
                      </div>
                      <Button size="sm" onClick={openNew}>
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Novo Cliente
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground py-6">
                      <Search className="h-8 w-8 opacity-25" />
                      <p className="text-sm">Nenhum cliente para os filtros aplicados</p>
                      <Button size="sm" variant="ghost" onClick={() => { setSearch(""); setFilterCidade("all"); setFilterStatus("all"); }}>
                        Limpar filtros
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((c) => (
                <TableRow key={c.id} className="border-border/20 hover:bg-muted/20 transition-colors">
                  <TableCell>
                    <p className="font-medium text-sm text-foreground">{c.nome}</p>
                    {c.endereco && (
                      <p className="text-xs text-muted-foreground truncate max-w-xs mt-0.5">{c.endereco}</p>
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {c.telefone ? (
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3 shrink-0" />
                        {c.telefone}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground/40">—</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {c.cidade ? (
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {c.cidade}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground/40">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className={c.status === "ativo"
                        ? "bg-primary/8 text-primary border-primary/25 text-xs gap-1"
                        : "bg-muted/50 text-muted-foreground border-border/50 text-xs gap-1"
                      }
                    >
                      {c.status === "ativo"
                        ? <><CheckCircle2 className="h-3 w-3" />Ativo</>
                        : <><XCircle className="h-3 w-3" />Inativo</>
                      }
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" title="Editar" onClick={() => openEdit(c)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon" variant="ghost"
                        className="h-7 w-7 text-destructive/60 hover:text-destructive hover:bg-destructive/10"
                        title="Excluir"
                        onClick={() => setDeleteTarget(c)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!isLoading && filtered.length > 0 && (
        <p className="text-xs text-muted-foreground/50 text-center pb-2">
          {filtered.length} de {clientes.length} cliente(s)
          {(search || filterCidade !== "all" || filterStatus !== "all") ? " (filtrado)" : ""}
        </p>
      )}

      {/* Add / Edit Sheet */}
      <Sheet open={sheetOpen} onOpenChange={(o) => { if (!o) closeSheet(); }}>
        <SheetContent className="w-full sm:max-w-md flex flex-col gap-0 overflow-y-auto">
          <SheetHeader className="pb-4">
            <SheetTitle>{editing ? "Editar Cliente" : "Novo Cliente"}</SheetTitle>
          </SheetHeader>
          <form
            onSubmit={(e) => { e.preventDefault(); saveMut.mutate(); }}
            className="flex flex-col gap-4 flex-1"
          >
            <div className="space-y-1.5">
              <Label>Nome *</Label>
              <Input
                placeholder="Nome do cliente"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Telefone</Label>
              <Input
                placeholder="(00) 00000-0000"
                value={form.telefone}
                onChange={(e) => setForm({ ...form, telefone: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Cidade</Label>
                <Input
                  placeholder="Ex: Cascavel"
                  value={form.cidade}
                  onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                  list="cidade-list"
                />
                <datalist id="cidade-list">
                  {cidades.map((c) => <option key={c} value={c} />)}
                </datalist>
              </div>
              <div className="space-y-1.5">
                <Label>Endereço</Label>
                <Input
                  placeholder="Rua, número"
                  value={form.endereco}
                  onChange={(e) => setForm({ ...form, endereco: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Observações</Label>
              <Textarea
                rows={3}
                placeholder="Notas internas sobre o cliente"
                value={form.observacoes}
                onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/20 px-3 py-2.5">
              <div>
                <p className="text-sm font-medium">Cliente ativo</p>
                <p className="text-[11px] text-muted-foreground">Inativos ficam ocultos por padrão</p>
              </div>
              <Switch
                checked={form.ativo}
                onCheckedChange={(v) => setForm({ ...form, ativo: v })}
              />
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

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>"{deleteTarget?.nome}"</strong> será excluído permanentemente.
              Esta ação não pode ser desfeita.
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
    </div>
  );
}
