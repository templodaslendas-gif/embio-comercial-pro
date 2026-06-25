# ROADMAP.md — Embio Comercial Pro

---

## Versão 0.1 — Governança e Auditoria
**Status**: ✅ CONCLUÍDA
**Meta**: Estrutura de projeto criada, código auditado, infraestrutura definida

- [x] Estrutura de pastas e documentação
- [x] Auditoria completa do Embio AgroCalc (`audits/EMBIO-AUDIT.md`)
- [x] Auditoria dos módulos FF Instalações (`audits/FF-MODULES-AUDIT.md`)
- [x] Arquitetura modular definida (`audits/MERGE-PLAN.md`)
- [x] Decisões técnicas registradas (`docs/DECISIONS.md`)

---

## Versão 0.2 — Setup de Infraestrutura
**Status**: ✅ CONCLUÍDA
**Meta**: Repositório, Supabase e Vercel configurados

- [x] Repositório GitHub criado
- [x] Projeto Supabase criado (8 migrations aplicadas)
- [x] Projeto Vercel configurado
- [x] Variáveis de ambiente configuradas
- [x] Auth funcional (signup/signin/signout testados)

---

## Versão 0.3 — Estrutura Modular Base
**Status**: Pendente — próxima etapa
**Meta**: Estrutura `src/modules/` criada e primeiro módulo validado

- [ ] Instalar `jspdf-autotable`
- [ ] Criar estrutura `src/modules/commercial/`, `embio/`, `shared/`
- [ ] Alias `@/modules` em `tsconfig.json`
- [ ] Criar branch `develop`
- [ ] **Fase C1**: `commercial/dashboard/WeatherWidget` funcionando no `Index.tsx`
- [ ] **Fase C2**: `commercial/financeiro/` (SaldoCard + PeriodoSelector + periodo.ts) sem banco

---

## Versão 1.0 — Núcleo Embio Estável
**Status**: Pendente
**Meta**: Funcionalidades core do Embio organizadas na estrutura modular

- [ ] **Fase E1**: Módulos `embio/produtos/`, `embio/propulsores/`, `embio/dimensionamento/` criados
- [ ] **Fase E2**: `embio/relatorios/` (MeusClientes, NovoOrcamento, quotePdf)
- [ ] **Fase E3**: `embio/preparo/` (InstrucoesPreparo)
- [ ] **Fase S1**: `shared/` reorganizado (hooks, utils, branding)
- [ ] Todos os módulos Embio em `src/modules/embio/` com barrel exports
- [ ] Build sem erros, Embio 100% funcional na estrutura nova

---

## Versão 1.5 — Módulos Comerciais (Banco)
**Status**: Pendente
**Meta**: Módulos FF com banco funcionando

- [ ] **Fase C3**: `commercial/clientes/` (tabela `clientes`, CRUD completo)
- [ ] **Fase C4**: `commercial/catalogo/` + `commercial/orcamentos/` (3 tabelas + PDF)
- [ ] **Fase C5**: `commercial/agenda/` (tabela `servicos` + `manutencoes`)
- [ ] **Fase C6**: `commercial/financeiro/` completo (tabela `caixa` + `contas_futuras`)

---

## Versão 2.0 — Sistema Comercial Completo
**Status**: Futuro
**Meta**: Todos os módulos integrados e funcionando em produção

- [ ] **Fase C7**: `commercial/dashboard/` completo (DashboardModule com todos os dados)
- [ ] Dashboard unificado Embio + comercial
- [ ] Previsão do tempo integrada ao dashboard
- [ ] Conversão orçamento → ordem de serviço funcionando
- [ ] PDF profissional para orçamentos comerciais
- [ ] Agenda completa com conclusão de serviço → lança no caixa

---

## Versão 2.x — Melhorias Contínuas
**Status**: Futuro

- Performance e otimizações
- Melhorias de UX baseadas em uso real
- Relatórios e exportações avançadas
- Integrações externas (se necessário)
- Avaliação de Next.js (SSR) se necessidade de SEO surgir

---

## Mapa de Fases (Referência)

| Fase | Conteúdo | Banco | Estimativa |
|------|---------|-------|-----------|
| C1 | WeatherWidget | Não | 1–2h |
| C2 | SaldoCard + PeriodoSelector + periodo.ts | Não | 2–3h |
| C3 | commercial/clientes | 1 tabela | 4–6h |
| C4 | commercial/catalogo + orcamentos | 3 tabelas | 8–12h |
| C5 | commercial/agenda | 2 tabelas | 6–10h |
| C6 | commercial/financeiro (completo) | 2 tabelas | 5–8h |
| C7 | commercial/dashboard | Não (usa C3–C6) | 3–5h |
| S1 | shared/ refactor | Não | 4–6h |
| E1 | embio/produtos + propulsores + dimensionamento | Não | 4–6h |
| E2 | embio/relatorios + shared/branding | Não | 3–4h |
| **Total** | | **8 tabelas novas** | **40–62h** |

> Detalhes completos em `audits/MERGE-PLAN.md`
