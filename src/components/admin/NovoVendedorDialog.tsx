import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { PremiumDialog } from "@/components/premium";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { inviteVendedor } from "@/lib/adminUserActions";

interface NovoVendedorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvited: () => void;
}

const EMPTY_FORM = { fullName: "", email: "", telefone: "", cidade: "", estado: "" };

export function NovoVendedorDialog({ open, onOpenChange, onInvited }: NovoVendedorDialogProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [sending, setSending] = useState(false);

  const handleOpenChange = (next: boolean) => {
    if (!next) setForm(EMPTY_FORM);
    onOpenChange(next);
  };

  const handleInvite = async () => {
    const fullName = form.fullName.trim();
    const email = form.email.trim();
    if (!fullName || !email) {
      toast.error("Preencha nome completo e e-mail.");
      return;
    }

    setSending(true);
    try {
      await inviteVendedor({
        fullName,
        email,
        telefone: form.telefone.trim() || undefined,
        cidade: form.cidade.trim() || undefined,
        estado: form.estado.trim() || undefined,
      });
      toast.success("Convite enviado. O vendedor receberá um e-mail para definir a senha.");
      onInvited();
      handleOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao enviar convite.");
    } finally {
      setSending(false);
    }
  };

  return (
    <PremiumDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Novo vendedor"
      description="Um convite por e-mail será enviado para o vendedor definir a própria senha."
      footer={
        <Button onClick={handleInvite} disabled={sending} className="gap-2">
          {sending && <Loader2 className="h-4 w-4 animate-spin" />}
          Enviar convite
        </Button>
      }
    >
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="nv-nome">Nome completo</Label>
          <Input
            id="nv-nome"
            value={form.fullName}
            onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
            autoComplete="off"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="nv-email">E-mail</Label>
          <Input
            id="nv-email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            autoComplete="off"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="nv-telefone">Telefone</Label>
            <Input
              id="nv-telefone"
              value={form.telefone}
              onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nv-estado">Estado (UF)</Label>
            <Input
              id="nv-estado"
              maxLength={2}
              value={form.estado}
              onChange={(e) => setForm((f) => ({ ...f, estado: e.target.value.toUpperCase() }))}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="nv-cidade">Cidade</Label>
          <Input
            id="nv-cidade"
            value={form.cidade}
            onChange={(e) => setForm((f) => ({ ...f, cidade: e.target.value }))}
          />
        </div>
      </div>
    </PremiumDialog>
  );
}
