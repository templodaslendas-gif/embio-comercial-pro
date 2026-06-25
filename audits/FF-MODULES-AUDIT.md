# FF-MODULES-AUDIT.md — Auditoria Real dos Módulos FF Instalações

**Status**: CONCLUÍDA — código lido arquivo por arquivo
**Atualizado**: 2026-06-25
**Arquivos auditados**: 22 arquivos em `incoming-ff-modules/`

---

## Inventário Completo dos Arquivos

| Arquivo | Tipo | Linhas | Situação |
|---------|------|--------|----------|
| `AgendaModule.tsx` | Componente React | 560 | Precisa adaptação |
| `FinanceiroModule.tsx` | Componente React | 257 | Precisa adaptação |
| `ClientesModule.tsx` | Componente React | 131 | Precisa adaptação |
| `DashboardModule.tsx` | Componente React | 237 | Precisa adaptação significativa |
| `OrcamentosModule.tsx` | Componente React | 302 | Precisa adaptação |
| `OrcamentoFormDialog.tsx` | Componente React | 303 | Precisa adaptação |
| `CatalogoDialog.tsx` | Componente React | 172 | Quase pronto |
| `WeatherWidget.tsx` | Componente React | 185 | Reaproveitável diretamente |
| `SaldoCard.tsx` | Componente React | 84 | Reaproveitável diretamente |
| `PeriodoSelector.tsx` | Componente React | 72 | Reaproveitável diretamente |
| `SettingsProvider.tsx` | Context Provider | 77 | Incompatível — substituir pelo BrandingProvider |
| `queries.ts` | Queries Supabase | 274 | Importar seletivamente |
| `orcamentoQueries.ts` | Queries Supabase | 235 | Importar com renomeação |
| `orcamentoPdf.ts` | Gerador PDF | 185 | Precisa adaptação + nova dep |
| `periodo.ts` | Utilitário | 173 | Precisa nova dep (`jspdf-autotable`) |
| `Index (1).tsx` | Dashboard Embio | 639 | Versão futura do Index.tsx Embio — revisar |
| `plan (1).md` | Documentação FF | 89 | Referência de design |
| `useAuth.ts` | Hook auth | 64 | **DESCARTAR** — usar Embio's |
| `client.ts` | Supabase client | 36 | **DESCARTAR** — usar Embio's |
| `auth-attacher.ts` | Middleware SSR | 16 | **DESCARTAR** — incompatível |
| `auth-middleware.ts` | Middleware SSR | 78 | **DESCARTAR** — incompatível |
| `use-mobile.tsx` | Hook utilitário | ~10 | **DESCARTAR** — duplicata |

---

## Schema Real do FF Instalações

### Tabelas existentes no FF (identificadas via queries.ts e orcamentoQueries.ts)

| Tabela | Campos identificados | Relacionamentos |
|--------|---------------------|-----------------|
| `clientes` | `id`, `user_id`, `nome`, `telefone`, `endereco`, `observacoes` | FK em `servicos`, `manutencoes`, `orcamentos` |
| `servicos` | `id`, `user_id`, `cliente_id`, `data`, `hora`, `tipo_servico`, `duracao`, `valor`, `status`, `forma_pagamento`, `desconto_cartao`, `valor_recebido`, `cidade` | FK → `clientes` |
| `caixa` | `id`, `user_id`, `tipo`, `descricao`, `valor`, `data`, `origem`, `servico_id`, `created_at` | FK → `servicos` (opcional) |
| `contas_futuras` | `id`, `user_id`, `tipo`, `descricao`, `valor`, `data_vencimento`, `status` | — |
| `manutencoes` | `id`, `user_id`, `cliente_id`, `servico_origem_id`, `tipo_servico`, `data_prevista`, `observacoes`, `status`, `updated_at` | FK → `clientes`, `servicos` |
| `configuracoes` | `id`, `user_id`, `nome_empresa`, `logo_url`, `cor_primaria`, `cor_secundaria` | — (1 por usuário) |
| `catalogo_itens` | `id`, `user_id`, `nome_item`, `descricao`, `categoria`, `unidade`, `valor_unitario`, `observacoes`, `updated_at` | FK em `orcamento_itens` |
| `orcamentos` | `id`, `user_id`, `cliente_id`, `numero_orcamento`, `data_orcamento`, `validade_orcamento`, `desconto`, `subtotal`, `valor_total`, `observacoes`, `status`, `servico_id`, `updated_at` | FK → `clientes`, `servicos` |
| `orcamento_itens` | `id`, `user_id`, `orcamento_id`, `item_id`, `nome_item_snapshot`, `valor_unitario_snapshot`, `quantidade`, `subtotal` | FK → `orcamentos`, `catalogo_itens` |

