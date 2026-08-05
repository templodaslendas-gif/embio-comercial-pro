import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Search, Users, ShieldCheck, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { fetchVendedoresOverview, type VendedorOverview } from "@/lib/adminQueries";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  PremiumPage, PremiumHeader, PremiumSection, PremiumTable, PremiumEmptyState,
} from "@/components/premium";
import type { PremiumTableColumn } from "@/components/premium/PremiumTable";
import { VendedorActionsMenu } from "@/components/admin/VendedorActionsMenu";
import { EditVendedorDialog } from "@/components/admin/EditVendedorDialog";
import { NovoVendedorDialog } from "@/components/admin/NovoVendedorDialog";
import { cn } from "@/lib/utils";

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const STATUS_CFG: Record<string, { label: string; className: string }> = {
  ativo:      { label: "Ativo",      className: "bg-accent/15 text-accent border border-accent/30" },
  bloqueado:  { label: "Bloqueado",  className: "bg-amber-500/15 text-amber-700 border border-amber-500/30" },
  desligado:  { label: "Desligado",  className: "bg-muted text-muted-foreground border border-border/60" },
};

type SortBy = "venda" | "propostas" | "conversao" | "recente" | "nome";

const SORT_LABELS: Record<SortBy, string> = {
  venda: "Maior venda",
  propostas: "Mais propostas",
  conversao: "Melhor conversão",
  recente: "Cadastro mais recente",
  nome: "Nome",
};

function conversao(v: VendedorOverview): number {
  return v.propostas_count > 0 ? ((v.propostas_aprovadas + v.propostas_finalizadas) / v.propostas_count) * 100 : 0;
}

