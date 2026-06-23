# Embio Comercial Pro

Sistema comercial profissional da empresa Embio, desenvolvido para gerenciar orçamentos técnicos, dimensionamento de lagoas, indicação de equipamentos e operações comerciais.

## Origem

Este projeto é a evolução do **Embio AgroCalc**, exportado da plataforma Lovable. O objetivo é torná-lo independente, versionável e escalável.

## Módulos

### Núcleo Embio
- **Orçamentos Técnicos** — geração de propostas com cálculo técnico
- **Dimensionamento de Lagoas** — cálculo de oxigenação, área, volume
- **Propulsores e Máquinas** — indicação de equipamentos conforme dimensionamento
- **Produtos Embio** — catálogo interno de produtos
- **Clientes** — cadastro e histórico
- **PDFs** — exportação de orçamentos e relatórios
- **Dashboard** — visão geral de indicadores

### Módulos FF Instalações (integração futura)
- Agenda e visitas
- Financeiro / Caixa
- Catálogo comercial
- Previsão do tempo
- Personalização visual
- Conversão de orçamento em ordem de serviço

## Stack

- **Frontend**: React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Deploy**: Vercel
- **PDF**: react-pdf / jsPDF

## Como Começar

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env.local

# 3. Rodar em desenvolvimento
npm run dev

# 4. Build de produção
npm run build
```

## Estrutura de Pastas

```
/
├── src/              # Código fonte principal
├── docs/             # Documentação técnica e de produto
├── agents/           # Definições de agentes de IA
├── prompts/          # Prompts reutilizáveis
├── audits/           # Auditorias de código e módulos
├── database/         # Migrations e policies do Supabase
│   ├── migrations/
│   └── policies/
├── backups/          # Backups de estrutura e dados
├── CLAUDE.md         # Instruções para o agente de IA
├── AGENTS.md         # Definição dos agentes do projeto
├── MIGRATION-PLAN.md # Plano de migração do Lovable
├── SECURITY-CHECKLIST.md
├── DATABASE-RULES.md
└── SUPABASE-RULES.md
```

## Documentação

Consulte a pasta `/docs/` para:
- Visão do produto (`PROJECT-VISION.md`)
- Funcionalidades (`FEATURES.md`)
- Roadmap (`ROADMAP.md`)
- Decisões técnicas (`DECISIONS.md`)
- Riscos (`RISKS.md`)
- Changelog (`CHANGELOG.md`)

## Status

Fase atual: **Governança e Auditoria** — nenhuma alteração de código em andamento.
