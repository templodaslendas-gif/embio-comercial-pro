# MERGE-PLAN.md — Arquitetura Modular + Plano de Integração

**Status**: APROVADO — arquitetura modular reutilizável
**Atualizado**: 2026-06-25
**Estratégia anterior**: integração como sistema paralelo → **SUBSTITUÍDA** por arquitetura modular

---

## Visão Geral da Estratégia

**Antes**: FF Instalações seria integrado como "sistema paralelo" ao lado do Embio.

**Agora**: Criar uma **arquitetura modular reutilizável** onde:
- `commercial/` contém lógica genérica de negócio (clientes, agenda, financeiro, orçamentos)
- `embio/` contém lógica específica da Embio (produtos, propulsores, dimensionamento)
- `shared/` contém infraestrutura reutilizável (auth, branding, UI, utils)

O Embio não precisa saber dos módulos commerciais para funcionar. Os módulos comerciais não precisam saber dos módulos Embio. Ambos consomem `shared/`.

**Princípio de adição**: Nenhum arquivo atual é deletado ou movido agora. A estrutura modular é criada de forma aditiva — novos módulos entram em `src/modules/`, o código existente é reorganizado gradualmente por fase.

---

## Estrutura Alvo: `src/modules/`

```
src/
├── modules/
│   ├── commercial/
│   │   ├── clientes/
│   │   │   ├── ClientesModule.tsx    ← FF: ClientesModule.tsx (adaptado)
│   │   │   ├── queries.ts            ← FF: subconjunto de queries.ts
│   │   │   └── index.ts              ← barrel export
│   │   ├── agenda/
│   │   │   ├── AgendaModule.tsx      ← FF: AgendaModule.tsx (adaptado)
│   │   │   ├── queries.ts            ← FF: subconjunto de queries.ts
│   │   │   └── index.ts
│   │   ├── financeiro/
│   │   │   ├── FinanceiroModule.tsx  ← FF: FinanceiroModule.tsx (adaptado)
│   │   │   ├── SaldoCard.tsx         ← FF: SaldoCard.tsx (direto)
│   │   │   ├── PeriodoSelector.tsx   ← FF: PeriodoSelector.tsx (direto)
│   │   │   ├── periodo.ts            ← FF: periodo.ts (adaptado)
│   │   │   ├── queries.ts            ← FF: subconjunto de queries.ts
│   │   │   └── index.ts
│   │   ├── catalogo/
│   │   │   ├── CatalogoDialog.tsx    ← FF: CatalogoDialog.tsx (direto)
│   │   │   ├── queries.ts            ← FF: subconjunto de orcamentoQueries.ts
│   │   │   └── index.ts
│   │   ├── orcamentos/
│   │   │   ├── OrcamentosModule.tsx  ← FF: OrcamentosModule.tsx (adaptado)
│   │   │   ├── OrcamentoFormDialog.tsx ← FF: OrcamentoFormDialog.tsx (adaptado)
│   │   │   ├── orcamentoPdf.ts       ← FF: orcamentoPdf.ts (adaptado)
│   │   │   ├── queries.ts            ← FF: subconjunto de orcamentoQueries.ts
│   │   │   └── index.ts
│   │   └── dashboard/
│   │       ├── DashboardModule.tsx   ← FF: DashboardModule.tsx (adaptado)
│   │       ├── WeatherWidget.tsx     ← FF: WeatherWidget.tsx (direto)
│   │       └── index.ts
│   │
│   ├── embio/
│   │   ├── produtos/
│   │   │   ├── Embio3000.tsx         ← atual: src/pages/produtos/Embio3000.tsx
│   │   │   ├── Embio3100.tsx
│   │   │   ├── Embio5000.tsx
│   │   │   ├── Embio6000.tsx
│   │   │   ├── Embio8000.tsx
│   │   │   └── index.ts
│   │   ├── propulsores/
│   │   │   ├── Propulsor3CV.tsx      ← atual: src/pages/propulsores/
│   │   │   ├── Propulsor4CV.tsx
│   │   │   ├── Propulsor5CV.tsx
│   │   │   ├── Propulsor75CV.tsx
│   │   │   ├── Propulsor10CV.tsx
│   │   │   └── index.ts
│   │   ├── dimensionamento/
│   │   │   ├── Dimensionamento3100.tsx  ← atual: src/pages/Dimensionamento3100.tsx
│   │   │   ├── DimensionamentoPropulsor.tsx
│   │   │   ├── Embiofert.tsx
│   │   │   ├── CalculatorCard.tsx    ← atual: src/components/calculators/
│   │   │   └── index.ts
│   │   ├── relatorios/
│   │   │   ├── MeusClientes.tsx      ← atual: src/pages/MeusClientes.tsx
│   │   │   ├── NovoOrcamento.tsx     ← atual: src/pages/NovoOrcamento.tsx
│   │   │   ├── quotePdf.ts           ← atual: src/lib/quotePdf.ts
│   │   │   └── index.ts
│   │   └── preparo/
│   │       ├── InstrucoesPreparo.tsx ← atual: src/pages/InstrucoesPreparo.tsx
│   │       └── index.ts
│   │
│   └── shared/
│       ├── components/
│       │   ├── Layout.tsx            ← atual: src/components/Layout.tsx
│       │   ├── AppSidebar.tsx        ← atual: src/components/AppSidebar.tsx
│       │   ├── NavLink.tsx
│       │   ├── ProtectedRoute.tsx
│       │   ├── CompanyFooter.tsx
│       │   └── WhatsAppButton.tsx
│       ├── hooks/
│       │   ├── useAuth.tsx           ← atual: src/hooks/useAuth.tsx
│       │   ├── use-mobile.tsx
│       │   └── use-toast.ts
│       ├── utils/
│       │   ├── utils.ts              ← atual: src/lib/utils.ts
│       │   ├── format.ts             ← atual: src/lib/format.ts
│       │   └── i18n/                 ← atual: src/i18n/
│       ├── pdf/
│       │   └── (futuro: geração compartilhada de PDF, ex: cabeçalho de empresa)
│       └── branding/
│           ├── useBranding.tsx       ← atual: src/hooks/useBranding.tsx
│           └── ConfiguracoesMarca.tsx ← atual: src/pages/ConfiguracoesMarca.tsx
│
├── integrations/
│   └── supabase/                     ← permanece aqui (infra, não módulo)
│       ├── client.ts
│       └── types.ts
│
├── pages/                            ← THIN SHELL — apenas re-exports para roteamento
│   └── (cada arquivo importa do módulo e renderiza)
│
├── App.tsx                           ← apenas roteamento
└── main.tsx
```