function initials(name: string | null, email: string | null): string {
  const base = name || email || "?";
  return base.split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export default function AdminVendedores() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [sortBy, setSortBy] = useState<SortBy>("venda");
  const [editing, setEditing] = useState<VendedorOverview | null>(null);
  const [inviting, setInviting] = useState(false);

  const { data: vendedores = [], isLoading } = useQuery({
    queryKey: ["admin", "vendedores-overview"],
    queryFn: fetchVendedoresOverview,
    staleTime: 60 * 1000,
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "vendedores-overview"] });

  const filteredSorted = useMemo(() => {
    const term = search.trim().toLowerCase();
    let list = vendedores.filter((v) => {
      if (statusFilter !== "todos" && v.status !== statusFilter) return false;
      if (!term) return true;
      return (v.full_name?.toLowerCase().includes(term)) || (v.email?.toLowerCase().includes(term));
    });
    list = [...list].sort((a, b) => {
      switch (sortBy) {
        case "propostas": return b.propostas_count - a.propostas_count;
        case "conversao": return conversao(b) - conversao(a);
        case "recente": return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "nome": return (a.full_name || a.email || "").localeCompare(b.full_name || b.email || "");
        case "venda":
        default: return b.valor_vendido - a.valor_vendido;
      }
    });
    return list;
  }, [vendedores, search, statusFilter, sortBy]);

  // Posição no ranking global (independe do filtro/busca ativos — reflete
  // a posição real por valor vendido entre todos os vendedores).
  const rankByUserId = useMemo(() => {
    const sorted = [...vendedores].sort((a, b) => b.valor_vendido - a.valor_vendido);
    return new Map(sorted.map((v, i) => [v.user_id, i + 1]));
  }, [vendedores]);

  const columns: PremiumTableColumn<VendedorOverview>[] = [
    {
      key: "nome",
      label: "Vendedor",
      render: (v) => (
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="h-8 w-8 shrink-0">
            {v.foto_url && <AvatarImage src={v.foto_url} alt="" />}
            <AvatarFallback className="text-xs font-semibold">{initials(v.full_name, v.email)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{v.full_name || "Sem nome"}</p>
            <p className="text-sm text-foreground/60 truncate">{v.email}</p>
          </div>
          {v.role === "super_admin" && (
            <ShieldCheck className="h-3.5 w-3.5 text-accent shrink-0" aria-label="Super Admin" />
          )}
        </div>
      ),
    },
    {
      key: "local",
      label: "Local",
      render: (v) => (
        <span className="text-sm text-foreground/70">
          {[v.cidade, v.estado].filter(Boolean).join(" · ") || "—"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (v) => {
        const cfg = STATUS_CFG[v.status] ?? STATUS_CFG.ativo;
        return <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", cfg.className)}>{cfg.label}</span>;
      },
    },
    { key: "clientes", label: "Clientes", render: (v) => <span className="tabular-nums text-sm">{v.clientes_count}</span> },
    { key: "propostas", label: "Propostas", render: (v) => <span className="tabular-nums text-sm">{v.propostas_count}</span> },
    {
      key: "vendas",
      label: "Vendas",
      render: (v) => (
        <div>
          <p className="text-sm font-semibold tabular-nums text-foreground">{brl(v.valor_vendido)}</p>
          <p className="text-sm text-foreground/60">{v.propostas_aprovadas + v.propostas_finalizadas} vendas · {Math.round(conversao(v))}% conv.</p>
        </div>
      ),
    },
    {
      key: "ranking",
      label: "#",
      render: (v) => <span className="text-sm font-semibold text-muted-foreground">{rankByUserId.get(v.user_id)}</span>,
    },
    {
      key: "acoes",
      label: "",
      className: "text-right",
      render: (v) => (
        <VendedorActionsMenu
          vendedor={v}
          currentUserId={user?.id}
          onEdit={() => setEditing(v)}
          onActionDone={refresh}
        />
      ),
    },
  ];

  return (
    <PremiumPage>
      <div className="max-w-6xl mx-auto space-y-6">
        <PremiumHeader
          icon={Users}
          badge="Super Admin"
          title="Vendedores"
          subtitle="Gestão de acesso e desempenho comercial da equipe."
          action={
            <Button onClick={() => setInviting(true)} className="gap-2">
              <UserPlus className="h-4 w-4" /> Novo vendedor
            </Button>
          }
        />

        <PremiumSection label="Filtros">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome ou e-mail"
                className="pl-9 h-10 rounded-lg"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10 w-full md:w-[180px] rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="bloqueado">Bloqueado</SelectItem>
                <SelectItem value="desligado">Desligado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
              <SelectTrigger className="h-10 w-full md:w-[210px] rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(SORT_LABELS) as SortBy[]).map((key) => (
                  <SelectItem key={key} value={key}>{SORT_LABELS[key]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </PremiumSection>

        <PremiumSection label={`${filteredSorted.length} vendedor${filteredSorted.length === 1 ? "" : "es"}`}>
          {/* Desktop / tablet: tabela com scroll horizontal controlado */}
          <div className="hidden md:block overflow-x-auto">
            <PremiumTable
              columns={columns}
              rows={filteredSorted}
              keyExtractor={(v) => v.user_id}
              loading={isLoading}
              onRowClick={(v) => navigate(`/admin/vendedores/${v.user_id}`)}
              emptyState={
                <PremiumEmptyState
                  icon={Users}
                  title="Nenhum vendedor encontrado"
                  description="Ajuste a busca ou os filtros."
                />
              }
            />
          </div>

          {/* Mobile: cards, sem quebra horizontal da página */}
          <div className="md:hidden space-y-3">
            {isLoading ? (
              <p className="text-sm text-muted-foreground text-center py-8">Carregando…</p>
            ) : filteredSorted.length === 0 ? (
              <PremiumEmptyState icon={Users} title="Nenhum vendedor encontrado" description="Ajuste a busca ou os filtros." />
            ) : (
              filteredSorted.map((v) => {
                const cfg = STATUS_CFG[v.status] ?? STATUS_CFG.ativo;
                return (
                  <div key={v.user_id} className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <button
                        className="flex items-center gap-3 min-w-0 text-left"
                        onClick={() => navigate(`/admin/vendedores/${v.user_id}`)}
                      >
                        <Avatar className="h-9 w-9 shrink-0">
                          {v.foto_url && <AvatarImage src={v.foto_url} alt="" />}
                          <AvatarFallback className="text-xs font-semibold">{initials(v.full_name, v.email)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{v.full_name || "Sem nome"}</p>
                          <p className="text-sm text-foreground/60 truncate">{v.email}</p>
                        </div>
                      </button>
                      <VendedorActionsMenu vendedor={v} currentUserId={user?.id} onEdit={() => setEditing(v)} onActionDone={refresh} />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", cfg.className)}>{cfg.label}</span>
                      <span className="text-muted-foreground">#{rankByUserId.get(v.user_id)} no ranking</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center border-t border-border/40 pt-3">
                      <div>
                        <p className="text-sm font-semibold tabular-nums">{v.clientes_count}</p>
                        <p className="text-sm text-muted-foreground">Clientes</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold tabular-nums">{v.propostas_count}</p>
                        <p className="text-sm text-muted-foreground">Propostas</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold tabular-nums">{brl(v.valor_vendido)}</p>
                        <p className="text-sm text-muted-foreground">Vendido</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </PremiumSection>
      </div>

      <EditVendedorDialog vendedor={editing} onOpenChange={(open) => !open && setEditing(null)} onSaved={refresh} />
      <NovoVendedorDialog open={inviting} onOpenChange={setInviting} onInvited={refresh} />
    </PremiumPage>
  );
}
