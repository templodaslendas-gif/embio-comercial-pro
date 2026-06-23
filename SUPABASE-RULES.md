# SUPABASE-RULES.md — Embio Comercial Pro

## Configuração do Projeto Supabase

- **Projeto**: A definir (criar projeto no Supabase antes do primeiro deploy)
- **Região**: South America (São Paulo) — `sa-east-1`
- **Plan**: Free (desenvolvimento) → Pro (produção)

## Chaves e Variáveis

### Variáveis de Ambiente Necessárias

```env
# .env.local (NUNCA commitar)
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>

# Apenas server-side / Edge Functions
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

### Onde Usar Cada Chave

| Chave             | Frontend | Edge Function | NUNCA                    |
|-------------------|----------|---------------|--------------------------|
| `anon_key`        | ✅ SIM   | Opcional      | Sem RLS em dados privados|
| `service_role`    | ❌ NÃO   | ✅ SIM        | Exposta ao cliente       |

## Auth

- Usar Supabase Auth como único provedor de autenticação
- Habilitar confirmação de e-mail em produção
- Configurar URL de redirect para o domínio correto no Vercel
- Nunca armazenar tokens em `localStorage` manualmente — Supabase gerencia

## Storage

- Criar buckets separados por tipo: `orcamentos-pdf`, `logos`, `fotos-produtos`
- Buckets privados por padrão — links públicos apenas quando necessário
- URLs de download com expiração (`createSignedUrl` com TTL)
- Policy de storage deve espelhar RLS da tabela correspondente

## Edge Functions

- Usar para: envio de e-mails, webhooks, processamento de pagamentos
- Nunca usar para: lógica de negócio simples (manter no frontend com RLS)
- Variáveis de ambiente configuradas via `supabase secrets set`

## Realtime

- Habilitar apenas nas tabelas que realmente precisam (reduz custos)
- Tabelas candidatas: `agenda`, `orcamentos` (status)

## Monitoramento

- Verificar logs no Supabase Dashboard semanalmente
- Alertas de uso configurados (para não exceder limites do plano)
- Queries lentas identificadas via `pg_stat_statements`

## Backup

- Supabase Pro inclui backups automáticos diários com PITR (Point-in-Time Recovery)
- Fazer export manual antes de migrations críticas
- Salvar exports em `/backups/` com data no nome: `backup_YYYYMMDD.sql`

## Proibições

- NUNCA deletar projeto Supabase sem backup completo
- NUNCA alterar `auth.users` diretamente (usar apenas via API do Supabase Auth)
- NUNCA desabilitar RLS em produção
- NUNCA commitar as chaves do Supabase
