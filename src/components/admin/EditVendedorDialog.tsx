import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { PremiumDialog } from "@/components/premium";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateVendedorProfile, type VendedorOverview } from "@/lib/adminQueries";

interface EditVendedorDialogProps {
  vendedor: VendedorOverview | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function EditVendedorDialog({ vendedor, onOpenChange, onSaved }: EditVendedorDialogProps) {
  const [form, setForm] = useState({ full_name: "", telefone: "", cidade: "", estado: "", foto_url: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (vendedor) {
      setForm({
        full_name: vendedor.full_name || "",
        telefone: vendedor.telefone || "",
        cidade: vendedor.cidade || "",
        estado: vendedor.estado || "",
        foto_url: vendedor.foto_url || "",
      });
    }
  }, [vendedor]);

  const handleSave = async () => {
    if (!vendedor) return;
    setSaving(true);
    try {
      await updateVendedorProfile(vendedor.user_id, {
        full_name: form.full_name.trim() || null,
        telefone: form.telefone.trim() || null,
        cidade: form.cidade.trim() || null,
        estado: form.estado.trim() || null,
        foto_url: form.foto_url.trim() || null,
      });
      toast.success("Dados atualizados.");
      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PremiumDialog
      open={vendedor !== null}
      onOpenChange={onOpenChange}
      title="Editar dados cadastrais"
      description={vendedor?.email || undefined}
      footer={
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Salvar
        </Button>
      }
    >
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="ev-nome">Nome</Label>
          <Input
            id="ev-nome"
            value={form.full_name}
            onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="ev-telefone">Telefone</Label>
            <Input
              id="ev-telefone"
              value={form.telefone}
              onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ev-estado">Estado (UF)</Label>
            <Input
              id="ev-estado"
              maxLength={2}
              value={form.estado}
              onChange={(e) => setForm((f) => ({ ...f, estado: e.target.value.toUpperCase() }))}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ev-cidade">Cidade</Label>
          <Input
            id="ev-cidade"
            value={form.cidade}
            onChange={(e) => setForm((f) => ({ ...f, cidade: e.target.value }))}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ev-foto">URL da foto</Label>
          <Input
            id="ev-foto"
            value={form.foto_url}
            onChange={(e) => setForm((f) => ({ ...f, foto_url: e.target.value }))}
            placeholder="https://..."
          />
        </div>
      </div>
    </PremiumDialog>
  );
}
