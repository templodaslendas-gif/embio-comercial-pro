# Agenda Comercial + Ajuste Visual Menu — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajustar ícones/ordem do menu lateral e criar o módulo Agenda Comercial completo (migration + queries + página + dashboard card).

**Architecture:** Segue o padrão estabelecido no projeto — migration SQL + queries em `src/lib/` usando `(supabase as any)` + página premium em `src/pages/` com Sheet/Table/AlertDialog + rota em App.tsx + item no sidebar. A tabela `servicos` referencia `clientes(id)` e o join traz `clientes(nome)` nas queries.

**Tech Stack:** React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui + @tanstack/react-query + Supabase PostgREST + lucide-react + sonner (toast) + date-fns

---

## File Map

| Arquivo | Ação | Responsabilidade |
|---------|------|-----------------|
| `supabase/migrations/20260626120000_servicos.sql` | CREATE | Tabela servicos, RLS, políticas, índices, trigger |
| `src/lib/agendaQueries.ts` | CREATE | CRUD para tabela servicos (fetchServicos, createServico, updateServico, deleteServico) |
| `src/pages/Agenda.tsx` | CREATE | Página completa: tabela, Sheet form, AlertDialog, filtros, skeleton, toasts |
| `src/components/AppSidebar.tsx` | MODIFY | Adicionar UserCheck + CalendarDays imports, reordenar menu, trocar ícone Clientes |
| `src/App.tsx` | MODIFY | Adicionar rota `/agenda` |
| `src/pages/Index.tsx` | MODIFY | Importar fetchServicos, query servicos, agendaStats memo, 4ª coluna na seção de stats |

---

### Task 1: Migration servicos

**Files:**
- Create: `supabase/migrations/20260626120000_servicos.sql`

- [ ] **Step 1: Criar o arquivo SQL**

```sql
-- Compromissos/visitas comerciais por usuário

CREATE TABLE public.servicos (
  id          uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cliente_id  uuid        REFERENCES public.clientes(id) ON DELETE SET NULL,
  titulo      text        NOT NULL,
  tipo        text        NOT NULL DEFAULT 'visita comercial'
                          CHECK (tipo IN ('visita comercial','retorno','entrega','demonstração','outro')),
  data        date        NOT NULL,
  hora        time,
  cidade      text,
  observacoes text,
  status      text        NOT NULL DEFAULT 'agendado'
                          CHECK (status IN ('agendado','concluido','cancelado')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own servicos"
  ON public.servicos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own servicos"
  ON public.servicos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own servicos"
  ON public.servicos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own servicos"
  ON public.servicos FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_servicos_user_id    ON public.servicos (user_id);
CREATE INDEX idx_servicos_cliente_id ON public.servicos (user_id, cliente_id);
CREATE INDEX idx_servicos_data       ON public.servicos (user_id, data);
CREATE INDEX idx_servicos_status     ON public.servicos (user_id, status);

CREATE TRIGGER update_servicos_updated_at
  BEFORE UPDATE ON public.servicos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

- [ ] **Step 2: Aplicar no Supabase** via SQL Editor no dashboard (colar o conteúdo acima)

---

### Task 2: agendaQueries.ts

**Files:**
- Create: `src/lib/agendaQueries.ts`

- [ ] **Step 1: Criar queries**

```ts
import { supabase } from "@/integrations/supabase/client";

export type Servico = {
  id: string;
  user_id: string;
  cliente_id: string | null;
  titulo: string;
  tipo: string;
  data: string;
  hora: string | null;
  cidade: string | null;
  observacoes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  clientes: { nome: string } | null;
};

export type ServicoInsert = {
  cliente_id?: string | null;
  titulo: string;
  tipo?: string;
  data: string;
  hora?: string | null;
  cidade?: string | null;
  observacoes?: string | null;
  status?: string;
};

export async function fetchServicos(): Promise<Servico[]> {
  const { data, error } = await (supabase as any)
    .from("servicos")
    .select("*, clientes(nome)")
    .order("data", { ascending: true })
    .order("hora", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return data || [];
}

export async function createServico(s: ServicoInsert): Promise<Servico> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");
  const { data, error } = await (supabase as any)
    .from("servicos")
    .insert({ ...s, user_id: user.id })
    .select("*, clientes(nome)")
    .single();
  if (error) throw error;
  return data as Servico;
}

export async function updateServico(id: string, s: Partial<ServicoInsert>): Promise<Servico> {
  const { data, error } = await (supabase as any)
    .from("servicos")
    .update(s)
    .eq("id", id)
    .select("*, clientes(nome)")
    .single();
  if (error) throw error;
  return data as Servico;
}

export async function deleteServico(id: string): Promise<void> {
  const { error } = await (supabase as any).from("servicos").delete().eq("id", id);
  if (error) throw error;
}
```

---

### Task 3: Agenda.tsx (ver código completo na execução)

**Files:**
- Create: `src/pages/Agenda.tsx`

Página com: table (Data, Cliente, Título, Tipo, Status, Ações), Sheet form (todos os campos), AlertDialog confirm, filtros (search, status, período), skeleton, toasts.

---

### Task 4: Sidebar + Routing

**Files:**
- Modify: `src/components/AppSidebar.tsx`
- Modify: `src/App.tsx`

Sidebar: adicionar `UserCheck`, `CalendarDays` nos imports. Reordenar: Dashboard, Clientes(UserCheck), Catálogo, Agenda(CalendarDays), Novo Orçamento, Meus Clientes.
App.tsx: adicionar `import Agenda from "./pages/Agenda"` e `<Route path="/agenda" element={<Agenda />} />`.

---

### Task 5: Dashboard — card Agenda

**Files:**
- Modify: `src/pages/Index.tsx`

Adicionar: import `fetchServicos`, query `servicos`, memo `agendaStats`, 4ª coluna (`xl:grid-cols-4`) na seção de stats com card Agenda.

---

### Task 6: Build + Commit + Push

```bash
npm run build
git add src/components/AppSidebar.tsx src/App.tsx src/pages/Agenda.tsx \
        src/lib/agendaQueries.ts src/pages/Index.tsx \
        supabase/migrations/20260626120000_servicos.sql
git commit -m "feat: add commercial agenda module"
git push origin main
```