**Total: 9 tabelas no FF** (Embio tem 4)

---

## Análise Real por Módulo

---

### 1. `SaldoCard.tsx` ✅ REAPROVEITÁVEL DIRETAMENTE

**Dependências reais:**
- `lucide-react` → já instalado
- `localStorage` (persistência de visibilidade)
- Nenhuma tabela — recebe props `{ saldo, entradas, saidas }`

**Compatibilidade com Embio:** Total. É um componente de display puro.

**Alterações necessárias:** Nenhuma.

---

### 2. `PeriodoSelector.tsx` ✅ REAPROVEITÁVEL DIRETAMENTE

**Dependências reais:**
- `shadcn/ui Select`, `Input` → já instalados
- Importa types de `@/lib/periodo` → mover para `src/lib/periodo.ts`

**Compatibilidade com Embio:** Total. Componente de seleção de período puro.

**Alterações necessárias:** Apenas ajustar o import path de `@/lib/periodo`.

---

### 3. `WeatherWidget.tsx` ✅ REAPROVEITÁVEL DIRETAMENTE

**API usada:** **Open-Meteo** (`https://api.open-meteo.com/v1/forecast?...`)
> Nenhuma API Key necessária! Open-Meteo é completamente gratuito e aberto.

**Dependências reais:**
- `@tanstack/react-query` → já instalado
- `date-fns` + `ptBR` → já instalados
- `lucide-react` → já instalado
- `shadcn/ui Button` → já instalado
- Geolocation browser API (sem permissão obrigatória — usa fallback para Marechal C. Rondon)

**Default hardcoded:** `{ lat: -24.5557, lon: -54.0689, name: "Marechal C. Rondon" }`
> Esse default está hardcoded no componente. Precisará ser configurável se a empresa não for da região.

**Compatibilidade com Embio:** Total. Sem tabela.

**Alterações necessárias:** Mover o default de localização para `branding_settings` ou configuração.

---

### 4. `periodo.ts` ⚠️ PRECISA NOVA DEPENDÊNCIA

**Dependências reais:**
```typescript
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // ← NÃO instalado no Embio!
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
```

**`jspdf-autotable` ausente do Embio.** Necessário instalar.

**O que faz:**
- `PeriodoState` + `PeriodoTipo` — tipos de período
- `defaultPeriodoState()` — estado inicial (mes atual)
- `getPeriodoRange(p)` — converte estado em `{ start, end, label }`
- `filterByPeriodo(items, periodo, field)` — filtra array por período
- `gerarPDFTabela(opts)` — gera PDF com tabela (usa jspdf-autotable)
- `gerarPDFMultiSecao(opts)` — gera PDF com múltiplas seções
- `brl(n)` — formata número como R$ (duplicata de funcionalidade existente)

**Conflito:** `gerarPDFTabela` hardcoda "FF INSTALAÇÕES" no header do PDF — precisa adaptar para usar branding do Embio.

**Alterações necessárias:**
1. Instalar `jspdf-autotable`
2. Substituir "FF INSTALAÇÕES" pela `branding.company_name` do Embio
3. Renomear `brl` para evitar conflito (ou re-exportar de `lib/format.ts`)

---

### 5. `ClientesModule.tsx` ⚠️ CONFLITO DE SCHEMA

**Schema FF (`clientes`):**
```
nome, telefone, endereco, observacoes
```

**Schema Embio (`clients`):**
```
producer_name, property_name, location, production_type
```

**São tabelas completamente diferentes!** Campos em idiomas diferentes, propósitos diferentes.

**Dependências reais:**
- `@tanstack/react-query` → já instalado
- `@/lib/queries` (fetchClientes, createCliente, updateCliente, deleteCliente)
- `shadcn/ui` Dialog, Input, Textarea, Button → já instalados
- `lucide-react` → já instalado

**Compatibilidade:** Baixa. O módulo precisa de uma tabela com campos `nome`, `telefone`, `endereco`.

