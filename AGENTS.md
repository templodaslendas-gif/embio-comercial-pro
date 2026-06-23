# AGENTS.md — Embio Comercial Pro

## Visão Geral

Este arquivo define os agentes de IA que operam neste projeto. Cada agente tem um papel, escopo e regras específicas.

## Hierarquia de Agentes

```
Agente Líder (Lead)
├── architect    → Decisões de arquitetura e estrutura
├── frontend     → Interface, componentes React/Next.js
├── supabase     → Banco de dados, RLS, migrations
├── migration    → Migração do Lovable para sistema próprio
├── security     → Auditoria de segurança, RLS, validações
├── pdf          → Geração de PDFs, templates, exportação
├── commercial   → Módulos comerciais, catálogo, orçamentos
└── qa           → Testes, qualidade, revisão final
```

## Regras Globais dos Agentes

- Nenhum agente altera código sem aprovação do Lead
- Nenhum agente acessa o Supabase em produção sem permissão explícita
- Toda decisão de arquitetura passa pelo `architect`
- Migrações de banco sempre passam pelo `supabase` + `security`
- Agentes comunicam via SendMessage, não por estado compartilhado

## Protocolo de Comunicação

```
Lead → architect → frontend / supabase / migration → qa → Lead
```

## Referências de Agentes

Consulte os arquivos individuais em `/agents/` para instruções detalhadas de cada agente.
