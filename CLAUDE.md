# CLAUDE.md — Embio Comercial Pro

## Identidade do Projeto

**Nome**: Embio Comercial Pro  
**Origem**: Evolução do Embio AgroCalc (exportado do Lovable)  
**Stack**: React + TypeScript + Supabase + Vercel  
**Objetivo**: Sistema comercial profissional para a empresa Embio

## Regras Absolutas

- NUNCA deletar arquivos sem aprovação explícita
- NUNCA sobrescrever lógica existente sem revisão
- NUNCA commitar `.env`, credenciais ou secrets
- NUNCA modificar policies do Supabase sem passar pelo agente `security`
- SEMPRE ler um arquivo antes de editá-lo
- SEMPRE rodar testes após alterações de código
- SEMPRE validar input nas bordas do sistema (formulários, APIs)
- Manter arquivos abaixo de 500 linhas — refatorar se necessário

## Estrutura de Branches

```
main          → produção (protegida)
develop       → integração
feature/*     → novas funcionalidades
fix/*         → correções
migration/*   → migração de módulos do FF Instalações
```

## Stack Técnica

| Camada       | Tecnologia              |
|--------------|-------------------------|
| Frontend     | React + TypeScript      |
| Roteamento   | React Router / Next.js  |
| UI           | Tailwind CSS + shadcn/ui|
| Backend      | Supabase (PostgreSQL)   |
| Auth         | Supabase Auth           |
| Storage      | Supabase Storage        |
| Deploy       | Vercel                  |
| PDFs         | react-pdf / jsPDF       |

## Módulos do Sistema

### Módulos Embio (núcleo)
- Orçamentos técnicos
- Produtos Embio
- Dimensionamento de lagoas
- Indicação de propulsores/máquinas
- Clientes
- Branding/logomarca
- Geração de PDFs
- Dashboard

### Módulos FF Instalações (a integrar)
- Agenda
- Financeiro simples / caixa
- Catálogo comercial
- Clientes (unificar com Embio)
- Dashboard
- Previsão do tempo
- Personalização visual
- Geração de PDF
- Conversão de orçamento em serviço/visita

## Antes de Qualquer Tarefa

1. Consultar `/audits/EMBIO-AUDIT.md` e `/audits/FF-MODULES-AUDIT.md`
2. Verificar `/docs/DECISIONS.md` para decisões já tomadas
3. Verificar `/MIGRATION-PLAN.md` para status da migração
4. Seguir as `DATABASE-RULES.md` e `SUPABASE-RULES.md`

## Contato e Aprovação

Toda ação significativa requer aprovação do responsável antes de execução.