**Estratégia:**
- **OPÇÃO A** (recomendada): Criar tabela `clientes` do FF separada da `clients` Embio. Evita risco de quebrar funcionalidade existente.
- **OPÇÃO B**: Adicionar colunas `nome`, `telefone`, `endereco` na tabela `clients` existente e adaptar o módulo para usar `clients`.

---

### 6. `AgendaModule.tsx` ⚠️ PRECISA ADAPTAÇÃO MODERADA

**Dependências reais:**
- `@tanstack/react-query` → já instalado
- `@/lib/queries` (fetchServicos, fetchClientes, createServico, updateServico, deleteServico, marcarConcluido, createManutencao, marcarManutencaoAgendada)
- `PeriodoSelector`, `periodo` → de outros arquivos FF
- `shadcn/ui` Dialog, Select, Checkbox, Input, Button, Label → já instalados
- `lucide-react` → já instalado
- `date-fns` + `ptBR` → já instalado

**Tabelas necessárias:** `servicos`, `manutencoes`, `clientes` (FF)

**Funcionalidades:**
- Agendamento de serviços por cliente
- Filtros por período e status (todos/agendado/concluido)
- Conclusão de serviço com forma de pagamento e desconto cartão → gera entrada automática em `caixa`
- Programação de manutenção futura ao concluir
- Link para Google Agenda (deeplink, sem API)
- Relatório PDF via `gerarPDFTabela`
- Suporte a `prefill` (para abrir com cliente/tipo pré-selecionado)

**Dependência routing:**
Usa prop `prefill` e callbacks — NÃO importa rotas diretamente. Compatível com Embio.

**Alterações necessárias:**
1. Ajustar import de `@/lib/queries` → `@/lib/ff/queries`
2. Ajustar import de `PeriodoSelector` e `periodo`
3. Tabelas `servicos` e `manutencoes` devem existir

---

### 7. `FinanceiroModule.tsx` ⚠️ PRECISA ADAPTAÇÃO MODERADA

**Dependências reais:**
- `@tanstack/react-query` → já instalado
- `@/lib/queries` (fetchCaixa, createCaixaManual, deleteCaixaEntry, updateCaixaEntry)
- `SaldoCard`, `PeriodoSelector`, `periodo` (gerarPDFTabela, brl, filterByPeriodo, getPeriodoRange)
- `shadcn/ui` Dialog, Select, Input, AlertDialog, Button → já instalados
- `date-fns` + `ptBR` → já instalado

**Tabela necessária:** `caixa`

**Funcionalidades:**
- CRUD completo de lançamentos (entrada/saída)
- Filtro por período com `PeriodoSelector`
- Export PDF do extrato do período
- Saldo calculado em tempo real (entradas - saídas)

**Compatibilidade:** Alta. Sem conflito com dados Embio.

**Alterações necessárias:**
1. Ajustar imports
2. Tabela `caixa` deve existir

---

### 8. `OrcamentosModule.tsx` ⚠️ PRECISA ADAPTAÇÃO

**Dependências reais:**
- `@tanstack/react-query` → já instalado
- `@/lib/orcamentoQueries` (fetchOrcamentos, fetchOrcamentoItens, deleteOrcamento, updateOrcamentoStatus, converterOrcamentoEmServico)
- `OrcamentoFormDialog`, `CatalogoDialog` (outros módulos FF)
- `@/lib/orcamentoPdf` (gerarOrcamentoPDF)
- `useSettings()` → de `SettingsProvider` FF → **PROBLEMA**
- `sonner` (toast) → já instalado

**Conflito crítico com `useSettings()`:**
`OrcamentosModule` usa `useSettings()` para pegar `config.nome_empresa`, `config.logo_url`, `config.cor_primaria`, `config.cor_secundaria` — que vêm da tabela `configuracoes` do FF.

O Embio tem o equivalente em `useBranding()` com `branding.company_name`, `branding.logo_url`, `branding.primary_color`.

**Adaptação:** Substituir `useSettings()` por `useBranding()` e mapear os campos.

**Tabelas necessárias:** `orcamentos`, `orcamento_itens`, `catalogo_itens`, `clientes` (FF), `servicos`

---

### 9. `OrcamentoFormDialog.tsx` ✅ PRECISA ADAPTAÇÃO LEVE

**Dependências reais:**
- `@tanstack/react-query` → já instalado
- `fetchClientes` de `@/lib/queries` (tabela `clientes` FF)
- `fetchCatalogo`, `createOrcamento`, `updateOrcamento`, `fetchOrcamentoItens` de `@/lib/orcamentoQueries`
- `shadcn/ui` Dialog, Input, Textarea, Select, Button, Label → já instalados
- `sonner` (toast) → já instalado

