# VISUAL-AUDIT.md — Auditoria Visual Completa

**Data**: 2026-06-28  
**Auditado por**: Lead Product Designer (FFR Platform)  
**Status da auditoria**: COMPLETA

---

## 1. Tokens de Design

### Fontes
| Token | Valor | Uso atual |
|-------|-------|-----------|
| `--ffr-font-body` | `'Inter', system-ui` | Todo o sistema |
| Headings | Inter bold/extrabold | Todos os títulos |
| Mono | N/A (não configurada) | — |

**Status**: ✅ Consistente. Inter como única fonte — correto para SaaS.

---

### Paleta de Cores — Light Mode

| Token | HSL | Representação |
|-------|-----|--------------|
| `--background` | `210 15% 97%` | Cinza muito claro (quase branco) |
| `--foreground` | `210 50% 12%` | Azul escuro |
| `--primary` | `210 70% 25%` | Azul navy |
| `--accent` | `120 55% 38%` | Verde Embio |
| `--muted` | `210 12% 94%` | Cinza neutro claro |
| `--border` | `210 12% 90%` | Borda sutil |

### Paleta de Cores — Dark Mode

| Token | HSL | Representação |
|-------|-----|--------------|
| `--background` | `210 20% 6%` | Quase preto azulado |
| `--primary` | `120 55% 45%` | Verde Embio (virou primário no dark) |
| `--accent` | `120 45% 38%` | Verde médio |
| `--card` | `210 18% 9%` | Card ligeiramente mais claro |

### Sidebar
| Token | HSL | Representação |
|-------|-----|--------------|
| `--sidebar-background` | `210 55% 12%` | Azul navy escuro |
| `--sidebar-primary` | `120 55% 45%` | Verde lima (ativo) |
| `--sidebar-foreground` | `210 12% 92%` | Quase branco |

### Tokens Embio Custom
| Token | HSL |
|-------|-----|
| `--embio-green-deep` | `210 70% 22%` |
| `--embio-green-light` | `120 45% 45%` |
| `--embio-lime` | `120 55% 45%` |
| `--embio-gray` | `210 5% 60%` |

**Status**: ✅ Identidade coerente. Azul navy + Verde agro = DNA Embio correto.

---

### Espaçamentos

| Elemento | Valor atual | Status |
|----------|------------|--------|
| Padding de página | `max-w-5xl mx-auto` | ✅ |
| Gap entre seções | `space-y-6` ou `space-y-8` | ✅ |
| Padding de card | `p-5` / `p-6` | ✅ |
| Border radius | `rounded-xl` (cards) | ✅ |

---

## 2. Componentes

### Design System Premium

| Componente | Arquivo | Qualidade | Observações |
|-----------|---------|-----------|-------------|
| PremiumPage | `premium/PremiumPage.tsx` | ✅ Boa | Container com padding correto |
| PremiumSection | `premium/PremiumSection.tsx` | ✅ Boa | — |
| PremiumCard | `premium/PremiumCard.tsx` | ✅ Boa | Border sutil, hover correto |
| PremiumMetric | `premium/PremiumMetric.tsx` | ✅ Excelente | countUp animado |
| PremiumHeader | `premium/PremiumHeader.tsx` | ✅ Boa | Barra accent lateral |
| PremiumEmptyState | `premium/PremiumEmptyState.tsx` | ✅ Boa | — |
| PremiumBadge | `premium/PremiumBadge.tsx` | ✅ Boa | — |
| PremiumAction | `premium/PremiumAction.tsx` | ✅ Boa | — |
| PremiumChartCard | `premium/PremiumChartCard.tsx` | ✅ Boa | — |

### Componentes ausentes (criados nesta sessão)

| Componente | Motivo da ausência |
|-----------|-------------------|
| PremiumButton | Botões usam `shadcn/Button` diretamente |
| PremiumTable | Tabelas sem padrão consolidado |
| PremiumDialog | Dialogs sem padrão consolidado |
| PremiumWeather | WeatherWidget existe mas sem visual Apple-style |
| PremiumHero | Hero inline no dashboard, não componentizado |

---

## 3. Páginas — Auditoria Individual

### 3.1 Auth (Login)

**Arquivo**: `src/pages/Auth.tsx`

| Aspecto | Status | Problema |
|---------|--------|---------|
| Logo | ❌ | "SUA LOGO AQUI" placeholder em produção |
| Ícone | ❌ | Emoji 🐷 hardcoded — não profissional |
| Layout | ⚠️ | Card centralizado funciona, sem background expressivo |
| Cores | ✅ | Usa tokens corretos |
| Responsivo | ✅ | `max-w-md` adequado |
| Feedback | ✅ | Toasts de erro/sucesso |
| Acessibilidade | ✅ | Labels e inputs corretos |

**Veredicto**: REPROVAR — placeholder de logo visível em produção. Redesign prioritário.

---

### 3.2 Dashboard (Index)

**Arquivo**: `src/pages/Index.tsx` (427 linhas)

| Aspecto | Status | Observação |
|---------|--------|-----------|
| Hero section | ✅ | Greeting + data + badge |
| Métricas | ✅ | 4 KPIs com countUp + expandable |
| Gráfico de evolução | ✅ | AreaChart 30 dias |
| Gráfico pizza | ✅ | Status mix |
| WeatherWidget | ✅ | Integrado |
| Quick actions | ✅ | Links para módulos |
| Produtos e propulsores | ✅ | Cards expansíveis |
| Estados loading | ✅ | Skeleton com pulse |
| Empty state | ✅ | Implementado |
| Watermark logo | ✅ | Logo como background sutil |