---

## Mapeamento: Arquivos Atuais → Destino Modular

### Arquivos que permanecem no lugar durante a migração

| Arquivo atual | Futuro destino modular | Quando mover |
|--------------|----------------------|-------------|
| `src/pages/Index.tsx` | Permanece — é o hub de roteamento | Fase 6 |
| `src/pages/Auth.tsx` | Permanece — infraestrutura de auth | Nunca (infra) |
| `src/pages/NotFound.tsx` | Permanece — infra de roteamento | Nunca |
| `src/App.tsx` | Permanece — orquestrador de rotas | Nunca |
| `src/main.tsx` | Permanece | Nunca |
| `src/integrations/supabase/` | Permanece | Nunca |
| `src/components/ui/` | **Permanece como está** — shadcn convenção, paths hardcoded | Nunca |
| `src/index.css` | Permanece | Nunca |

> ⚠️ `src/components/ui/` **não será movida**. Os componentes shadcn têm caminhos esperados por ferramentas de geração (`npx shadcn add`). Mover quebraria a toolchain.

### Arquivos do Embio → `src/modules/embio/`

| Arquivo atual | Destino modular | Fase |
|--------------|----------------|------|
| `src/pages/produtos/Embio3000..8000.tsx` | `modules/embio/produtos/` | Fase E1 |
| `src/pages/propulsores/Propulsor*.tsx` | `modules/embio/propulsores/` | Fase E1 |
| `src/pages/Dimensionamento3100.tsx` | `modules/embio/dimensionamento/` | Fase E1 |
| `src/pages/DimensionamentoPropulsor.tsx` | `modules/embio/dimensionamento/` | Fase E1 |
| `src/pages/Embiofert.tsx` | `modules/embio/dimensionamento/` | Fase E1 |
| `src/components/calculators/CalculatorCard.tsx` | `modules/embio/dimensionamento/` | Fase E1 |
| `src/components/dashboard/EfficiencyChart.tsx` | `modules/embio/relatorios/` | Fase E2 |
| `src/components/dashboard/PreparationTimeline.tsx` | `modules/embio/relatorios/` | Fase E2 |
| `src/components/dashboard/StatsCards.tsx` | `modules/embio/relatorios/` | Fase E2 |
| `src/components/dashboard/SustainabilityCard.tsx` | `modules/embio/relatorios/` | Fase E2 |
| `src/pages/MeusClientes.tsx` | `modules/embio/relatorios/` | Fase E2 |
| `src/pages/NovoOrcamento.tsx` | `modules/embio/relatorios/` | Fase E2 |
| `src/lib/quotePdf.ts` | `modules/embio/relatorios/` | Fase E2 |
| `src/pages/InstrucoesPreparo.tsx` | `modules/embio/preparo/` | Fase E3 |