**Lógica:** 3 passos (cliente → itens do catálogo → resumo com desconto). Sólido e bem estruturado.

**Alterações necessárias:** Apenas ajustar import paths.

---

### 10. `CatalogoDialog.tsx` ✅ QUASE PRONTO

**Dependências reais:**
- `@tanstack/react-query` → já instalado
- `@/lib/orcamentoQueries` (fetchCatalogo, createCatalogoItem, updateCatalogoItem, deleteCatalogoItem)
- `shadcn/ui` Dialog, Input, Textarea, Button, Label → já instalados
- `sonner` (toast) → já instalado

**Sem dependências de roteamento ou contexto externo.** Altamente isolado.

**Alterações necessárias:** Apenas ajustar import path de `orcamentoQueries`.

---

### 11. `DashboardModule.tsx` ⚠️ PRECISA ADAPTAÇÃO SIGNIFICATIVA

**Dependências reais:**
- `@tanstack/react-query` → já instalado
- `@/lib/queries` (fetchCaixa, fetchServicos, fetchManutencoes)
- `SaldoCard`, `WeatherWidget`
- `@/routes/_authenticated/index` → **INCOMPATÍVEL COM EMBIO**

```typescript
import type { AgendaPrefill } from "@/routes/_authenticated/index";
```

Este import vai **falhar** no Embio (usa TanStack Router, não existe no projeto).

**Solução:** Definir o tipo `AgendaPrefill` localmente no arquivo.

**Tabelas necessárias:** `caixa`, `servicos`, `manutencoes`

**Alterações necessárias:**
1. Remover import de `@/routes/_authenticated/index`
2. Definir `AgendaPrefill` localmente: `type AgendaPrefill = { cliente_id: string; tipo_servico: string; manutencao_id?: string }`
3. Ajustar imports de queries e subcomponentes

---

### 12. `SettingsProvider.tsx` ❌ INCOMPATÍVEL — SUBSTITUIR

**Dependências reais:**
```typescript
import { hexToOklchString } from "@/lib/colorUtils"; // ← ARQUIVO NÃO ENVIADO!
```

**Problema duplo:**
1. Importa `colorUtils.ts` que NÃO está nos arquivos enviados
2. Usa tabela `configuracoes` (FF) em vez de `branding_settings` (Embio)
3. Usa OKLCH para CSS vars (`hexToOklchString`) — o Embio usa HSL

**Funcionalidade:**
- Lê `configuracoes` do Supabase
- Aplica CSS vars `--primary`, `--secondary`, `--accent`, `--ring` via OKLCH
- Expõe `useSettings()` com `{ config, isLoading, refetch }`

**O Embio já tem o equivalente completo:** `BrandingProvider` + `useBranding()` + conversão HSL.

**Ação:** NÃO importar o `SettingsProvider` do FF. Onde módulos FF usam `useSettings()`, substituir por `useBranding()` com mapeamento de campos.

---

### 13. `queries.ts` — IMPORTAR SELETIVAMENTE

**Tabelas acessadas:**
`clientes`, `servicos`, `caixa`, `contas_futuras`, `manutencoes`, `configuracoes`

**Usar como:** `src/lib/ff/queries.ts` — arquivo intacto, apenas mover de localização.

**Conflito de tipos:** Usa `Database["public"]["Tables"]["clientes"]["Row"]` — requer atualização do `types.ts` do Supabase após criar as novas tabelas.

---

### 14. `orcamentoQueries.ts` — IMPORTAR COM RENOMEAÇÃO

**Tabelas acessadas:** `catalogo_itens`, `orcamentos`, `orcamento_itens`, `servicos`, `clientes`

**Funcionalidade especial:** `converterOrcamentoEmServico()` — cria `servicos` a partir de `orcamentos`.

**Usar como:** `src/lib/ff/orcamentoQueries.ts`

---

### 15. `orcamentoPdf.ts` ⚠️ PRECISA NOVA DEPENDÊNCIA + ADAPTAÇÃO

**Dependências reais:**
```typescript
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // ← NÃO instalado no Embio!
import type { Orcamento, OrcamentoItem } from "./orcamentoQueries";
```

**O que gera:** PDF premium com cabeçalho colorido, logo, tabela de itens, resumo financeiro.

