# MIGRATION-PLAN.md — Embio Comercial Pro

## Objetivo

Migrar o Embio AgroCalc do Lovable para um sistema próprio, independente, versionável e hospedado no Vercel + Supabase.

## Status Atual

| Etapa | Status |
|-------|--------|
| 1. Governança e estrutura | ✅ Em andamento |
| 2. Auditoria do código Lovable | ⏳ Pendente |
| 3. Setup do repositório GitHub | ⏳ Pendente |
| 4. Setup do Supabase | ⏳ Pendente |
| 5. Setup do Vercel | ⏳ Pendente |
| 6. Migração do código base | ⏳ Pendente |
| 7. Integração módulos FF Instalações | ⏳ Pendente |
| 8. Testes e QA | ⏳ Pendente |
| 9. Go-live | ⏳ Pendente |

## Fase 1 — Governança (atual)

- [x] Criar estrutura de pastas e documentação
- [x] Definir regras do projeto (CLAUDE.md, DATABASE-RULES.md, etc.)
- [x] Definir agentes de IA
- [ ] Extrair e inspecionar código do arquivo `Embio AgroCalc.zip`
- [ ] Preencher auditorias (`/audits/`)

## Fase 2 — Auditoria

**Objetivo**: Entender o que existe antes de tocar em qualquer coisa.

- [ ] Extrair `Embio AgroCalc.zip`
- [ ] Auditar estrutura de componentes (`/audits/EMBIO-AUDIT.md`)
- [ ] Auditar dependências (`/audits/DEPENDENCIES-AUDIT.md`)
- [ ] Mapear tabelas e schemas do Supabase (`/audits/SUPABASE-AUDIT.md`)
- [ ] Identificar módulos do FF Instalações a integrar (`/audits/FF-MODULES-AUDIT.md`)
- [ ] Criar plano de merge (`/audits/MERGE-PLAN.md`)

## Fase 3 — Setup de Infraestrutura

- [ ] Criar repositório no GitHub: `embio-comercial-pro`
- [ ] Configurar `.gitignore` (Node, env, build)
- [ ] Criar projeto no Supabase (região SA)
- [ ] Conectar Supabase ao projeto
- [ ] Criar projeto no Vercel e conectar ao GitHub
- [ ] Configurar variáveis de ambiente no Vercel

## Fase 4 — Migração do Código Base

- [ ] Verificar e corrigir dependências desatualizadas
- [ ] Substituir dependências específicas do Lovable
- [ ] Ajustar configurações de build (Vite/Next.js)
- [ ] Testar build local
- [ ] Testar deploy no Vercel

## Fase 5 — Integração FF Instalações

**Ordem de integração** (baseada em impacto e complexidade):

1. Clientes (unificar com base Embio)
2. Catálogo comercial
3. Geração de PDF
4. Agenda
5. Financeiro / Caixa
6. Conversão de orçamento em serviço
7. Previsão do tempo
8. Personalização visual
9. Dashboard unificado

## Fase 6 — QA e Go-live

- [ ] Testes funcionais de todos os módulos
- [ ] Testes de segurança (RLS, autenticação)
- [ ] Testes de performance
- [ ] Revisão final de segurança
- [ ] Go-live com monitoramento ativo

## Riscos

Consultar `/docs/RISKS.md` para lista completa de riscos e mitigações.

## Decisões

Consultar `/docs/DECISIONS.md` para registro de decisões técnicas tomadas.
