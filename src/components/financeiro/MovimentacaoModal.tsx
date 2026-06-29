import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createMovimentacao,
  updateMovimentacao,
  type FinanceiroMovimentacao,
  type MovimentacaoDraft,
  type MovTipo,
  type MovStatus,
} from "@/lib/financeiroQueries";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const CATEGORIAS_ENTRADA = [
  "Venda de produto",
  "Serviço prestado",
  "Proposta aprovada",
  "Comissão",
  "Adiantamento",
  "Outros",
];
const CATEGORIAS_SAIDA = [
  "Fornecedor",
  "Despesa operacional",
  "Frete/Logística",
  "Marketing",
  "Salário/Comissão",
  "Impostos",
  "Outros",
];

interface Props {
  open: boolean;
  onClose: () => void;
  editItem?: FinanceiroMovimentacao | null;
  defaultTipo?: MovTipo;
  defaultOrcamentoId?: string | null;
  defaultDescricao?: string;
  defaultValor?: number;
}

export function MovimentacaoModal({
  open,
  onClose,
  editItem,
  defaultTipo = "entrada",
  defaultOrcamentoId,
  defaultDescricao,
  defaultValor,
}: Props) {
  const qc = useQueryClient();
  const isEdit = !!editItem;

  const [tipo, setTipo] = useState<MovTipo>(defaultTipo);
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("");
  const [valor, setValor] = useState("");
  const [dataVencimento, setDataVencimento] = useState("");
  const [dataPagamento, setDataPagamento] = useState("");
  const [status, setStatus] = useState<MovStatus>("pendente");
  const [formaPagamento, setFormaPagamento] = useState("");
  const [observacoes, setObservacoes] = useState("");

  useEffect(() => {
    if (editItem) {
      setTipo(editItem.tipo);
      setDescricao(editItem.descricao);
      setCategoria(editItem.categoria ?? "");
      setValor(String(editItem.valor));
      setDataVencimento(editItem.data_vencimento ?? "");
      setDataPagamento(editItem.data_pagamento ?? "");
      setStatus(editItem.status);
      setFormaPagamento(editItem.forma_pagamento ?? "");
      setObservacoes(editItem.observacoes ?? "");
    } else {
      setTipo(defaultTipo);
      setDescricao(defaultDescricao ?? "");
      setCategoria("");
      setValor(defaultValor ? String(defaultValor) : "");
      setDataVencimento(new Date().toISOString().slice(0, 10));
      setDataPagamento("");
      setStatus("pendente");
      setFormaPagamento("");
      setObservacoes("");
    }
  }, [editItem, open, defaultTipo, defaultDescricao, defaultValor]);

  const mut = useMutation({
    mutationFn: async () => {
      if (!descricao.trim()) throw new Error("Informe a descrição");
      const v = parseFloat(valor.replace(",", "."));
      if (isNaN(v) || v <= 0) throw new Error("Informe um valor válido");
      const draft: MovimentacaoDraft = {
        tipo,
        descricao: descricao.trim(),
        categoria: categoria || null,
        valor: v,
        data_vencimento: dataVencimento || null,
        data_pagamento: dataPagamento || null,
        status,
        forma_pagamento: formaPagamento || null,
        observacoes: observacoes || null,
        orcamento_id: editItem?.orcamento_id ?? defaultOrcamentoId ?? null,
        cliente_id: editItem?.cliente_id ?? null,
      };
      if (isEdit) await updateMovimentacao(editItem!.id, draft);
      else await createMovimentacao(draft);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["financeiro-movimentacoes"] });
      qc.invalidateQueries({ queryKey: ["financeiro-real-metrics"] });
      qc.invalidateQueries({ queryKey: ["financeiro-chart"] });
      toast.success(isEdit ? "Movimentação atualizada" : "Movimentação criada");
      onClose();
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro ao salvar"),
  });

  const categorias =
    tipo === "entrada" ? CATEGORIAS_ENTRADA : CATEGORIAS_SAIDA;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar Movimentação" : "Nova Movimentação"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {/* Tipo */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTipo("entrada")}
              className={`rounded-xl border py-2.5 text-sm font-semibold transition-colors ${
                tipo === "entrada"
                  ? "bg-green-500/15 border-green-500/40 text-green-700 dark:text-green-400"
                  : "border-border/60 text-muted-foreground hover:bg-muted/40"
              }`}
            >
              + Entrada
            </button>
            <button
              type="button"
              onClick={() => setTipo("saida")}
              className={`rounded-xl border py-2.5 text-sm font-semibold transition-colors ${
                tipo === "saida"
                  ? "bg-red-500/15 border-red-500/40 text-red-700 dark:text-red-400"
                  : "border-border/60 text-muted-foreground hover:bg-muted/40"
              }`}
            >
              − Saída
            </button>
          </div>

          <div className="space-y-1.5">
            <Label>Descrição *</Label>
            <Input
              placeholder="Ex: Venda Embio 3000 — Cliente X"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Valor (R$) *</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Categoria</Label>
              <Select value={categoria} onValueChange={setCategoria}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar..." />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Data de vencimento</Label>
              <Input
                type="date"
                value={dataVencimento}
                onChange={(e) => setDataVencimento(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Data de pagamento</Label>
              <Input
                type="date"
                value={dataPagamento}
                onChange={(e) => setDataPagamento(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as MovStatus)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="vencido">Vencido</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Forma de pagamento</Label>
              <Select value={formaPagamento} onValueChange={setFormaPagamento}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar..." />
                </SelectTrigger>
                <SelectContent>
                  {["Pix", "Boleto", "Cartão", "Dinheiro", "Transferência", "Cheque"].map(
                    (f) => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Observações</Label>
            <Textarea
              placeholder="Notas adicionais..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={() => mut.mutate()} disabled={mut.isPending}>
            {mut.isPending && (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            )}
            {isEdit ? "Salvar" : "Criar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