**Aceita `empresa` com:**
```typescript
{ nome, telefone?, logoUrl?, corPrimaria?, corSecundaria? }
```

**Adaptação para Embio:** Substituir `empresa` de `useSettings()` por dados de `useBranding()`:
- `config.nome_empresa` → `branding.company_name`
- `config.logo_url` → `branding.logo_url`
- `config.cor_primaria` → `#${hslToHex(branding.primary_color)}` (conversão necessária)

---

### 16. `Index (1).tsx` — VERSÃO FUTURA DO EMBIO INDEX

**Achado inesperado:** Este arquivo é uma versão atualizada do `pages/Index.tsx` do Embio (644 linhas). Usa `useAuth`, `useBranding`, `supabase`, tabela `quotes` — tudo Embio.

**Diferença principal:**
```javascript
const quickActions = [
  { to: "/novo-orcamento", label: "Novo orçamento", icon: Plus },
  { to: "/clientes", label: "Clientes", icon: Users },   // ← rota nova, não existe hoje
  { to: "/configuracoes-marca", label: "Marca", icon: Palette },
  { to: "/instrucoes-preparo", label: "Preparo", icon: BookOpen },  // ← rota diferente
];
```

**Ação:** Comparar com `Index.tsx` atual antes de qualquer uso.

---

### 17. Arquivos a DESCARTAR

| Arquivo | Motivo |
|---------|--------|
| `auth-attacher.ts` | Usa `@tanstack/react-start` (SSR) — incompatível com Vite SPA |
| `auth-middleware.ts` | Usa `@tanstack/react-start/server` — incompatível com Vite SPA |
| `useAuth.ts` | Embio tem `useAuth.tsx` mais completo (com contexto, Provider) |
| `client.ts` | Usa Proxy lazy + SSR fallback — Embio tem versão mais simples e adequada |
| `use-mobile.tsx` | Duplicata exata do `hooks/use-mobile.tsx` do Embio |

---

## Mapa de Dependências entre Módulos FF

```
queries.ts ←── ClientesModule
            └── AgendaModule (fetchServicos, fetchClientes, marcarConcluido, ...)
            └── FinanceiroModule (fetchCaixa, ...)
            └── DashboardModule (fetchCaixa, fetchServicos, fetchManutencoes)

orcamentoQueries.ts ←── OrcamentosModule
                    └── OrcamentoFormDialog
                    └── CatalogoDialog

periodo.ts ──→ PeriodoSelector (tipos)
           └── FinanceiroModule (filterByPeriodo, getPeriodoRange, gerarPDFTabela, brl)
           └── AgendaModule (filterByPeriodo, getPeriodoRange, gerarPDFTabela, brl)

SettingsProvider ──→ OrcamentosModule (useSettings → empresa para PDF)
                                                   ↑ SUBSTITUIR por useBranding()

SaldoCard ←── FinanceiroModule
          └── DashboardModule

WeatherWidget ←── DashboardModule
```

---

## Dependências Novas Necessárias no Embio

| Pacote | Motivo | Já instalado? |
|--------|--------|--------------|
| `jspdf-autotable` | `periodo.ts` + `orcamentoPdf.ts` | ❌ NÃO |

**Nenhuma outra dependência nova.** Todas as demais já estão instaladas no Embio.

---

## Mapa de Conflitos Reais

| # | Conflito | Tipo | Resolução |
|---|---------|------|-----------|
| C1 | `clientes` (FF) vs `clients` (Embio) | CRÍTICO — schemas incompatíveis | Criar tabela `clientes` FF separada |
| C2 | `configuracoes` (FF) vs `branding_settings` (Embio) | CRÍTICO — mesmo propósito, schemas diferentes | NÃO criar `configuracoes`; substituir `useSettings()` por `useBranding()` |
| C3 | `DashboardModule` importa `@/routes/_authenticated/index` | CRÍTICO — arquivo não existe no Embio | Remover import; definir tipo localmente |
| C4 | `SettingsProvider` importa `colorUtils.ts` | CRÍTICO — arquivo não enviado | NÃO usar SettingsProvider |
| C5 | `orcamentoPdf.ts` vs `quotePdf.ts` | MÉDIO — dois geradores de PDF | Manter separados; FF → `ffOrcamentoPdf.ts` |
| C6 | `useAuth.ts` (FF) vs `useAuth.tsx` (Embio) | MÉDIO — APIs diferentes | Descartar FF; usar Embio |
| C7 | `client.ts` (FF) vs `client.ts` (Embio) | MÉDIO — implementações diferentes | Descartar FF; usar Embio |
| C8 | Toast: `sonner` direto (FF) vs `useToast()` (Embio) | BAIXO — ambos instalados | Ambos funcionam; padronizar em nova fase |
| C9 | QueryKey `"clientes"` (FF) vs (inexistente) no Embio | BAIXO — sem colisão | Nenhum |
| C10 | `brl()` em `periodo.ts` duplica funcionalidade de `format.ts` | BAIXO | Reusar `lib/format.ts` ou manter por ora |

