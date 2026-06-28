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
| Auth | ✅ Funcional | Precisa de redesign visual |
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
| BUG-003 | `pages/Auth.tsx` | Placeholder "SUA LOGO AQUI" + emoji visível em produção | Alta |

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

---

## Próximos Passos

1. Code splitting — `React.lazy()` em todas as páginas
2. Implementar PremiumWeather com design Apple Weather
3. Redesign completo do Login
4. Migração módulos `incoming-ff-modules/`
5. Relatório financeiro básico (módulo Financeiro)