**Veredicto**: APROVADO — dashboard mais completo do sistema.

---

### 3.3 Agenda

**Arquivo**: `src/pages/Agenda.tsx` (469 linhas)

| Aspecto | Status | Problema |
|---------|--------|---------|
| Header | ✅ | PremiumHeader |
| Filtros | ✅ | Busca + período + status |
| Tabela | ✅ | Colunas responsivas corretas |
| Loading skeleton | ✅ | 5 linhas |
| Empty state | ✅ | Com CTA |
| Sheet de formulário | ✅ | — |
| Delete confirm | ✅ | AlertDialog |
| Bug filtro "mes" | ❌ | Filtra até dia 1 do mês seguinte, label incorreto |
| Bug SelectItem `value=""` | ❌ | Pode falhar em shadcn/ui recente |

**Veredicto**: APROVADO COM RESSALVAS — bugs a corrigir.

---

### 3.4 WeatherWidget

**Arquivo**: `src/modules/commercial/dashboard/WeatherWidget.tsx`

| Aspecto | Status | Observação |
|---------|--------|-----------|
| API | ✅ | Open-Meteo (gratuita, sem API key) |
| Geolocalização | ✅ | Pede permissão, fallback para MCR |
| Previsão 7 dias | ✅ | — |
| Design | ⚠️ | Funcional mas abaixo do visual Apple Weather pretendido |
| Estados loading | ✅ | — |
| Ícones de clima | ✅ | Lucide contextual |

**Veredicto**: REPROVAR VISUAL — requer redesign para central operacional style.

---

### 3.5 Sidebar (AppSidebar)

**Arquivo**: `src/components/AppSidebar.tsx` (226 linhas)

| Aspecto | Status | Observação |
|---------|--------|-----------|
| Fundo navy | ✅ | `sidebar-background` |
| Logo + nome | ✅ | Com fallback Wheat icon |
| Navegação colapsível | ✅ | Produtos e Propulsores |
| Labels de grupo | ✅ | `COMERCIAL`, `TÉCNICO`, `ADMIN` |
| Item ativo | ✅ | Fundo + texto verde |
| Rodapé | ⚠️ | Precisa verificar |
| Responsividade | ⚠️ | shadcn Sidebar — verificar mobile |

**Veredicto**: APROVADO — estrutura correta, polimento necessário.

---

### 3.6 Clientes

**Arquivo**: `src/pages/Clientes.tsx` (405 linhas)

| Aspecto | Status |
|---------|--------|
| Lista com filtros | ✅ |
| CRUD via Sheet | ✅ |
| Alerta de delete | ✅ |
| Empty state | ✅ |
| Design system premium | ⚠️ (parcial) |

**Veredicto**: APROVADO COM RESSALVAS — verificar uso de componentes Premium.

---

## 4. Gráficos

| Biblioteca | Componentes usados |
|-----------|-------------------|
| Recharts | `AreaChart`, `PieChart`, `ResponsiveContainer`, `Tooltip` |

**Status**: ✅ Consistente — apenas Recharts.

**Problemas**:
- Cores de gráficos usam `hsl(var(--accent))` — correto
- Tooltip usa tema padrão — poderia ter estilo customizado Embio

---

## 5. Espaçamentos e Ritmo Visual

| Elemento | Consistência |
|----------|-------------|
| Border radius | ✅ `rounded-xl` padrão |
| Shadows | ✅ `shadow-[0_1px_3px_...]` consistente |
| Borders | ✅ `border-border/60` ou `border-border/40` |
| Animações | ✅ `fade-in`, `slide-in-left`, `count-up` definidas |

---

## 6. Diagnóstico Geral

### Pontos Fortes
1. Paleta de cores coerente com identidade Embio
2. Design System Premium bem iniciado (9 componentes)
3. Dashboard completo com múltiplas seções
4. Estados de loading/empty/error implementados
5. WeatherWidget funcional com geolocalização

### Pontos Críticos (a corrigir)
1. ❌ **Auth page** — placeholder "SUA LOGO AQUI" + emoji 🐷
2. ❌ **Agenda bug** — filtro de período com lógica errada
3. ⚠️ **WeatherWidget** — visual abaixo do esperado
4. ⚠️ **Componentes faltando** — PremiumButton, PremiumTable, PremiumDialog, PremiumWeather, PremiumHero

### Componentes a Criar (FASE 3)
1. `PremiumButton` — wrapper tipado sobre shadcn Button
2. `PremiumTable` — tabela padrão com skeleton + empty state
3. `PremiumDialog` — dialog modal com header/footer padronizados
4. `PremiumWeather` — redesign do WeatherWidget
5. `PremiumHero` — hero section componentizado

---

## 7. Plano de Ação

| Prioridade | Ação |
|-----------|------|
| 🔴 Alta | Redesign Auth — remover placeholder, identidade Embio |
| 🔴 Alta | Corrigir bugs Agenda |
| 🟡 Média | Criar componentes Premium faltando |
| 🟡 Média | Redesign WeatherWidget — Apple Weather style |
| 🟢 Baixa | Code splitting — bundle 1.7MB |
| 🟢 Baixa | Polimento sidebar — rodapé e mobile |
