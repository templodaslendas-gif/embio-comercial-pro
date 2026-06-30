import { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchCatalogo, type CatalogoItem } from "@/lib/orcamentoQueries";
import { fetchClientes, createCliente } from "@/lib/clientesQueries";
import {
  createOrcamento, updateOrcamento, fetchOrcamentoById,
  type OrcamentoItemDraft,
} from "@/lib/orcamentosComercialQueries";
import { generateOrcamentoPdfComercial } from "@/lib/orcamentoPdfComercial";
import { useBranding } from "@/hooks/useBranding";
import { PremiumHeader } from "@/components/premium";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { FileText, Plus, Trash2, FileDown, Save, Search, Loader2 } from "lucide-react";

interface ItemLine {
  tempId: string;
  catalogoItemId?: string;
  nomeItem: string;
  descricao?: string;
  unidade?: string;
  quantidade: number;
  valorUnitario: number;
}

const sub = (i: ItemLine) => i.quantidade * i.valorUnitario;
const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function NovoOrcamentoComercial() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { branding } = useBranding();

  const [clienteId, setClienteId] = useState<string | null>(null);
  const [clienteNome, setClienteNome] = useState("");
  const [itens, setItens] = useState<ItemLine[]>([]);
  const [formaPagamento, setFormaPagamento] = useState("");
  const [validadeDias, setValidadeDias] = useState(30);
  const [observacoes, setObservacoes] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");
  const [loaded, setLoaded] = useState(!isEdit);
  const [novoClienteOpen, setNovoClienteOpen] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novoTelefone, setNovoTelefone] = useState("");
  const [novoCidade, setNovoCidade] = useState("");

  const { data: clientes = [] } = useQuery({ queryKey: ["clientes"], queryFn: fetchClientes });
  const { data: catalogo = [] } = useQuery({ queryKey: ["catalogo"], queryFn: fetchCatalogo });

  const { data: existingOrc } = useQuery({
    queryKey: ["orcamento", id],
    queryFn: () => fetchOrcamentoById(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existingOrc && !loaded) {
      setClienteId(existingOrc.cliente_id);
      setClienteNome(existingOrc.cliente_nome ?? "");
      setFormaPagamento(existingOrc.forma_pagamento ?? "");
      setValidadeDias(existingOrc.validade_dias);
      setObservacoes(existingOrc.observacoes ?? "");
      setItens(
        existingOrc.itens.map((it) => ({
          tempId: crypto.randomUUID(),
          catalogoItemId: it.catalogo_item_id ?? undefined,
          nomeItem: it.nome_item,
          descricao: it.descricao ?? undefined,
          unidade: it.unidade ?? undefined,
          quantidade: Number(it.quantidade),
          valorUnitario: Number(it.valor_unitario),
        })),
      );
      setLoaded(true);
    }
  }, [existingOrc, loaded]);

  const totalGeral = useMemo(() => itens.reduce((s, i) => s + sub(i), 0), [itens]);

  const catalogoAtivo = useMemo(() => {
    const q = pickerSearch.toLowerCase();
    return catalogo.filter(
      (c) =>
        c.ativo &&
        (!q ||
          c.nome_item.toLowerCase().includes(q) ||
          (c.categoria ?? "").toLowerCase().includes(q)),
    );
  }, [catalogo, pickerSearch]);

  const addFromCatalog = (cat: CatalogoItem) => {
    setItens((prev) => [
      ...prev,
      {
        tempId: crypto.randomUUID(),
        catalogoItemId: cat.id,
        nomeItem: cat.nome_item,
        descricao: cat.descricao ?? undefined,
        unidade: cat.unidade ?? undefined,
        quantidade: 1,
        valorUnitario: Number(cat.valor_unitario),
      },
    ]);
    setPickerOpen(false);
    setPickerSearch("");
  };

  const updateItem = (tempId: string, field: keyof ItemLine, value: string | number) => {
    setItens((prev) => prev.map((i) => (i.tempId === tempId ? { ...i, [field]: value } : i)));
  };

  const removeItem = (tempId: string) =>
    setItens((prev) => prev.filter((i) => i.tempId !== tempId));

  const buildDraft = () => ({
    cliente_id: clienteId,
    cliente_nome: clienteNome.trim() || null,
    validade_dias: validadeDias,
    forma_pagamento: formaPagamento.trim() || null,
    observacoes: observacoes.trim() || null,
  });

  const buildItens = (): OrcamentoItemDraft[] =>
    itens.map((i, idx) => ({
      catalogo_item_id: i.catalogoItemId ?? null,
      nome_item: i.nomeItem,
      descricao: i.descricao ?? null,
      unidade: i.unidade ?? null,
      quantidade: i.quantidade,
      valor_unitario: i.valorUnitario,
      ordem: idx,
    }));

  const createClienteMut = useMutation({
    mutationFn: () => {
      if (!novoNome.trim()) throw new Error("Informe o nome do cliente");
      return createCliente({
        nome: novoNome.trim(),
        telefone: novoTelefone.trim() || null,
        cidade: novoCidade.trim() || null,
      });
    },
    onSuccess: (cl) => {
      qc.invalidateQueries({ queryKey: ["clientes"] });
      setClienteId(cl.id);
      setClienteNome(cl.nome);
      setNovoClienteOpen(false);
      setNovoNome(""); setNovoTelefone(""); setNovoCidade("");
      toast.success("Cliente cadastrado");
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro ao cadastrar cliente"),
  });

  const saveMut = useMutation({
    mutationFn: async () => {
      if (!clienteNome.trim() && !clienteId) throw new Error("Informe o nome do cliente");
      if (itens.length === 0) throw new Error("Adicione ao menos um item");
      if (isEdit) {
        await updateOrcamento(id!, buildDraft(), buildItens());
      } else {
        await createOrcamento(buildDraft(), buildItens());
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orcamentos"] });
      toast.success(isEdit ? "Proposta atualizada" : "Proposta criada");
      navigate("/orcamentos");
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro ao salvar"),
  });

  const handlePdf = async () => {
    if (itens.length === 0) {
      toast.error("Adicione itens antes de gerar o PDF");
      return;
    }
    try {
      const mockOrc: any = {
        id: id ?? "preview",
        numero_orcamento: isEdit ? existingOrc?.numero_orcamento : "PRÉVIA",
        cliente_nome: clienteNome || "—",
        status: "em_aberto",
        validade_dias: validadeDias,
        forma_pagamento: formaPagamento || null,
        observacoes: observacoes || null,
        total: totalGeral,
        created_at: new Date().toISOString(),
      };
      const mockItens: any[] = itens.map((i, idx) => ({
        id: i.tempId,
        orcamento_id: "",
        catalogo_item_id: null,
        nome_item: i.nomeItem,
        descricao: i.descricao ?? null,
        unidade: i.unidade ?? null,
        quantidade: i.quantidade,
        valor_unitario: i.valorUnitario,
        subtotal: sub(i),
        ordem: idx,
      }));
      const doc = await generateOrcamentoPdfComercial(mockOrc, mockItens, branding);
      const safe = (clienteNome.trim() || "proposta").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
      doc.save(`proposta-${safe}.pdf`);
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao gerar PDF");
    }
  };

  if (!loaded) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 p-4">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PremiumHeader
        icon={FileText}
        badge="Propostas Comerciais"
        title={isEdit ? "Editar Proposta" : "Nova Proposta"}
        subtitle="Selecione itens do catálogo e gere uma proposta profissional"
        variant="gradient"
      />

      {/* Cliente */}
      <Card>
        <CardHeader><CardTitle className="text-base">Dados do Cliente</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Cliente cadastrado</Label>
            <div className="flex gap-2">
              <Select
                value={clienteId ?? "__none__"}
                onValueChange={(v) => {
                  if (v === "__none__") { setClienteId(null); return; }
                  const cl = (clientes as any[]).find((c) => c.id === v);
                  setClienteId(v);
                  if (cl) setClienteNome(cl.nome);
                }}
              >
                <SelectTrigger className="flex-1"><SelectValue placeholder="Selecionar cliente..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Nenhum —</SelectItem>
                  {(clientes as any[]).map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                size="icon"
                variant="outline"
                title="Novo cliente"
                onClick={() => setNovoClienteOpen(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Nome do cliente *</Label>
            <Input
              placeholder="Nome ou razão social"
              value={clienteNome}
              onChange={(e) => setClienteNome(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Itens */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Itens da Proposta</CardTitle>
          <Button size="sm" onClick={() => setPickerOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Adicionar Item
          </Button>
        </CardHeader>
        <CardContent>
          {itens.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-2 opacity-25" />
              <p className="text-sm">Nenhum item adicionado</p>
              <Button size="sm" variant="outline" className="mt-3" onClick={() => setPickerOpen(true)}>
                <Plus className="h-4 w-4 mr-1" /> Adicionar do catálogo
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs w-[35%]">Descrição</TableHead>
                    <TableHead className="text-xs">Unid.</TableHead>
                    <TableHead className="text-xs">Qtd</TableHead>
                    <TableHead className="text-xs">Valor Unit. (R$)</TableHead>
                    <TableHead className="text-xs text-right">Subtotal</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itens.map((item) => (
                    <TableRow key={item.tempId}>
                      <TableCell className="font-medium text-sm">{item.nomeItem}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{item.unidade || "—"}</TableCell>
                      <TableCell>
                        <Input
                          type="number" min="0.001" step="0.001"
                          value={item.quantidade}
                          onChange={(e) =>
                            updateItem(item.tempId, "quantidade", Math.max(0, parseFloat(e.target.value) || 0))
                          }
                          className="h-8 w-20 text-sm"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number" min="0" step="0.01"
                          value={item.valorUnitario}
                          onChange={(e) =>
                            updateItem(item.tempId, "valorUnitario", Math.max(0, parseFloat(e.target.value) || 0))
                          }
                          className="h-8 w-28 text-sm"
                        />
                      </TableCell>
                      <TableCell className="text-right font-bold text-sm tabular-nums">
                        {brl(sub(item))}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="icon" variant="ghost"
                          className="h-7 w-7 text-destructive/60 hover:text-destructive"
                          onClick={() => removeItem(item.tempId)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-end mt-4 pr-10">
                <div className="bg-primary text-primary-foreground rounded-xl px-5 py-2.5 font-bold text-base tabular-nums">
                  Total: {brl(totalGeral)}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Condições */}
      <Card>
        <CardHeader><CardTitle className="text-base">Condições Comerciais</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Forma de pagamento</Label>
            <Textarea
              placeholder="Ex: 50% na aprovação, 50% na entrega"
              value={formaPagamento}
              onChange={(e) => setFormaPagamento(e.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Validade (dias)</Label>
            <Input
              type="number" min="1"
              value={validadeDias}
              onChange={(e) => setValidadeDias(Math.max(1, parseInt(e.target.value) || 30))}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Observações</Label>
            <Textarea
              placeholder="Condições especiais, informações adicionais..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" className="flex-1 h-11" onClick={() => navigate("/orcamentos")}>
          Cancelar
        </Button>
        <Button variant="outline" className="flex-1 h-11 gap-2" onClick={handlePdf}>
          <FileDown className="h-4 w-4" /> Prévia PDF
        </Button>
        <Button className="flex-1 h-11 gap-2" onClick={() => saveMut.mutate()} disabled={saveMut.isPending}>
          {saveMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isEdit ? "Salvar Alterações" : "Salvar Proposta"}
        </Button>
      </div>

      {/* Modal — Novo Cliente */}
      <Dialog open={novoClienteOpen} onOpenChange={(o) => { if (!o) setNovoClienteOpen(false); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Novo Cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Nome *</Label>
              <Input placeholder="Nome ou razão social" value={novoNome} onChange={(e) => setNovoNome(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Telefone</Label>
              <Input placeholder="(00) 00000-0000" value={novoTelefone} onChange={(e) => setNovoTelefone(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Cidade</Label>
              <Input placeholder="Cidade" value={novoCidade} onChange={(e) => setNovoCidade(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setNovoClienteOpen(false)}>Cancelar</Button>
            <Button onClick={() => createClienteMut.mutate()} disabled={createClienteMut.isPending}>
              {createClienteMut.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Catalog Picker */}
      <Dialog open={pickerOpen} onOpenChange={(o) => { if (!o) { setPickerOpen(false); setPickerSearch(""); } }}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Selecionar Item do Catálogo</DialogTitle>
          </DialogHeader>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar por nome ou categoria..."
              value={pickerSearch}
              onChange={(e) => setPickerSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="overflow-y-auto flex-1">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Nome</TableHead>
                  <TableHead className="text-xs">Categoria</TableHead>
                  <TableHead className="text-xs">Unid.</TableHead>
                  <TableHead className="text-xs text-right">Preço base</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {catalogoAtivo.map((item) => (
                  <TableRow
                    key={item.id}
                    className="cursor-pointer hover:bg-muted/40"
                    onClick={() => addFromCatalog(item)}
                  >
                    <TableCell className="font-medium text-sm">{item.nome_item}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{item.categoria || "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{item.unidade || "—"}</TableCell>
                    <TableCell className="text-right text-sm tabular-nums">
                      {Number(item.valor_unitario) > 0 ? brl(Number(item.valor_unitario)) : "—"}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" className="h-7 text-xs pointer-events-none">
                        <Plus className="h-3 w-3 mr-1" /> Usar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {catalogoAtivo.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8 text-sm">
                      Nenhum item encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
