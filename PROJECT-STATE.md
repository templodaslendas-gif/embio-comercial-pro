# PROJECT-STATE.md — Estado Atual do Projeto

**Atualizado em**: 2026-06-28  
**Branch**: `main`  
**Deploy**: Vercel (produção)  
**Build**: ✅ Passando

---

## Status Geral

| Área | Status | Observação |
|------|--------|-----------|
| Build | ✅ OK | Warning: bundle 1.7MB — precisa code splitting |
| Auth | ✅ Funcional | Identidade pública fixa (Embio Intelligence Pro), cadastro autônomo |
| Dashboard | ✅ Funcional | Redesign aplicado v2 |
| Agenda | ⚠️ Bug | Filtro "Próximo mês" com lógica incorreta |
| Clientes | ✅ Funcional | — |
| Catálogo | ✅ Funcional | — |
| WeatherWidget | ✅ Funcional | Geolocalização + Open-Meteo API |
| Supabase | ✅ Conectado | 4 tabelas: quotes, clientes, servicos, branding_settings |
| PDF | ✅ Funcional | jsPDF + html2canvas |
| i18n | ✅ PT + EN | i18next |

---

## Módulos Ativos

### Comercial (produção)
- [x] Dashboard com métricas de orçamentos
- [x] Lista de clientes com busca e filtros
- [x] Agenda de visitas comerciais
- [x] Catálogo de produtos
- [x] WeatherWidget (Open-Meteo)

### Técnico (produção)
- [x] Calculadoras de produtos (Embio 3100, 3000, 5000, 6000, 8000)
- [x] Especificações de propulsores (3CV, 4CV, 5CV, 7.5CV, 10CV)
- [x] Geração de orçamentos com PDF

### Admin
- [x] Configurações de marca (logo, nome, dados da empresa)
- [x] Branding dinâmico via CSS vars

---

## Bugs Conhecidos

| ID | Arquivo | Descrição | Prioridade |
|----|---------|-----------|-----------|
| BUG-001 | `pages/Agenda.tsx` | SelectItem `value=""` causa comportamento inesperado | Média |
| BUG-002 | `pages/Agenda.tsx` | Filtro "mes" usa primeiro dia do mês seguinte em vez de último dia do mês atual | Média |
| ~~BUG-003~~ | `pages/Auth.tsx` | ~~Placeholder "SUA LOGO AQUI" + emoji visível em produção~~ — corrigido em 2026-07-27: tela pública não usa mais `useBranding()`, identidade fixa Embio Intelligence Pro | Resolvido |

---

## Dívida Técnica

| Item | Impacto | Esforço |
|------|---------|---------|
| Bundle 1.7MB — sem code splitting | Performance | Médio |
| Páginas órfãs: Embiofert, Dimensionamento3100, DimensionamentoPropulsor | Sem rota ativa | Baixo |
| Componentes de dashboard órfãos: EfficiencyChart, PreparationTimeline, StatsCards, SustainabilityCard | Não utilizados | Baixo |
| `incoming-ff-modules/` não rastreado | Pendente de migração | Alto |

---

## Design System

### Componentes Premium Existentes
PremiumPage, PremiumSection, PremiumCard, PremiumMetric, PremiumHeader,
PremiumEmptyState, PremiumBadge, PremiumAction, PremiumChartCard

### Componentes Premium Criados na Sessão 2026-06-28
PremiumButton, PremiumTable, PremiumDialog, PremiumWeather, PremiumHero

---

## Histórico de Sessões

| Data | O que foi feito |
|------|----------------|
| 2026-06-23 | Exportação do Lovable, setup inicial, auditoria completa |
| 2026-06-25 | Arquitetura modular, integração FF Instalações |
| 2026-06-26 | Redesign premium dashboard v1 + v2, agro identity |
| 2026-06-28 | Migração FFR Platform, criação Design System completo, redesign geral |
| 2026-07-27 | Identidade pública do login corrigida (fim do vazamento de branding por tenant), cadastro autônomo validado (profile + branding_settings + catálogo base automáticos), arquitetura do futuro painel master registrada |

---

## Próximos Passos

1. Code splitting — `React.lazy()` em todas as páginas
2. Implementar PremiumWeather com design Apple Weather
3. Migração módulos `incoming-ff-modules/`
4. Relatório financeiro básico (módulo Financeiro)
5. Implementar painel `super_admin_global` (ver arquitetura futura abaixo — não iniciar sem alinhamento prévio)

---

## Arquitetura Futura — Painel Geral de Gestão (não implementado)

> Apenas planejamento. Nenhuma role, RLS ou rota foi criada para isso ainda.
> Não iniciar implementação sem discussão e aprovação prévia do responsável.

**Objetivo**: um painel `super_admin_global` para visão consolidada de todos os
vendedores/empresas cadastrados na plataforma (multi-tenant overview).

**Escopo previsto**:
- Nova role `super_admin_global`, separada dos usuários comuns (vendedores)
- Visualização de todos os vendedores/empresas cadastrados, com filtros por cadastro
- Agregação cross-tenant de: clientes cadastrados, propostas geradas, valor
  orçado, valor aprovado, movimentações financeiras, agenda, catálogo e
  atividade por usuário
- Provavelmente exige policies de RLS específicas (`SELECT` cross-tenant
  restrito à role `super_admin_global`) — **passar pelo agente `security`
  antes de qualquer alteração de policy**, conforme `CLAUDE.md`

**Pré-requisitos antes de implementar**:
1. Definir onde a role `super_admin_global` é armazenada (claim no JWT vs.
   tabela `admin_roles` vs. coluna em `profiles`)
2. Modelar as queries agregadas (views ou RPC `SECURITY DEFINER`?)
3. Revisão de segurança dedicada, já que o painel lê dados de todos os tenants
