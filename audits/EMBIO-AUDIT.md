# EMBIO-AUDIT.md — Auditoria Completa do Embio AgroCalc

**Status**: CONCLUÍDA  
**Data**: 2026-06-23  
**Responsável**: Agente Líder  
**Versão auditada**: Código exportado do Lovable (extraído em `/` e `/src/`)

---

## 1. Mapa Completo da Arquitetura

```
Embio Comercial Pro (SPA)
├── Runtime: React 18.3 + TypeScript 5.8
├── Build: Vite 5.4 + SWC
├── Estilo: Tailwind CSS 3.4 + shadcn/ui (Radix UI)
├── Roteamento: React Router DOM 6.30
├── Estado servidor: TanStack Query (React Query) 5.83
├── Auth: Supabase Auth (email/password)
├── Banco: Supabase PostgreSQL (4 tabelas)
├── Storage: Supabase Storage (1 bucket)
├── PDF: jsPDF 4.2
├── i18n: i18next 26 (PT + EN)
└── [LOVABLE] lovable-tagger (dependência a remover)

Camada de Providers (App.tsx)
└── QueryClientProvider
    └── TooltipProvider
        └── BrowserRouter
            └── AuthProvider        ← Supabase Auth state
                └── BrandingProvider ← branding_settings + CSS vars
                    └── Routes
                        ├── /auth   → sem proteção
                        └── /*      → ProtectedRoute → Layout → páginas
```

---

## 2. Mapa de Páginas (Rotas Ativas)

| Rota | Arquivo | Descrição | Complexidade |
|------|---------|-----------|-------------|
| `/auth` | `pages/Auth.tsx` | Login + Cadastro (email/senha) | Baixa |
| `/` | `pages/Index.tsx` | Dashboard principal | **Alta** |
| `/novo-orcamento` | `pages/NovoOrcamento.tsx` | Formulário de orçamento | Média |
| `/meus-clientes` | `pages/MeusClientes.tsx` | Lista de clientes/orçamentos | Média |
| `/instrucoes` | `pages/InstrucoesPreparo.tsx` | Instruções de uso e preparo | Baixa |
| `/configuracoes-marca` | `pages/ConfiguracoesMarca.tsx` | Personalização visual e dados | Média |
| `/produtos/embio-3100` | `pages/produtos/Embio3100.tsx` | Info + calculadora 3100 | Baixa |
| `/produtos/embio-3000` | `pages/produtos/Embio3000.tsx` | Info + calculadora 3000 | Baixa |
| `/produtos/embio-6000` | `pages/produtos/Embio6000.tsx` | Info + calculadora 6000 | Baixa |
| `/produtos/embio-5000` | `pages/produtos/Embio5000.tsx` | Info + calculadora 5000+ | Baixa |
| `/produtos/embio-8000` | `pages/produtos/Embio8000.tsx` | Info + calculadora 8000 | Baixa |
| `/propulsores/3cv` | `pages/propulsores/Propulsor3CV.tsx` | Especificações 3CV | Baixa |
| `/propulsores/4cv` | `pages/propulsores/Propulsor4CV.tsx` | Especificações 4CV | Baixa |
| `/propulsores/5cv` | `pages/propulsores/Propulsor5CV.tsx` | Especificações 5CV + info | Baixa |
| `/propulsores/7-5cv` | `pages/propulsores/Propulsor75CV.tsx` | Especificações 7,5CV (suíno/bovino) | Baixa |
| `/propulsores/10cv` | `pages/propulsores/Propulsor10CV.tsx` | Especificações 10CV + avisos de multi-máquina | Baixa |
| `*` | `pages/NotFound.tsx` | Página 404 | Baixíssima |

### Páginas Órfãs — EXISTEM mas NÃO TÊM ROTA

| Arquivo | Descrição | Situação |
|---------|-----------|----------|
| `pages/Embiofert.tsx` | Página do produto Embiofert (fertirrigação) | Sem rota em App.tsx |
| `pages/Dimensionamento3100.tsx` | Calculadora standalone do 3100 | Sem rota em App.tsx |
| `pages/DimensionamentoPropulsor.tsx` | Calculadoras 3000/8000/6000/5000+ em tabs | Sem rota em App.tsx |

---

## 3. Mapa de Componentes

