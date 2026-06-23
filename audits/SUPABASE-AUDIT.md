# SUPABASE-AUDIT.md — Auditoria do Supabase

**Status**: PENDENTE — aguardando acesso ao projeto Supabase do Lovable  
**Responsável**: Agentes `supabase` + `security`  
**Data de início**: A definir

---

## Objetivo

Mapear o schema, policies, Storage e Auth do projeto Supabase atual (Lovable) para planejar a migração para o novo projeto independente.

## Checklist

### Schema e Tabelas
- [ ] Lista de todas as tabelas exportada
- [ ] Schema completo de cada tabela documentado
- [ ] Relacionamentos (FKs) mapeados
- [ ] Índices existentes documentados
- [ ] Triggers e funções documentados

### RLS e Policies
- [ ] RLS habilitado verificado em cada tabela
- [ ] Cada policy documentada e avaliada
- [ ] Policies inadequadas ou ausentes identificadas

### Auth
- [ ] Provedores de auth configurados
- [ ] Usuários existentes (quantidade, não PII)
- [ ] Configurações de e-mail documentadas
- [ ] URLs de redirect documentadas

### Storage
- [ ] Lista de buckets
- [ ] Configuração de acesso por bucket (público/privado)
- [ ] Policies de Storage documentadas
- [ ] Volume estimado de dados armazenados

### Dados
- [ ] Volume de dados por tabela (número de registros)
- [ ] Estratégia de exportação definida
- [ ] Estratégia de importação no novo projeto definida

---

## Resultado da Auditoria

_A preencher após acesso ao Supabase atual._

### Tabelas Identificadas

| Tabela | Colunas | Registros | RLS | Notas |
|--------|---------|-----------|-----|-------|
| (a preencher) | | | | |

### Policies por Tabela

| Tabela | Policy | Tipo | Avaliação |
|--------|--------|------|-----------|
| (a preencher) | | | |

### Buckets de Storage

| Bucket | Acesso | Policies | Tamanho Estimado |
|--------|--------|----------|-----------------|
| (a preencher) | | | |

### Plano de Migração de Dados

_A definir após auditoria. Incluir:_
- Ordem de migração (respeitando FKs)
- Ferramenta de migração (Supabase CLI, pg_dump, script customizado)
- Plano de rollback
- Janela de migração (data, horário, duração estimada)
