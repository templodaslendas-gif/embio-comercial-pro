import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchCatalogo, createCatalogoItem, updateCatalogoItem, deleteCatalogoItem,
  type CatalogoItem,
} from "@/lib/orcamentoQueries";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Package, Loader2 } from "lucide-react";
import { toast } from "sonner";

// NOTE: requires migration to create table `catalogo_itens` before activating in the menu
type Props = { open: boolean; onOpenChange: (o: boolean) => void };

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function CatalogoDialog({ open, onOpenChange }: Props) {
  const qc = useQueryClient();
  const { data: itens = [], isLoading } = useQuery({
    queryKey: ["catalogo"], queryFn: fetchCatalogo, enabled: open,
  });

  const [editing, setEditing] = useState<CatalogoItem | null>(null);
  const [form, setForm] = useState({
    nome_item: "", descricao: "", categoria: "", unidade: "", valor_unitario: "", observacoes: "",
  });
  const [showForm, setShowForm] = useState(false);

  function resetForm() {
    setForm({ nome_item: "", descricao: "", categoria: "", unidade: "", valor_unitario: "", observacoes: "" });
    setEditing(null);
    setShowForm(false);
  }

  function openNew() { resetForm(); setShowForm(true); }
  function openEdit(it: CatalogoItem) {
    setForm({
      nome_item: it.nome_item,
      descricao: it.descricao ?? "",
      categoria: it.categoria ?? "",
      unidade: it.unidade ?? "",
      valor_unitario: String(it.valor_unitario ?? ""),
      observacoes: it.observacoes ?? "",
    });
    setEditing(it);
    setShowForm(true);
  }

  const saveMut = useMutation({
    mutationFn: async () => {
      const payload = {
        nome_item: form.nome_item.trim(),
        descricao: form.descricao || null,
        categoria: form.categoria || null,
        unidade: form.unidade || null,
        valor_unitario: Number(form.valor_unitario.replace(",", ".")) || 0,
        observacoes: form.observacoes || null,
      };
      if (!payload.nome_item) throw new Error("Nome obrigatório");
      if (editing) return updateCatalogoItem(editing.id, payload);
      return createCatalogoItem(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["catalogo"] });
      toast.success(editing ? "Item atualizado" : "Item criado");
      resetForm();
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro ao salvar"),
  });

  const delMut = useMutation({
    mutationFn: deleteCatalogoItem,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["catalogo"] });
      toast.success("Item excluído");
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro ao excluir"),
  });

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) resetForm(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" /> Catálogo de itens
          </DialogTitle>
        </DialogHeader>

        {showForm ? (
          <form
            onSubmit={(e) => { e.preventDefault(); saveMut.mutate(); }}
            className="space-y-3"
          >
            <div>
              <Label>Nome *</Label>
              <Input value={form.nome_item} onChange={(e) => setForm({ ...form, nome_item: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Categoria</Label>
                <Input value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} />
              </div>
              <div>
                <Label>Unidade</Label>
                <Input placeholder="unid. / m / serviço" value={form.unidade} onChange={(e) => setForm({ ...form, unidade: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Valor unitário *</Label>
              <Input type="number" step="0.01" inputMode="decimal" value={form.valor_unitario}
                onChange={(e) => setForm({ ...form, valor_unitario: e.target.value })} required />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea rows={2} value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea rows={2} value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={resetForm}>Cancelar</Button>
              <Button type="submit" className="flex-1" disabled={saveMut.isPending}>
                {saveMut.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                Salvar
              </Button>
            </div>
          </form>
        ) : (
          <>
            <Button size="sm" onClick={openNew} className="w-full">
              <Plus className="h-4 w-4 mr-1" /> Novo item
            </Button>

            {isLoading ? (
              <p className="text-sm text-muted-foreground text-center py-4">Carregando...</p>
            ) : itens.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Nenhum item cadastrado.
              </p>
            ) : (
              <ul className="space-y-2">
                {itens.map((it) => (
                  <li key={it.id} className="flex items-center gap-2 rounded-lg border border-border bg-card p-2.5">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{it.nome_item}</p>
                      <p className="text-xs text-muted-foreground">
                        {brl(Number(it.valor_unitario))}{it.unidade ? ` / ${it.unidade}` : ""}
                        {it.categoria ? ` · ${it.categoria}` : ""}
                      </p>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => openEdit(it)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost"
                      onClick={() => { if (confirm(`Excluir "${it.nome_item}"?`)) delMut.mutate(it.id); }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