### Componentes de Layout
| Arquivo | Papel | Usa Branding |
|---------|-------|-------------|
| `components/Layout.tsx` | Wrapper: sidebar + header (logo, idioma, usuário, logout) | Sim |
| `components/AppSidebar.tsx` | Menu lateral colapsível com produtos e propulsores | Sim (logo, app_name, slogan) |
| `components/NavLink.tsx` | Link com classe ativa detectada por React Router | Não |
| `components/ProtectedRoute.tsx` | Guard: redireciona para `/auth` se não autenticado | Não |
| `components/CompanyFooter.tsx` | Rodapé com nome, CNPJ, endereço, telefone/WhatsApp | Sim |
| `components/WhatsAppButton.tsx` | Botão flutuante de WhatsApp | Sim (usa branding.phone) |

### Componentes Funcionais
| Arquivo | Papel |
|---------|-------|
| `components/calculators/CalculatorCard.tsx` | Calculadora genérica reutilizável com exportação WhatsApp |

### Componentes do Dashboard (Órfãos — NÃO usados no Index.tsx atual)
| Arquivo | Situação |
|---------|----------|
| `components/dashboard/EfficiencyChart.tsx` | Não importado em nenhuma página |
| `components/dashboard/PreparationTimeline.tsx` | Não importado em nenhuma página |
| `components/dashboard/StatsCards.tsx` | Não importado em nenhuma página |
| `components/dashboard/SustainabilityCard.tsx` | Não importado em nenhuma página |

### Componentes UI (shadcn/ui — não editar)
Biblioteca completa do shadcn/ui instalada em `components/ui/`: accordion, alert, alert-dialog, aspect-ratio, avatar, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, form, hover-card, input, input-otp, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, switch, table, tabs, textarea, toast, toaster, toggle, toggle-group, tooltip.

---

## 4. Hooks e Contextos

### Hooks de Contexto (Providers)
| Hook | Arquivo | O que expõe |
|------|---------|-------------|
| `useAuth` | `hooks/useAuth.tsx` | `user`, `session`, `loading`, `signIn`, `signUp`, `signOut` |
| `useBranding` | `hooks/useBranding.tsx` | `branding`, `loading`, `save`, `reset`, `uploadLogo`, `refresh` |

### Funções Exportadas de useBranding.tsx
- `hexToHsl(hex)` → converte hex para HSL (para CSS vars)
- `hslToHex(hsl)` → inverso
- `hslToRgb(hsl)` → retorna [r, g, b] para uso no jsPDF
- `generatedByText(branding)` → texto "Gerado por NomeEmpresa"
- `BrandingProvider` → aplica CSS vars em `document.documentElement` ao carregar/salvar

### Hooks Utilitários
| Hook | Arquivo | Função |
|------|---------|--------|
| `use-mobile` | `hooks/use-mobile.tsx` | Detecta breakpoint mobile (768px) |
| `use-toast` | `hooks/use-toast.ts` | Sistema de notificações toast |

---

## 5. Integrações e Serviços

### Supabase Client
- **Arquivo**: `src/integrations/supabase/client.ts`
- **Variáveis de ambiente**: `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY`
- Auth com `localStorage`, `persistSession: true`, `autoRefreshToken: true`
- Tipado com `Database` gerado automaticamente pelo Lovable

### i18n
- **Arquivo**: `src/i18n/index.ts`
- Idiomas: `pt` (padrão) e `en`
- Detecção automática pelo browser (`i18next-browser-languagedetector`)
- Toggle de idioma no header do Layout
- Todas as strings de UI são internacionalizadas

### WhatsApp (deeplink direto)
- Usado em: `NovoOrcamento.tsx`, `MeusClientes.tsx`, `CalculatorCard.tsx`
- Padrão: `https://wa.me/?text=<encoded>`
- Suporte técnico: `https://wa.me/5545999317831` (número **hardcoded** no AppSidebar)

---

## 6. Utilitários

| Arquivo | Funções |
|---------|---------|
| `lib/format.ts` | `formatCnpj()`, `formatPhone()`, `waLink()`, `telLink()`, `onlyDigits()` |
| `lib/quotePdf.ts` | `generateQuotePdf(quote, branding)` → retorna `jsPDF` para `.save()` |
| `lib/utils.ts` | `cn()` (clsx + tailwind-merge — padrão shadcn/ui) |

---

## 7. Tabelas Supabase

### Tabela: `profiles`
| Coluna | Tipo | Notas |
|--------|------|-------|
| `id` | UUID PK | auto gen |
| `user_id` | UUID FK UNIQUE | → auth.users, ON DELETE CASCADE |
| `full_name` | TEXT nullable | |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | trigger auto-update |