### Arquivos shared → `src/modules/shared/`

| Arquivo atual | Destino modular | Fase |
|--------------|----------------|------|
| `src/hooks/useAuth.tsx` | `modules/shared/hooks/` | Fase S1 |
| `src/hooks/use-mobile.tsx` | `modules/shared/hooks/` | Fase S1 |
| `src/hooks/use-toast.ts` | `modules/shared/hooks/` | Fase S1 |
| `src/hooks/useBranding.tsx` | `modules/shared/branding/` | Fase S1 |
| `src/lib/utils.ts` | `modules/shared/utils/` | Fase S1 |
| `src/lib/format.ts` | `modules/shared/utils/` | Fase S1 |
| `src/i18n/` | `modules/shared/utils/i18n/` | Fase S1 |
| `src/components/Layout.tsx` | `modules/shared/components/` | Fase S2 |
| `src/components/AppSidebar.tsx` | `modules/shared/components/` | Fase S2 |
| `src/components/NavLink.tsx` | `modules/shared/components/` | Fase S2 |
| `src/components/ProtectedRoute.tsx` | `modules/shared/components/` | Fase S2 |
| `src/components/CompanyFooter.tsx` | `modules/shared/components/` | Fase S2 |
| `src/components/WhatsAppButton.tsx` | `modules/shared/components/` | Fase S2 |
| `src/pages/ConfiguracoesMarca.tsx` | `modules/shared/branding/` | Fase S2 |

### Módulos FF → `src/modules/commercial/`

| Arquivo FF | Destino modular | Adaptação |
|-----------|----------------|-----------|
| `ClientesModule.tsx` | `modules/commercial/clientes/` | Ajustar imports |
| `AgendaModule.tsx` | `modules/commercial/agenda/` | Ajustar imports |
| `FinanceiroModule.tsx` | `modules/commercial/financeiro/` | Ajustar imports |
| `SaldoCard.tsx` | `modules/commercial/financeiro/` | Sem alteração |
| `PeriodoSelector.tsx` | `modules/commercial/financeiro/` | Ajustar 1 import |
| `periodo.ts` | `modules/commercial/financeiro/` | `jspdf-autotable` + branding |
| `CatalogoDialog.tsx` | `modules/commercial/catalogo/` | Ajustar imports |
| `OrcamentosModule.tsx` | `modules/commercial/orcamentos/` | `useSettings()` → `useBranding()` |
| `OrcamentoFormDialog.tsx` | `modules/commercial/orcamentos/` | Ajustar imports |
| `orcamentoPdf.ts` | `modules/commercial/orcamentos/` | `jspdf-autotable` + `useBranding()` |
| `DashboardModule.tsx` | `modules/commercial/dashboard/` | Remover import TanStack |
| `WeatherWidget.tsx` | `modules/commercial/dashboard/` | Sem alteração |
| `queries.ts` | Dividir entre módulos (clientes, agenda, financeiro) | Split por domínio |
| `orcamentoQueries.ts` | Dividir entre catalogo/ e orcamentos/ | Split por domínio |