---

## Resumo: Reaproveitável vs Adaptação

### Reaproveitável diretamente (zero ou mínima mudança)
| Módulo | Ação |
|--------|------|
| `SaldoCard.tsx` | Copiar para `src/components/ff/` sem alteração |
| `PeriodoSelector.tsx` | Copiar para `src/components/ff/`, ajustar 1 import |
| `WeatherWidget.tsx` | Copiar para `src/components/ff/`, considerar default de localização |
| `CatalogoDialog.tsx` | Copiar para `src/components/ff/`, ajustar 1 import |

### Precisa adaptação leve (< 30 min cada)
| Módulo | Ação |
|--------|------|
| `periodo.ts` | Instalar `jspdf-autotable`, substituir "FF INSTALAÇÕES" por branding, copiar para `src/lib/` |
| `orcamentoPdf.ts` | Instalar `jspdf-autotable`, substituir `useSettings()` por `useBranding()`, renomear `ffOrcamentoPdf.ts` |
| `OrcamentoFormDialog.tsx` | Ajustar imports de path, copiar para `src/components/ff/` |

### Precisa adaptação moderada (30–120 min cada)
| Módulo | Ação |
|--------|------|
| `ClientesModule.tsx` | Adaptar para schema da tabela `clientes` (FF, nova) |
| `FinanceiroModule.tsx` | Ajustar imports; requer tabela `caixa` criada |
| `OrcamentosModule.tsx` | Substituir `useSettings()` por `useBranding()` com mapeamento de campos |
| `DashboardModule.tsx` | Remover import inválido; ajustar imports restantes |
| `queries.ts` | Mover para `src/lib/ff/queries.ts`; aguardar `types.ts` ser regenerado |
| `orcamentoQueries.ts` | Mover para `src/lib/ff/orcamentoQueries.ts` |

### Precisa adaptação significativa ou substituição
| Módulo | Ação |
|--------|------|
| `AgendaModule.tsx` | Ajustar imports + requer `servicos` e `manutencoes` |
| `SettingsProvider.tsx` | **NÃO usar** — substituir completamente por `useBranding()` |

---

## Arquivo Missing: `colorUtils.ts`

`SettingsProvider.tsx` importa:
```typescript
import { hexToOklchString } from "@/lib/colorUtils";
```
Este arquivo **não foi enviado**. O Embio tem função similar (`hexToHsl`) mas em formato diferente (HSL vs OKLCH). Como o `SettingsProvider` não será usado, isso não bloqueia a integração.

---

## Tabelas Novas Necessárias

| Tabela FF | Módulos dependentes | Schema mínimo |
|-----------|-------------------|---------------|
| `clientes` | ClientesModule, AgendaModule, OrcamentosModule, OrcamentoFormDialog | `id, user_id, nome, telefone, endereco, observacoes, created_at, updated_at` |
| `servicos` | AgendaModule, DashboardModule, queries.ts, orcamentoQueries.ts | `id, user_id, cliente_id FK, data, hora, tipo_servico, duracao, valor, status, forma_pagamento, desconto_cartao, valor_recebido, cidade, created_at, updated_at` |
| `caixa` | FinanceiroModule, DashboardModule, queries.ts | `id, user_id, tipo, descricao, valor, data, origem, servico_id FK, created_at` |
| `contas_futuras` | queries.ts (marcarContaPagaComCaixa) | `id, user_id, tipo, descricao, valor, data_vencimento, status, created_at` |
| `manutencoes` | AgendaModule, DashboardModule | `id, user_id, cliente_id FK, servico_origem_id FK, tipo_servico, data_prevista, observacoes, status, created_at, updated_at` |
| `catalogo_itens` | CatalogoDialog, OrcamentoFormDialog | `id, user_id, nome_item, descricao, categoria, unidade, valor_unitario, observacoes, created_at, updated_at` |
| `orcamentos` | OrcamentosModule, OrcamentoFormDialog | `id, user_id, cliente_id FK, numero_orcamento, data_orcamento, validade_orcamento, desconto, subtotal, valor_total, observacoes, status, servico_id FK, created_at, updated_at` |
| `orcamento_itens` | OrcamentoFormDialog, orcamentoQueries | `id, user_id, orcamento_id FK, item_id FK nullable, nome_item_snapshot, valor_unitario_snapshot, quantidade, subtotal` |