RLS: SELECT/INSERT/UPDATE por `auth.uid() = user_id`. Sem DELETE policy.  
Trigger: `on_auth_user_created` — cria perfil automaticamente no signup.

---

### Tabela: `clients`
| Coluna | Tipo | Notas |
|--------|------|-------|
| `id` | UUID PK | |
| `user_id` | UUID FK | → auth.users, ON DELETE CASCADE |
| `producer_name` | TEXT NOT NULL | |
| `property_name` | TEXT nullable | |
| `location` | TEXT nullable | |
| `production_type` | TEXT NOT NULL | |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | trigger auto-update |

RLS: SELECT/INSERT/UPDATE/DELETE por `auth.uid() = user_id`.  
**Observação**: Esta tabela existe mas **raramente é usada**. O `client_id` na tabela `quotes` está sempre NULL — clientes são identificados por `empresa_name` na prática.

---

### Tabela: `quotes`
| Coluna | Tipo | Notas |
|--------|------|-------|
| `id` | UUID PK | |
| `user_id` | UUID FK | → auth.users, ON DELETE CASCADE |
| `client_id` | UUID FK nullable | → clients(id), ON DELETE SET NULL — **nunca preenchido pelo formulário** |
| `numero_pedido` | TEXT | auto-gerado via trigger: `#1831456`, `#1831457`... |
| `producer_name` | TEXT NOT NULL | nome do produtor |
| `empresa_name` | TEXT nullable | nome da empresa (campo principal usado na UI) |
| `responsavel` | TEXT nullable | |
| `property_name` | TEXT nullable | |
| `location` | TEXT nullable | |
| `production_type` | TEXT NOT NULL | ex: "bovino", "suino", "geral" |
| `aplicacao` | TEXT nullable | ex: "bovino" ou "suino" |
| `product_name` | TEXT DEFAULT '' | lista de aditivos em texto |
| `input_value` | INTEGER DEFAULT 0 | **sempre salvo como 0 — pricing não implementado** |
| `frascos` | INTEGER DEFAULT 0 | total de frascos de aditivos |
| `frequencia` | TEXT DEFAULT '' | **sempre salvo como '' — campo vazio** |
| `detalhes` | TEXT nullable | texto formatado WhatsApp |
| `propulsores_json` | JSONB DEFAULT '[]' | array de objetos PropulsorEntry |
| `aditivos_json` | JSONB DEFAULT '[]' | array de objetos AditivoEntry |
| `forma_envio` | TEXT nullable | "retirar" / "transportadora" / "correios" |
| `forma_pagamento` | TEXT nullable | texto livre |
| `observacoes` | TEXT nullable | |
| `status` | TEXT DEFAULT 'em_aberto' | "em_aberto" / "fechado" / "finalizado" |
| `created_at` | TIMESTAMPTZ | |

RLS: SELECT/INSERT/UPDATE/DELETE por `auth.uid() = user_id`.

**Estrutura dos JSONs:**
```typescript
// propulsores_json
{ modelo: string; voltagem: string; fase: string; caixaEletrica: string; aplicacao: string; quantidade: number }[]

// aditivos_json
{ produto: string; quantidade: number }[]
// produto = "Embio 3000" | "Embio 3100" | "Embio 5000+" | "Embio 6000" | "Embio 8000"
```

---

### Tabela: `branding_settings`
| Coluna | Tipo | Notas |
|--------|------|-------|
| `id` | UUID PK | |
| `user_id` | UUID UNIQUE | 1 registro por usuário |
| `app_name` | TEXT DEFAULT 'SUA LOGO AQUI' | |
| `slogan` | TEXT nullable | |
| `company_name` | TEXT nullable | aparece nos PDFs como "Gerado por..." |
| `logo_url` | TEXT nullable | URL pública do Storage |
| `primary_color` | TEXT nullable | formato HSL: "210 70% 25%" |
| `accent_color` | TEXT nullable | formato HSL |
| `background_color` | TEXT nullable | formato HSL |
| `cnpj` | TEXT nullable | formatado: "00.000.000/0000-00" |
| `address` | TEXT nullable | endereço completo |
| `phone` | TEXT nullable | formatado: "(00) 00000-0000" |
| `phone_is_whatsapp` | BOOLEAN DEFAULT false | |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | trigger auto-update |

RLS: SELECT/INSERT/UPDATE/DELETE por `auth.uid() = user_id`.  
**Operação**: UPSERT com `onConflict: "user_id"` — uma linha por usuário.

---

## 8. Storage Supabase