### Arquivos FF a DESCARTAR (nunca entram nos módulos)

| Arquivo | Motivo |
|---------|--------|
| `auth-attacher.ts` | `@tanstack/react-start` — incompatível |
| `auth-middleware.ts` | `@tanstack/react-start/server` — incompatível |
| `useAuth.ts` | Embio tem versão superior |
| `client.ts` | Embio tem versão adequada |
| `use-mobile.tsx` | Duplicata do existente |
| `SettingsProvider.tsx` | Substituído por `useBranding()` |

---

## Contrato entre Módulos

### O que cada módulo pode importar

```
modules/commercial/*   → pode importar de: shared/
                       → NÃO pode importar de: embio/
                       → NÃO pode importar de: outros commercial/* diretamente
                         (exceção: commercial/orcamentos pode importar de commercial/clientes)

modules/embio/*        → pode importar de: shared/
                       → NÃO pode importar de: commercial/
                       → NÃO pode importar de: outros embio/* diretamente

modules/shared/*       → NÃO importa de commercial/ ou embio/ (nunca)

src/App.tsx            → importa de modules/ para registrar rotas
src/pages/*            → thin shells que importam do módulo correspondente
```

### Dependências da `integrations/supabase/`

Todos os módulos podem importar `client` e `Database` de `@/integrations/supabase/`. É infraestrutura, não módulo — sem restrição.

---

## Convenção de Barrel Exports

Cada módulo terá um `index.ts`:

```typescript
// modules/commercial/clientes/index.ts
export { ClientesModule } from './ClientesModule';
export type { Cliente } from './queries';
```

Páginas importam via módulo, nunca via arquivo interno:

```typescript
// CORRETO:
import { ClientesModule } from '@/modules/commercial/clientes';

// ERRADO (acopla a internos):
import { ClientesModule } from '@/modules/commercial/clientes/ClientesModule';
```

---

## Ordem de Implementação (Fases)

### FASE 0 — Pré-condições (IMEDIATO)
> Sem mover arquivos. Apenas dependência e estrutura de pastas.

- [ ] `npm install jspdf-autotable`
- [ ] Criar diretório `src/modules/commercial/`
- [ ] Criar diretório `src/modules/embio/`
- [ ] Criar diretório `src/modules/shared/`
- [ ] Criar branch `develop`

**Estimativa**: 30 min | **Risco**: Nenhum

---

### FASE C1 — Primeiro módulo commercial: `WeatherWidget` (sem banco)
> Módulo mais simples possível. Valida a estrutura de pastas e a convenção.

- [ ] Criar `src/modules/commercial/dashboard/WeatherWidget.tsx` (copiar do FF, sem alteração)
- [ ] Criar `src/modules/commercial/dashboard/index.ts`
- [ ] Importar `WeatherWidget` no `Index.tsx` existente (adicionar ao dashboard)
- [ ] Verificar build: `npm run build`

**Branch**: `feature/module-weather`  
**Estimativa**: 1–2h | **Risco**: Nenhum (sem banco, sem auth)

> **Por que este primeiro**: Zero dependências de banco. Valida a estrutura modular. Entrega valor visual imediato no dashboard.

---

### FASE C2 — `commercial/financeiro`: SaldoCard + PeriodoSelector (sem banco)

- [ ] `src/modules/commercial/financeiro/SaldoCard.tsx` (direto do FF)
- [ ] `src/modules/commercial/financeiro/PeriodoSelector.tsx` (1 import ajustado)
- [ ] `src/modules/commercial/financeiro/periodo.ts` (substituir "FF INSTALAÇÕES" por `branding.company_name`)
- [ ] `src/modules/commercial/financeiro/index.ts`
- [ ] Verificar build

**Branch**: `feature/module-financeiro-ui`  
**Estimativa**: 2–3h | **Risco**: Baixo

