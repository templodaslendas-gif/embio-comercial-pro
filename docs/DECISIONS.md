# DECISIONS.md — Embio Comercial Pro

Registro de decisões técnicas e de produto tomadas ao longo do projeto.

---

## Template de Entrada

```
## [DEC-XXX] Título da Decisão
**Data**: YYYY-MM-DD
**Status**: Proposta | Aprovada | Rejeitada | Substituída
**Responsável**: [nome ou agente]

### Contexto
[O que levou a essa decisão?]

### Decisão
[O que foi decidido?]

### Consequências
[O que muda com essa decisão? Trade-offs.]

### Alternativas Consideradas
[O que mais foi avaliado e por que foi descartado?]
```

---

## [DEC-001] Stack Tecnológica do Frontend
**Data**: 2026-06-23  
**Status**: Aprovada  
**Responsável**: Lead

### Contexto
O projeto vem do Lovable, que usa React + TypeScript + Tailwind CSS + shadcn/ui. A migração precisa manter compatibilidade com o código existente.

### Decisão
Manter React + TypeScript + Tailwind CSS + shadcn/ui como stack principal. Não migrar para Next.js inicialmente — avaliar após estabilização.

### Consequências
- Reutiliza código existente com mínima refatoração
- Deploy como SPA no Vercel (sem SSR inicialmente)
- SEO não é requisito (sistema interno)

### Alternativas Consideradas
- **Next.js**: melhor para SEO e performance inicial, mas adicionaria complexidade desnecessária para sistema interno
- **Vue/Nuxt**: mudança de stack muito disruptiva

---

## [DEC-002] Backend via Supabase
**Data**: 2026-06-23  
**Status**: Aprovada  
**Responsável**: Lead

### Contexto
O projeto já usa Supabase no Lovable. Manter minimiza trabalho de migração.

### Decisão
Manter Supabase como backend (PostgreSQL + Auth + Storage). Criar novo projeto Supabase para independência total do Lovable.

### Consequências
- Necessário exportar schema e dados do Supabase do Lovable
- RLS deve ser configurado do zero com boas práticas
- Custo de operação definido pelo plano do Supabase

### Alternativas Consideradas
- **Firebase**: ecosistema diferente, migração mais trabalhosa
- **Backend próprio (Node.js/Express)**: muito mais trabalho, sem benefício claro