### Bucket: `branding-logos`
- **Tipo**: Público (`public: true`)
- **Caminho de upload**: `{user_id}/logo-{timestamp}.{ext}`
- **URL**: pública via `getPublicUrl()`
- **Policies**: leitura pública; upload/update/delete somente pelo próprio usuário (verifica `storage.foldername(name)[1] = auth.uid()`)

---

## 9. Migrations (Histórico Completo)

| Arquivo | Data | O que fez |
|---------|------|-----------|
| `20260209_...sql` | Fev 2026 | Criou `profiles`, `clients`, `quotes` + RLS + triggers de auto-profile e updated_at |
| `20260217_...sql` | Fev 2026 | Adicionou `status` em quotes + policy de UPDATE |
| `20260320_...sql` | Mar 2026 | Adicionou 8 colunas em quotes: empresa_name, responsavel, aplicacao, propulsores_json, aditivos_json, forma_envio, forma_pagamento, observacoes |
| `20260330_...194126.sql` | Mar 2026 | Criou sequence e trigger para `numero_pedido` (#1831456+) |
| `20260330_...194132.sql` | Mar 2026 | Recriou a function `generate_quote_order_number` com `SECURITY INVOKER` e `search_path = public` |
| `20260526_...191527.sql` | Mai 2026 | Criou `branding_settings`, bucket `branding-logos`, e todas as políticas de storage |
| `20260526_...192512.sql` | Mai 2026 | Adicionou `slogan` e `company_name` em branding_settings |
| `20260526_...200506.sql` | Mai 2026 | Adicionou `cnpj`, `address`, `phone`, `phone_is_whatsapp` em branding_settings |

---

## 10. Regras de Negócio e Cálculos

### Dimensionamento de Produtos (fórmulas fixas, sem banco)

| Produto | Entrada | Fórmula Frascos | Frequência |
|---------|---------|-----------------|------------|
| Embio 3100 | Nº de animais | `ceil(animais / 1000)` | 15 em 15 dias |
| Embio 3000 | Volume m³ | `ceil(m3 / 700)` | 15 em 15 dias |
| Embio 8000 | Volume m³ | `ceil(m3 / 700)` | 15 em 15 dias |
| Embio 6000 | Nº de animais | `ceil(animais / 1000)` | 10 em 10 dias |
| Embio 5000+ | Nº de baias | `ceil(baias / 60)` | Semanal |

**Regra de meia dose**: `porAplicacao = ceil(frascos / 2)` — metade na 1ª aplicação, restante na próxima.

### Regras de Seleção de Propulsores

| Modelo | Dejeto | Capacidade | Alerta |
|--------|--------|------------|--------|
| 3CV | Suíno APENAS | até 400 m³ | — |
| 4CV | Suíno APENAS | 401–800 m³ | — |
| 5CV | Suíno APENAS | 401–800 m³ | Mesmas dimensões do 4CV, mais folga |
| 7,5CV | Suíno | 801–1.500 m³ | — |
| 7,5CV | Bovino | 801–1.000 m³ | — |
| 10CV | Suíno | 1.501–2.200 m³ | >2.200m³: cotar 2+ máquinas |
| 10CV | Bovino | 1.001–2.000 m³ | >2.000m³: cotar 2+ máquinas |
| **3/4/5CV** | **Bovino** | **PROIBIDO** | ⚠️ Aviso explícito em todas as páginas de propulsores |

### Fluxo de Orçamento
```
1. Usuário preenche: empresa, localidade, responsável
2. Adiciona propulsores (modelo, voltagem, fase, caixa elétrica, aplicação, qtd)
3. Adiciona aditivos (produto Embio, quantidade frascos)
4. Define forma de envio e pagamento
5. (Opcional) Observações adicionais
6. Ações disponíveis:
   a. Salvar → INSERT em quotes + número pedido gerado
   b. Baixar PDF → generateQuotePdf() → .pdf local
   c. Enviar WhatsApp → deeplink com texto formatado
```

### Fluxo de Status de Orçamento
```
em_aberto → fechado (aprovado) → finalizado
               ↗                      ↘
         (mudança manual em             (mudança manual em
          MeusClientes.tsx)              MeusClientes.tsx)
```

---

## 11. Funcionalidades Prontas e Funcionais

| Funcionalidade | Status | Localização |
|----------------|--------|-------------|
| Login e Cadastro (email/senha) | ✅ Completo | Auth.tsx |
| Logout | ✅ Completo | Layout.tsx |
| Rota protegida | ✅ Completo | ProtectedRoute.tsx |
| Dashboard com métricas | ✅ Completo | Index.tsx |
| Gráfico de evolução (30 dias) | ✅ Completo | Index.tsx + recharts |
| Gráfico pizza de status | ✅ Completo | Index.tsx + recharts |
| Contadores animados | ✅ Completo | Index.tsx (useCountUp) |
| Novo orçamento com propulsores + aditivos | ✅ Completo | NovoOrcamento.tsx |
| Exportação de orçamento em PDF | ✅ Completo | quotePdf.ts |
| Exportação de orçamento via WhatsApp | ✅ Completo | NovoOrcamento.tsx |
| Lista de clientes agrupada por empresa | ✅ Completo | MeusClientes.tsx |
| Atualização de status de orçamento | ✅ Completo | MeusClientes.tsx |
| Re-envio de orçamento via WhatsApp | ✅ Completo | MeusClientes.tsx |
| Download de PDF de orçamento salvo | ✅ Completo | MeusClientes.tsx |
| Cópia de resumo do orçamento | ✅ Completo | MeusClientes.tsx |
| Cópia do número do pedido | ✅ Completo | MeusClientes.tsx |
| Personalização visual (cores, logo, dados empresa) | ✅ Completo | ConfiguracoesMarca.tsx |
| Logo no header, sidebar e PDFs | ✅ Completo | Layout + AppSidebar + quotePdf |
| Cores dinâmicas via CSS vars | ✅ Completo | BrandingProvider |
| Upload de logo para Supabase Storage | ✅ Completo | useBranding.tsx |
| Marca d'água com logo no PDF | ✅ Completo | quotePdf.ts |
| Rodapé da empresa no PDF e nas páginas | ✅ Completo | CompanyFooter.tsx + quotePdf.ts |
| Calculadoras de dimensionamento (todos os produtos) | ✅ Completo | CalculatorCard.tsx + páginas de produto |
| Especificações técnicas de propulsores | ✅ Completo | páginas /propulsores/* |
| Instruções de uso e preparo | ✅ Completo | InstrucoesPreparo.tsx |
| Internacionalização PT/EN | ✅ Completo | i18n/ + react-i18next |
| Toggle de idioma | ✅ Completo | Layout.tsx |
| Suporte técnico via WhatsApp | ✅ Completo | AppSidebar.tsx |
| Número de pedido automático (#1831456+) | ✅ Completo | trigger SQL |
| Filtro de orçamentos por mês no dashboard | ✅ Completo | Index.tsx |

---

## 12. Funcionalidades Incompletas ou Ausentes

| Funcionalidade | Status | Detalhe |
|----------------|--------|---------|
| Precificação de orçamentos | ❌ Ausente | `input_value` sempre salvo como 0; campo existe no banco mas não na UI |
| Valor movimentado no dashboard | ⚠️ Incompleto | `valorMovimentado` calculado, mas como `input_value = 0`, sempre mostra R$0 |
| Vinculação orçamento → cliente via ID | ❌ Ausente | `client_id` sempre NULL; agrupamento feito por texto (empresa_name) |
| Exclusão de orçamentos | ❌ Ausente | Policy de DELETE existe no banco, mas não há botão na UI |
| Página Embiofert | ❌ Sem rota | Arquivo existe, não tem rota no App.tsx |
| Página Dimensionamento 3100 | ❌ Sem rota | Arquivo existe, não tem rota |
| Página Dimensionamento Propulsor | ❌ Sem rota | Arquivo existe, não tem rota |
| Dashboard alternativo | ❌ Órfão | 4 componentes em `dashboard/` nunca importados |
| Edição de orçamento | ❌ Ausente | Não é possível editar um orçamento salvo |
| Busca/filtro de clientes | ❌ Ausente | Sem campo de busca em MeusClientes |
| Recuperação de senha | ❌ Ausente | Sem link "esqueci minha senha" na tela de login |
| Perfil de usuário | ❌ Ausente | Tabela `profiles` existe, mas não há página de edição de perfil |
| Agendamento | ❌ Não iniciado | Módulo FF Instalações |
| Financeiro/Caixa | ❌ Não iniciado | Módulo FF Instalações |
| Conversão orçamento → OS | ❌ Não iniciado | Módulo FF Instalações |
| Previsão do tempo | ❌ Não iniciado | Módulo FF Instalações |

---

## 13. Problemas Encontrados

### CRÍTICOS

**[P1] Dependência do Lovable em vite.config.ts**
- `lovable-tagger` é um plugin proprietário do Lovable
- Arquivo: `vite.config.ts:4` — `import { componentTagger } from "lovable-tagger"`
- Está em `devDependencies` e ativado apenas em `mode === "development"`
- **Ação**: Remover do `package.json` e do `vite.config.ts` antes de qualquer deploy independente

**[P2] Nome de variável de ambiente incorreta**
- Arquivo: `src/integrations/supabase/client.ts:6`
- Usa `VITE_SUPABASE_PUBLISHABLE_KEY` em vez da convenção `VITE_SUPABASE_ANON_KEY`
- Pode causar confusão e quebrar quando as variáveis forem configuradas no Vercel
- **Ação**: Padronizar para `VITE_SUPABASE_ANON_KEY` ou documentar claramente

### MÉDIOS

**[P3] `client_id` nunca é preenchido nos orçamentos**
- `NovoOrcamento.tsx:174-193` — INSERT na tabela `quotes` sem `client_id`
- A tabela `clients` existe e tem dados, mas os orçamentos nunca referenciam clientes por ID
- Agrupamento de clientes em `MeusClientes.tsx` é por texto (`empresa_name.toLowerCase()`) — sujeito a duplicatas

**[P4] Pricing não implementado**
- `input_value` é sempre salvo como `0` (`NovoOrcamento.tsx:181`)
- O campo `valorMovimentado` no dashboard é calculado como `input_value * frascos` — sempre R$0
- O banco suporta preços, a UI não

**[P5] Páginas órfãs sem rota**
- `Embiofert.tsx`, `Dimensionamento3100.tsx`, `DimensionamentoPropulsor.tsx` — sem entrada em `App.tsx`
- Código funcional inacessível pelo usuário

**[P6] Componentes de dashboard inativos**
- `dashboard/EfficiencyChart.tsx`, `PreparationTimeline.tsx`, `StatsCards.tsx`, `SustainabilityCard.tsx`
- Não importados em nenhum lugar — código morto ou versão anterior do dashboard

**[P7] Auth page com branding hardcoded**
- `Auth.tsx:65` — `"SUA LOGO AQUI"` e emoji `🐷` hardcoded
- `BrandingProvider` não está disponível na rota `/auth` (está dentro do `ProtectedRoute`)
- Logo e nome da empresa não aparecem na tela de login

**[P8] Número de WhatsApp de suporte hardcoded**
- `AppSidebar.tsx:222` — `5545999317831` hardcoded
- Qualquer mudança de número requer alteração de código
- **Ação**: Mover para `branding_settings` ou variável de ambiente

### BAIXOS

**[P9] Uso de `as any` e `as unknown as X`**
- `NovoOrcamento.tsx:188` — `propulsores_json: validPropulsores as unknown as Record<string, unknown>[]`
- `NovoOrcamento.tsx:193` — `.select('numero_pedido').single()` com `as any`
- `MeusClientes.tsx:69` — `data as unknown as Quote[]`
- Indica que os tipos gerados não estão 100% alinhados com os tipos usados na UI

**[P10] Conflito de pasta de migrations**
- O projeto tem `/supabase/migrations/` (Supabase CLI padrão)
- A governança criou `/database/migrations/`
- As duas pastas têm propósitos similares — necessário consolidar

**[P11] Sem exclusão de orçamentos na UI**
- Policy de DELETE existe para `quotes`, mas sem botão de excluir em `MeusClientes.tsx`

**[P12] Frequencia sempre vazia no banco**
- `NovoOrcamento.tsx:184` — `frequencia: ""` — campo nunca preenchido no INSERT

---

## 14. Oportunidades de Melhoria

### Imediatas (pré-migração)
1. **Remover `lovable-tagger`** do `package.json` e `vite.config.ts` — requisito para independência
2. **Padronizar nome da env var** de `VITE_SUPABASE_PUBLISHABLE_KEY` → `VITE_SUPABASE_ANON_KEY`
3. **Adicionar rotas** para as 3 páginas órfãs ou deletar os arquivos

### Curto Prazo (v1.0)
4. **Implementar precificação** — campo `input_value` no formulário de orçamento
5. **Vincular orçamentos a clientes** — usar `client_id` efetivamente; adicionar busca de cliente existente
6. **Adicionar busca** em `MeusClientes.tsx`
7. **Implementar edição de orçamento** — hoje só é possível criar novos
8. **Adicionar exclusão de orçamento** na UI
9. **Recuperação de senha** — link na tela de login
10. **Branding na tela de login** — carregar branding antes do auth (via fetch direto, sem contexto)

### Médio Prazo (v1.5)
11. **Número de suporte configurável** — mover para branding_settings ou settings
12. **Limpar componentes órfãos** do dashboard — avaliar se serão usados ou deletar
13. **Eliminar `as any`** — corrigir tipagem com tipos derivados de `Database` do Supabase
14. **Consolidar pastas de migrations** — usar `/supabase/migrations/` como canonical (padrão CLI)
15. **Página de perfil de usuário** — editar nome, mudar senha

---

## 15. Complexidade de Cada Módulo

| Módulo | Complexidade | Justificativa |
|--------|-------------|---------------|
| Dashboard (`Index.tsx`) | **Alta** | 640 linhas, múltiplos filtros/memos, 2 gráficos, animações, contadores, expansão de cards |
| Geração de PDF (`quotePdf.ts`) | **Alta** | 265 linhas, gestão manual de coordenadas, multi-página, watermark, logo, footer dinâmico |
| Orçamento (`NovoOrcamento.tsx`) | **Média** | 509 linhas, listas dinâmicas de propulsores/aditivos, validação manual, 3 saídas (save/PDF/WhatsApp) |
| Clientes (`MeusClientes.tsx`) | **Média** | 335 linhas, agrupamento dinâmico, status inline, PDF por orçamento salvo |
| Branding (`ConfiguracoesMarca.tsx`) | **Média** | 227 linhas, upload de logo, conversão HSL↔HEX, múltiplos campos |
| BrandingProvider | **Média** | 193 linhas, conversões de cor, CSS vars dinâmicas, Supabase Storage |
| Auth (`Auth.tsx`) | **Baixa** | 163 linhas, formulário simples |
| CalculatorCard | **Baixa** | 102 linhas, genérico e reutilizável |
| Páginas de produto (5x) | **Baixíssima** | ~35 linhas cada, estáticas com CalculatorCard |
| Páginas de propulsor (5x) | **Baixíssima** | ~38 linhas cada, specs estáticas com alerta |
| Instruções | **Baixíssima** | 124 linhas, accordion de i18n |
| Layout + AppSidebar | **Baixa** | Navegação e header, sem lógica de negócio complexa |

---

## 16. Dependências — Análise Completa

### Dependências de Produção
| Pacote | Versão | Status | Notas |
|--------|--------|--------|-------|
| `react` | 18.3.1 | ✅ Atual | |
| `typescript` | 5.8.3 | ✅ Atual | |
| `tailwindcss` | 3.4.17 | ✅ Estável | v4 disponível mas breaking |
| `@supabase/supabase-js` | 2.95.3 | ✅ Atual | |
| `@tanstack/react-query` | 5.83.0 | ✅ Atual | |
| `react-router-dom` | 6.30.1 | ✅ Atual | |
| `jspdf` | 4.2.1 | ✅ Atual | |
| `recharts` | 2.15.4 | ✅ Atual | |
| `react-hook-form` | 7.61.1 | ✅ Atual | |
| `zod` | 3.25.76 | ✅ Atual | |
| `i18next` | 26.0.3 | ✅ Atual | |
| `lucide-react` | 0.462.0 | ⚠️ Defasado | v0.5+ disponível |
| `date-fns` | 3.6.0 | ✅ Estável | |
| `sonner` | 1.7.4 | ✅ Atual | |
| `next-themes` | 0.3.0 | ✅ Atual | usado via shadcn/ui |
| `vaul` | 0.9.9 | ✅ Atual | drawer shadcn/ui |
| todos `@radix-ui/*` | recentes | ✅ OK | 25+ pacotes Radix |

### Dependência Problemática (Lovable)
| Pacote | Tipo | Ação |
|--------|------|------|
| `lovable-tagger` | devDependency | **REMOVER** — proprietário do Lovable |

### Dependências de Dev
Todas padrão para o stack: `@vitejs/plugin-react-swc`, `eslint`, `vitest`, `@testing-library/*`, `typescript-eslint`, etc.

---

## 17. Estrutura de Pastas Existente

```
src/
├── App.tsx                          → roteamento + providers
├── main.tsx                         → entry point
├── index.css                        → CSS base + Tailwind
├── App.css                          → animações customizadas
├── vite-env.d.ts
│
├── pages/
│   ├── Auth.tsx
│   ├── Index.tsx                    → Dashboard
│   ├── NovoOrcamento.tsx
│   ├── MeusClientes.tsx
│   ├── InstrucoesPreparo.tsx
│   ├── ConfiguracoesMarca.tsx
│   ├── Embiofert.tsx               ← ÓRFÃ (sem rota)
│   ├── Dimensionamento3100.tsx     ← ÓRFÃ (sem rota)
│   ├── DimensionamentoPropulsor.tsx ← ÓRFÃ (sem rota)
│   ├── NotFound.tsx
│   ├── produtos/
│   │   ├── Embio3100.tsx
│   │   ├── Embio3000.tsx
│   │   ├── Embio5000.tsx
│   │   ├── Embio6000.tsx
│   │   └── Embio8000.tsx
│   └── propulsores/
│       ├── Propulsor3CV.tsx
│       ├── Propulsor4CV.tsx
│       ├── Propulsor5CV.tsx
│       ├── Propulsor75CV.tsx
│       └── Propulsor10CV.tsx
│
├── components/
│   ├── Layout.tsx
│   ├── AppSidebar.tsx
│   ├── NavLink.tsx
│   ├── ProtectedRoute.tsx
│   ├── CompanyFooter.tsx
│   ├── WhatsAppButton.tsx
│   ├── calculators/
│   │   └── CalculatorCard.tsx
│   ├── dashboard/                   ← ÓRFÃO (não importado)
│   │   ├── EfficiencyChart.tsx
│   │   ├── PreparationTimeline.tsx
│   │   ├── StatsCards.tsx
│   │   └── SustainabilityCard.tsx
│   └── ui/                          ← shadcn/ui (não editar)
│       └── (35 componentes)
│
├── hooks/
│   ├── useAuth.tsx                  → AuthContext
│   ├── useBranding.tsx              → BrandingContext + utilitários de cor
│   ├── use-mobile.tsx
│   └── use-toast.ts
│
├── integrations/supabase/
│   ├── client.ts                    → createClient
│   └── types.ts                     → Database typings (auto-gerado)
│
├── lib/
│   ├── format.ts                    → formatCnpj, formatPhone, waLink, telLink
│   ├── quotePdf.ts                  → generateQuotePdf (jsPDF)
│   └── utils.ts                     → cn()
│
├── i18n/
│   ├── index.ts                     → configuração i18next
│   └── locales/
│       ├── pt.json                  → 365 linhas de strings PT
│       └── en.json                  → espelho em EN
│
└── test/
    ├── setup.ts
    └── example.test.ts              → test de exemplo (vitest)

supabase/
├── config.toml
└── migrations/
    └── (8 arquivos SQL — vide seção 9)
```

---

## 18. Resumo Executivo

### O que o sistema faz hoje
O Embio AgroCalc é um **sistema de orçamentos técnicos** focado em produtos biológicos para tratamento de dejetos (suíno e bovino). Permite criar orçamentos com propulsores e aditivos Embio, gerar PDFs profissionais com branding personalizável, compartilhar via WhatsApp, e acompanhar status dos orçamentos por cliente. O sistema tem um dashboard funcional com métricas, gráficos e filtros.

### Pontos Fortes
- Código bem estruturado e legível
- Design premium com Tailwind + shadcn/ui
- PDF de alta qualidade com jsPDF (logo, watermark, footer da empresa)
- Branding 100% personalizável por usuário
- i18n PT/EN implementado
- RLS correto em todas as tabelas
- Supabase CLI migrations versionadas
- Calculadoras técnicas precisas para todos os produtos Embio

### Pontos de Atenção para a Migração
1. **Remover `lovable-tagger`** — blocker para independência
2. **3 páginas sem rota** — decidir se integrar ao menu ou deletar
3. **4 componentes de dashboard** sem uso — avaliar e limpar
4. **Pricing nunca implementado** — `input_value` sempre 0
5. **`clients` table subutilizada** — orçamentos não referenciam clientes por ID

### Estimativa de Esforço por Fase
| Fase | Esforço |
|------|---------|
| Remover Lovable + setup GitHub/Vercel/Supabase | Pequeno (1-2h) |
| Corrigir páginas órfãs e componentes inativos | Pequeno (2-4h) |
| Implementar pricing no formulário | Médio (4-6h) |
| Vincular orçamentos → clientes por ID | Médio (4-8h) |
| Adicionar busca, edição, exclusão de orçamentos | Médio (6-10h) |
| Integração módulos FF Instalações (agenda, financeiro, etc.) | Grande (40-80h) |

**Conclusão**: O sistema está **sólido e funcional** para o core de orçamentos. A migração do Lovable é de **baixo risco técnico** — o principal blocker é apenas o `lovable-tagger`. O maior trabalho está na integração dos módulos do FF Instalações.
