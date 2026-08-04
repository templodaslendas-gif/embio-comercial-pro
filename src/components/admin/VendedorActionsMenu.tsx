import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MoreHorizontal, Eye, Pencil, Lock, Unlock, UserMinus, UserCheck, KeyRound, Copy,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PremiumConfirmDialog } from "@/components/premium";
import { callAdminUserAction, type AdminUserAction } from "@/lib/adminUserActions";
import type { VendedorOverview } from "@/lib/adminQueries";

interface VendedorActionsMenuProps {
  vendedor: VendedorOverview;
  currentUserId: string | undefined;
  onEdit: () => void;
  onActionDone: () => void;
  hideViewDetails?: boolean;
}

const CONFIRM_COPY: Record<
  AdminUserAction,
  { title: string; description: string; confirmLabel: string; destructive?: boolean }
> = {
  block: {
    title: "Bloquear vendedor",
    description: "O acesso é encerrado imediatamente. Clientes e propostas são preservados.",
    confirmLabel: "Bloquear",
    destructive: true,
  },
  unblock: {
    title: "Desbloquear vendedor",
    description: "O acesso volta a ser permitido normalmente.",
    confirmLabel: "Desbloquear",
  },
  offboard: {
    title: "Marcar como desligado",
    description: "O acesso é encerrado. O histórico é preservado — nada é apagado.",
    confirmLabel: "Marcar como desligado",
    destructive: true,
  },
  reactivate: {
    title: "Reativar vendedor",
    description: "O acesso volta a ser permitido normalmente.",
    confirmLabel: "Reativar",
  },
  send_password_reset: {
    title: "Enviar recuperação de senha",
    description: "Um e-mail de redefinição de senha será enviado para o vendedor.",
    confirmLabel: "Enviar",
  },
};

export function VendedorActionsMenu({
  vendedor,
  currentUserId,
  onEdit,
  onActionDone,
  hideViewDetails = false,
}: VendedorActionsMenuProps) {
  const navigate = useNavigate();
  const [pendingAction, setPendingAction] = useState<AdminUserAction | null>(null);
  const [loading, setLoading] = useState(false);
  const isSelf = vendedor.user_id === currentUserId;

  const runAction = async () => {
    if (!pendingAction) return;
    setLoading(true);
    try {
      await callAdminUserAction(pendingAction, vendedor.user_id);
      toast.success("Ação concluída.");
      onActionDone();
      setPendingAction(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao executar ação.");
    } finally {
      setLoading(false);
    }
  };

  const copyEmail = () => {
    if (!vendedor.email) return;
    navigator.clipboard.writeText(vendedor.email);
    toast.success("E-mail copiado.");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {!hideViewDetails && (
            <DropdownMenuItem onClick={() => navigate(`/admin/vendedores/${vendedor.user_id}`)} className="gap-2">
              <Eye className="h-3.5 w-3.5" /> Ver desempenho
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={onEdit} className="gap-2">
            <Pencil className="h-3.5 w-3.5" /> Editar dados cadastrais
          </DropdownMenuItem>
          <DropdownMenuItem onClick={copyEmail} className="gap-2" disabled={!vendedor.email}>
            <Copy className="h-3.5 w-3.5" /> Copiar e-mail
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {vendedor.status === "ativo" && (
            <DropdownMenuItem
              onClick={() => setPendingAction("block")}
              disabled={isSelf}
              className="gap-2 text-destructive focus:text-destructive"
            >
              <Lock className="h-3.5 w-3.5" /> Bloquear
            </DropdownMenuItem>
          )}
          {vendedor.status === "bloqueado" && (
            <DropdownMenuItem onClick={() => setPendingAction("unblock")} className="gap-2">
              <Unlock className="h-3.5 w-3.5" /> Desbloquear
            </DropdownMenuItem>
          )}
          {vendedor.status !== "desligado" && (
            <DropdownMenuItem
              onClick={() => setPendingAction("offboard")}
              disabled={isSelf}
              className="gap-2 text-destructive focus:text-destructive"
            >
              <UserMinus className="h-3.5 w-3.5" /> Marcar como desligado
            </DropdownMenuItem>
          )}
          {vendedor.status === "desligado" && (
            <DropdownMenuItem onClick={() => setPendingAction("reactivate")} className="gap-2">
              <UserCheck className="h-3.5 w-3.5" /> Reativar
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => setPendingAction("send_password_reset")} className="gap-2">
            <KeyRound className="h-3.5 w-3.5" /> Enviar recuperação de senha
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <PremiumConfirmDialog
        open={pendingAction !== null}
        onOpenChange={(open) => !open && setPendingAction(null)}
        title={pendingAction ? CONFIRM_COPY[pendingAction].title : ""}
        description={pendingAction ? CONFIRM_COPY[pendingAction].description : ""}
        confirmLabel={pendingAction ? CONFIRM_COPY[pendingAction].confirmLabel : "Confirmar"}
        destructive={pendingAction ? !!CONFIRM_COPY[pendingAction].destructive : false}
        onConfirm={runAction}
        loading={loading}
      />
    </>
  );
}