---

### FASE C3 — `commercial/clientes`: primeiro módulo com banco

> Requer migration e aprovação antes de executar.

- [ ] Migration: criar tabela `clientes` + RLS
- [ ] Regenerar `src/integrations/supabase/types.ts`
- [ ] `src/modules/commercial/clientes/queries.ts` (extrair de FF queries.ts)
- [ ] `src/modules/commercial/clientes/ClientesModule.tsx`
- [ ] `src/modules/commercial/clientes/index.ts`
- [ ] Nova rota `/clientes` em `App.tsx`
- [ ] Thin page: `src/pages/Clientes.tsx` (importa do módulo)
- [ ] Adicionar "Clientes" ao `AppSidebar.tsx`

**Branch**: `feature/module-clientes`  
**Estimativa**: 4–6h | **Risco**: Baixo (tabela nova, sem conflito)

---

### FASE C4 — `commercial/catalogo` + `commercial/orcamentos`

> Requer 3 migrations + aprovação.

- [ ] Migrations: `catalogo_itens`, `orcamentos`, `orcamento_itens` + RLS
- [ ] `modules/commercial/catalogo/` (CatalogoDialog + queries)
- [ ] `modules/commercial/orcamentos/` (OrcamentosModule + OrcamentoFormDialog + orcamentoPdf)
- [ ] Substituir `useSettings()` por `useBranding()` no OrcamentosModule
- [ ] Converter cor de branding: HSL → hex para orcamentoPdf
- [ ] Nova rota `/orcamentos`

**Branch**: `feature/module-orcamentos`  
**Estimativa**: 8–12h | **Risco**: Médio

---

### FASE C5 — `commercial/agenda`

> Requer 2 migrations + aprovação.

- [ ] Migrations: `servicos`, `manutencoes` + RLS
- [ ] `modules/commercial/agenda/` (AgendaModule + queries)
- [ ] Nova rota `/agenda`

**Branch**: `feature/module-agenda`  
**Estimativa**: 6–10h | **Risco**: Médio

---

### FASE C6 — `commercial/financeiro`: módulo completo com banco

> Requer 2 migrations + aprovação.

- [ ] Migrations: `caixa`, `contas_futuras` + RLS
- [ ] Completar `modules/commercial/financeiro/` com FinanceiroModule + queries
- [ ] Nova rota `/financeiro`

**Branch**: `feature/module-financeiro`  
**Estimativa**: 5–8h | **Risco**: Baixo

---

### FASE C7 — `commercial/dashboard`: módulo completo

> Depende de C3–C6 (todos os dados disponíveis)

- [ ] Remover import inválido do `DashboardModule.tsx` (TanStack Router)
- [ ] Definir `AgendaPrefill` localmente
- [ ] `modules/commercial/dashboard/DashboardModule.tsx`
- [ ] Integrar ao `Index.tsx` ou nova rota `/dashboard-comercial`

**Branch**: `feature/module-commercial-dashboard`  
**Estimativa**: 3–5h | **Risco**: Médio

---

### FASE S1 — Reorganizar `shared/` (refactor, sem funcionalidade nova)

> Executar após todos os módulos commercial funcionarem.

- [ ] Mover `src/hooks/useAuth.tsx` → `src/modules/shared/hooks/`
- [ ] Mover `src/hooks/useBranding.tsx` → `src/modules/shared/branding/`
- [ ] Mover `src/hooks/use-mobile.tsx` → `src/modules/shared/hooks/`
- [ ] Mover `src/hooks/use-toast.ts` → `src/modules/shared/hooks/`
- [ ] Mover `src/lib/utils.ts` → `src/modules/shared/utils/`
- [ ] Mover `src/lib/format.ts` → `src/modules/shared/utils/`
- [ ] Atualizar todos os imports afetados
- [ ] Verificar build e testes

**Branch**: `refactor/shared-module`  
**Estimativa**: 4–6h | **Risco**: Alto (muitos imports) — fazer por arquivo, um de cada vez

---

### FASE E1 — Reorganizar `embio/` (refactor)

> Executar após S1.

