# DATABASE-RULES.md — Embio Comercial Pro

## Princípios Gerais

1. **Toda tabela tem RLS habilitado** — sem exceção
2. **Toda migration é versionada** — arquivo em `/database/migrations/`
3. **Nenhuma alteração direta no SQL Editor do Supabase** sem registrar como migration
4. **Nomes em snake_case** para tabelas e colunas
5. **Timestamps em UTC** — `created_at`, `updated_at` em todas as tabelas
6. **Soft delete preferido** — coluna `deleted_at` em vez de DELETE físico para dados críticos

## Convenções de Nomenclatura

### Tabelas
```
clientes           → entidade principal no singular
orcamentos         → sem acento (compatibilidade)
orcamento_itens    → tabela de junção: entidade_entidade
propulsores        → catálogo de produtos
```

### Colunas
```
id                 → UUID, primary key
user_id            → FK para auth.users
created_at         → timestamp with time zone, default now()
updated_at         → timestamp with time zone, atualizado por trigger
deleted_at         → timestamp, null = ativo
```

## Estrutura de Migrations

Arquivo: `/database/migrations/YYYYMMDD_HHMMSS_descricao.sql`

```sql
-- Exemplo: 20260623_120000_create_clientes.sql

-- UP
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

-- DOWN (rollback)
-- DROP TABLE clientes;
```

## Políticas de RLS Padrão

Todo arquivo de policy vai em `/database/policies/`.

```sql
-- Policy padrão: usuário vê apenas seus próprios dados
CREATE POLICY "users_own_data" ON clientes
  FOR ALL USING (auth.uid() = user_id);
```

## Proibições

- NUNCA usar `DISABLE ROW LEVEL SECURITY` em produção
- NUNCA expor `service_role` key no frontend
- NUNCA fazer migrations destrutivas sem backup prévio
- NUNCA alterar banco de produção diretamente — sempre via migration versionada
- NUNCA armazenar senhas em texto plano (usar Supabase Auth)

## Tabelas Planejadas

| Tabela              | Módulo         | Status     |
|---------------------|----------------|------------|
| `clientes`          | Core           | A criar    |
| `orcamentos`        | Core           | A criar    |
| `orcamento_itens`   | Core           | A criar    |
| `propulsores`       | Core           | A criar    |
| `lagoas`            | Core           | A criar    |
| `produtos`          | Comercial      | A criar    |
| `agenda`            | FF Módulos     | A criar    |
| `financeiro`        | FF Módulos     | A criar    |
| `servicos`          | FF Módulos     | A criar    |
