import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchCatalogo, createCatalogoItem, updateCatalogoItem, deleteCatalogoItem,
  ativarCatalogoItem, desativarCatalogoItem, duplicarCatalogoItem,
  type CatalogoItem,
} from "@/lib/orcamentoQueries";
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
  Plus, Search, Pencil, Trash2, Copy, Tag, Package, LayoutList,
  Loader2, CheckCircle2, XCircle,
} from "lucide-react";
import { PremiumHeader, PremiumStat } from "@/components/premium";
import { toast } from "sonner";

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const defaultForm = {
  nome_item: "", categoria: "", descricao: "", unidade: "",
  valor_unitario: "", ativo: true as boolean,
};

export default function Catalogo() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<CatalogoItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CatalogoItem | null>(null);
  const [form, setForm] = useState(defaultForm);

  const { data: itens = [], isLoading } = useQuery({
    queryKey: ["catalogo"],
    queryFn: fetchCatalogo,
  });

  const categorias = useMemo(
    () => [...new Set(itens.map((i) => i.categoria).filter(Boolean) as string[])].sort(),
    [itens],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return itens.filter((i) => {
      if (q && !i.nome_item.toLowerCase().includes(q) && !(i.categoria ?? "").toLowerCase().includes(q)) return false;
      if (filterCat !== "all" && i.categoria !== filterCat) return false;
      if (filterStatus === "active" && !i.ativo) return false;
      if (filterStatus === "inactive" && i.ativo) return false;
      return true;
    });
  }, [itens, search, filterCat, filterStatus]);

  function openNew() {
    setEditing(null);
    setForm(defaultForm);
    setSheetOpen(true);
  }

  function openEdit(item: CatalogoItem) {
    setEditing(item);
    setForm({
      nome_item: item.nome_item,
      categoria: item.categoria ?? "",
      descricao: item.descricao ?? "",
      unidade: item.unidade ?? "",
      valor_unitario: String(item.valor_unitario),
      ativo: item.ativo,
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
        nome_item: form.nome_item.trim(),
        categoria: form.categoria || null,
        descricao: form.descricao || null,
        unidade: form.unidade || null,
        valor_unitario: Number(form.valor_unitario.replace(",", ".")) || 0,
        ativo: form.ativo,
      };
      if (!payload.nome_item) throw new Error("Nome obrigatório");
      return editing
        ? updateCatalogoItem(editing.id, payload)
        : createCatalogoItem(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["catalogo"] });
      toast.success(editing ? "Item atualizado" : "Item criado");
      closeSheet();
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro ao salvar"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteCatalogoItem(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["catalogo"] });
      toast.success("Item excluído");
      setDeleteTarget(null);
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro ao excluir"),
  });

  const duplicateMut = useMutation({
    mutationFn: (id: string) => duplicarCatalogoItem(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["catalogo"] });
      toast.success("Item duplicado");
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro ao duplicar"),
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, ativo }: { id: string; ativo: boolean }) =>
      ativo ? desativarCatalogoItem(id) : ativarCatalogoItem(id),
    onSuccess: (_, { ativo }) => {
      qc.invalidateQueries({ queryKey: ["catalogo"] });
      toast.success(ativo ? "Item desativado" : "Item ativado");
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro"),
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PremiumHeader
        icon={LayoutList}
        badge="Módulo Comercial"
        title="Catálogo de Itens"
        subtitle={isLoading ? "Carregando..." : itens.length > 0 ? `${itens.length} item(ns) · ${categorias.length} categoria(s) · ${itens.filter((i) => i.ativo).length} ativo(s)` : "Cadastre produtos, aditivos ou serviços"}
        variant="gradient"
        action={
          <Button onClick={openNew} className="shrink-0 bg-white/15 hover:bg-white/25 text-white border border-white/20 font-semibold">
            <Plus className="h-4 w-4 mr-1.5" />
            Novo Item
          </Button>
        }
      />

      {!isLoading && (
        <div className="grid grid-cols-3 gap-3">
          <PremiumStat icon={Package} label="Total de Itens" value={itens.length} variant="blue" />
          <PremiumStat icon={CheckCircle2} label="Itens Ativos" value={itens.filter((i) => i.ativo).length} variant="green" />
          <PremiumStat icon={Tag} label="Categorias" value={categorias.length} variant="default" />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar por nome ou categoria..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterCat} onValueChange={setFilterCat}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categorias.map((c) => (
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
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border/40 bg-card/70 backdrop-blur-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-border/30 hover:bg-transparent">
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground w-[38%]">Nome</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground">Categoria</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Unidade</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-right">Valor</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-center hidden md:table-cell">Status</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-border/20">
                  <TableCell><Skeleton className="h-4 w-3/4" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-14" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-14 mx-auto rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-7 w-28 ml-auto rounded-lg" /></TableCell>
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-52 text-center">
                  {itens.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 text-muted-foreground py-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/40">
                        <Package className="h-7 w-7" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground">Nenhum item no catálogo.</p>
                        <p className="text-xs mt-0.5">Cadastre produtos, aditivos ou serviços.</p>
                      </div>
                      <Button size="sm" onClick={openNew}>
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Novo Item
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground py-6">
                      <Search className="h-8 w-8 opacity-25" />
                      <p className="text-sm">Nenhum item para os filtros aplicados</p>
                      <Button size="sm" variant="ghost" onClick={() => { setSearch(""); setFilterCat("all"); setFilterStatus("all"); }}>
                        Limpar filtros
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => (
                <TableRow key={item.id} className="border-border/20 hover:bg-muted/20 transition-colors group/row">
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm text-foreground">{item.nome_item}</p>
                      {item.descricao && (
                        <p className="text-xs text-muted-foreground truncate max-w-xs mt-0.5">{item.descricao}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.categoria ? (
                      <Badge variant="outline" className="text-xs font-medium gap-1 bg-accent/12 text-accent border-accent/25">
                        <Tag className="h-2.5 w-2.5" />
                        {item.categoria}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground/40">—</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="text-sm text-muted-foreground">{item.unidade || "—"}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-bold text-sm tabular-nums text-foreground">{brl(Number(item.valor_unitario))}</span>
                  </TableCell>
                  <TableCell className="text-center hidden md:table-cell">
                    <Badge
                      variant="outline"
                      className={item.ativo
                        ? "bg-accent/18 text-accent border-accent/35 text-xs gap-1 font-semibold"
                        : "bg-muted/50 text-muted-foreground border-border/50 text-xs gap-1"
                      }
                    >
                      {item.ativo
                        ? <><CheckCircle2 className="h-3 w-3" />Ativo</>
                        : <><XCircle className="h-3 w-3" />Inativo</>
                      }
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" title="Editar" onClick={() => openEdit(item)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon" variant="ghost" className="h-7 w-7"
                        title="Duplicar"
                        onClick={() => duplicateMut.mutate(item.id)}
                        disabled={duplicateMut.isPending}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon" variant="ghost" className="h-7 w-7"
                        title={item.ativo ? "Desativar" : "Ativar"}
                        onClick={() => toggleMut.mutate({ id: item.id, ativo: item.ativo })}
                        disabled={toggleMut.isPending}
                      >
                        {item.ativo
                          ? <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                          : <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                        }
                      </Button>
                      <Button
                        size="icon" variant="ghost"
                        className="h-7 w-7 text-destructive/60 hover:text-destructive hover:bg-destructive/10"
                        title="Excluir"
                        onClick={() => setDeleteTarget(item)}
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
          {filtered.length} de {itens.length} item(s)
          {(search || filterCat !== "all" || filterStatus !== "all") ? " (filtrado)" : ""}
        </p>
      )}

      {/* Add / Edit Sheet */}
      <Sheet open={sheetOpen} onOpenChange={(o) => { if (!o) closeSheet(); }}>
        <SheetContent className="w-full sm:max-w-md flex flex-col gap-0 overflow-y-auto">
          <SheetHeader className="pb-4">
            <SheetTitle>{editing ? "Editar Item" : "Novo Item"}</SheetTitle>
          </SheetHeader>
          <form
            onSubmit={(e) => { e.preventDefault(); saveMut.mutate(); }}
            className="flex flex-col gap-4 flex-1"
          >
            <div className="space-y-1.5">
              <Label>Nome *</Label>
              <Input
                placeholder="Ex: Serviço de instalação"
                value={form.nome_item}
                onChange={(e) => setForm({ ...form, nome_item: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Categoria</Label>
                <Input
                  placeholder="Ex: Serviços"
                  value={form.categoria}
                  onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                  list="cat-list"
                />
                <datalist id="cat-list">
                  {categorias.map((c) => <option key={c} value={c} />)}
                </datalist>
              </div>
              <div className="space-y-1.5">
                <Label>Unidade</Label>
                <Input
                  placeholder="unid. / m / h"
                  value={form.unidade}
                  onChange={(e) => setForm({ ...form, unidade: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Valor unitário (R$) *</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                inputMode="decimal"
                placeholder="0,00"
                value={form.valor_unitario}
                onChange={(e) => setForm({ ...form, valor_unitario: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Descrição</Label>
              <Textarea
                rows={3}
                placeholder="Descrição opcional do item"
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/20 px-3 py-2.5">
              <div>
                <p className="text-sm font-medium">Item ativo</p>
                <p className="text-[11px] text-muted-foreground">Inativos não aparecem nos orçamentos</p>
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
            <AlertDialogTitle>Excluir item?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>"{deleteTarget?.nome_item}"</strong> será excluído permanentemente.
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