- [ ] Mover `src/pages/produtos/` → `src/modules/embio/produtos/`
- [ ] Mover `src/pages/propulsores/` → `src/modules/embio/propulsores/`
- [ ] Mover dimensionamento + calculators → `src/modules/embio/dimensionamento/`
- [ ] Atualizar `App.tsx` e imports
- [ ] Verificar build

**Branch**: `refactor/embio-module`  
**Estimativa**: 4–6h | **Risco**: Médio

---

### FASE E2 — Reorganizar `embio/relatorios/` e `shared/branding/`

- [ ] Mover `MeusClientes.tsx`, `NovoOrcamento.tsx`, `quotePdf.ts` → `modules/embio/relatorios/`
- [ ] Mover `src/components/dashboard/` → `modules/embio/relatorios/`
- [ ] Mover `ConfiguracoesMarca.tsx` → `modules/shared/branding/`

**Branch**: `refactor/embio-relatorios`  
**Estimativa**: 3–4h | **Risco**: Médio

---

## Mapa de Dependências entre Fases

```
FASE 0 (pré-condições)
    │
    ├── FASE C1 (WeatherWidget) ─────────────────────────┐
    ├── FASE C2 (financeiro UI) ─────────────────────────┤
    │                                                     │
    └── FASE C3 (clientes + banco)                        │
            │                                             │
            ├── FASE C4 (catálogo + orçamentos)           │
            ├── FASE C5 (agenda)                          │
            └── FASE C6 (financeiro + banco)              │
                    │                                     │
                    └── FASE C7 (dashboard commercial) ◄──┘
                            │
                            └── FASE S1 (shared refactor)
                                    │
                                    └── FASE E1 + E2 (embio refactor)
```

---

## Schema de Banco de Dados

### Tabelas Embio (INTOCÁVEIS)
`profiles`, `clients`, `quotes`, `branding_settings`

### Tabelas novas para `commercial/` (criadas por fase)

| Fase | Tabela | Módulo |
|------|--------|--------|
| C3 | `clientes` | commercial/clientes |
| C4 | `catalogo_itens` | commercial/catalogo |
| C4 | `orcamentos` | commercial/orcamentos |
| C4 | `orcamento_itens` | commercial/orcamentos |
| C5 | `servicos` | commercial/agenda |
| C5 | `manutencoes` | commercial/agenda |
| C6 | `caixa` | commercial/financeiro |
| C6 | `contas_futuras` | commercial/financeiro |

> `configuracoes` (FF) **não será criada** — substituída por `branding_settings` via `useBranding()`.

---

## Riscos

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Fase S1 quebrar imports em cascata | Alta | Alto | Mover um arquivo por vez, build após cada um |
| `@/` alias não resolver novos caminhos em `modules/` | Alta | Alto | Adicionar alias `@/modules` em `tsconfig.json` antes de qualquer mover |
| `types.ts` desatualizado após migrations | Alta | Médio | Regenerar após cada batch de migration |
| Circular imports entre módulos | Média | Médio | Respeitar estritamente o contrato de importação (shared ← embio/commercial) |
| shadcn `add` quebrar após mover `src/components/ui/` | Alta | Alto | Nunca mover `src/components/ui/` — manter no lugar original |

---

## Checklist por Fase

Antes de cada merge para `develop`:
- [ ] `npx tsc --noEmit` sem erros
- [ ] `npm run build` sem erros
- [ ] Nenhum import cross-module violando o contrato
- [ ] Nenhum `import from '@tanstack/react-start'`
- [ ] Nenhum `useSettings()` — somente `useBranding()`
- [ ] Tabelas novas têm RLS + policies
- [ ] `types.ts` regenerado (se houve migration)
- [ ] Fluxo Embio existente intocado (auth, orçamentos técnicos, branding)

---

## Próximo Passo Imediato

**FASE 0:**
```bash
npm install jspdf-autotable
mkdir -p src/modules/commercial src/modules/embio src/modules/shared
```

**Depois**: iniciar Fase C1 — `WeatherWidget` — para validar a estrutura de módulos sem risco de banco.