**Tabelas Embio existentes — SEM alteração necessária:** `profiles`, `clients`, `quotes`, `branding_settings`

> ⚠️ **DECISÃO IMPORTANTE**: A tabela `clientes` do FF é NOVA, distinta de `clients` do Embio. Não devem ser unificadas — schemas incompatíveis, semânticas diferentes. A tabela `clients` do Embio continua intocada.

---

## Riscos Identificados

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| `types.ts` desatualizado após criar tabelas FF | Alta | Alto | Regenerar `types.ts` via Supabase CLI após cada migration |
| `orcamentoPdf.ts` usar `useBranding` com campo `primary_color` em formato HSL | Alta | Médio | Converter HSL → HEX usando `hslToHex()` já existente em `useBranding.tsx` |
| QueryKey `"clientes"` do FF colidir com eventual migração futura | Baixa | Baixo | Prefixar com `"ff-clientes"` para distinguir de `clients` Embio |
| WeatherWidget com localização padrão incorreta para o cliente | Média | Baixo | Adicionar campo `city_lat_lon` em `branding_settings` |
| `numero_orcamento` gerado client-side pode ter colisão em multi-usuário | Baixa | Médio | Usar `count(*)` com `WHERE user_id = auth.uid()` — já implementado assim |
| `contas_futuras` tem apenas referência manual em `queries.ts` — nenhum componente de UI enviado | Alta | Baixo | Criar componente ou importar em fase posterior |

---

## Status Final por Módulo

| Módulo | Código recebido | Conflitos | Dep. nova | Pronto para integrar |
|--------|----------------|-----------|----------|---------------------|
| `SaldoCard` | ✅ | Nenhum | Não | ✅ Fase 1 |
| `PeriodoSelector` | ✅ | Nenhum | Não | ✅ Fase 1 |
| `WeatherWidget` | ✅ | Localização default | Não | ✅ Fase 1 |
| `periodo.ts` | ✅ | Branding FF hardcoded | jspdf-autotable | ⚠️ Fase 1 (ajuste) |
| `orcamentoPdf.ts` | ✅ | useSettings→useBranding | jspdf-autotable | ⚠️ Fase 3 |
| `CatalogoDialog` | ✅ | Nenhum | Não | ✅ Fase 3 |
| `OrcamentoFormDialog` | ✅ | Imports | Não | ⚠️ Fase 3 |
| `OrcamentosModule` | ✅ | useSettings→useBranding | Não | ⚠️ Fase 3 |
| `ClientesModule` | ✅ | Schema diferente de clients | Não | ⚠️ Fase 2 |
| `FinanceiroModule` | ✅ | Imports | Não | ⚠️ Fase 5 |
| `AgendaModule` | ✅ | Imports | Não | ⚠️ Fase 4 |
| `DashboardModule` | ✅ | Import inválido (TanStack Router) | Não | ⚠️ Fase 6 |
| `SettingsProvider` | ✅ | colorUtils ausente + conf. table | Não | ❌ NÃO USAR |
| `queries.ts` | ✅ | types.ts desatualizado | Não | ⚠️ Após migrations |
| `orcamentoQueries.ts` | ✅ | types.ts desatualizado | Não | ⚠️ Após migrations |
| `useAuth.ts` | ✅ | API diferente do Embio | Não | ❌ DESCARTAR |
| `client.ts` | ✅ | SSR pattern incompatível | Não | ❌ DESCARTAR |
| `auth-attacher.ts` | ✅ | TanStack Start (SSR) | Não | ❌ DESCARTAR |
| `auth-middleware.ts` | ✅ | TanStack Start (SSR) | Não | ❌ DESCARTAR |
| `use-mobile.tsx` | ✅ | Duplicata exata | Não | ❌ DESCARTAR |
