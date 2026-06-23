# SECURITY-CHECKLIST.md — Embio Comercial Pro

## Antes de Qualquer Deploy

### Autenticação e Autorização
- [ ] Supabase Auth configurado corretamente
- [ ] RLS (Row Level Security) habilitado em TODAS as tabelas
- [ ] Policies de RLS revisadas e testadas
- [ ] JWT secrets não expostos no frontend
- [ ] Sessões com expiração configurada

### Variáveis de Ambiente
- [ ] `.env.local` no `.gitignore`
- [ ] Nenhuma chave de API no código fonte
- [ ] `SUPABASE_ANON_KEY` usada apenas no frontend (é pública por design)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` usada APENAS em funções server-side
- [ ] Variáveis de produção configuradas no Vercel (não commitadas)

### Banco de Dados
- [ ] Nenhuma tabela sem RLS
- [ ] Service Role Key nunca exposta ao cliente
- [ ] Backups automáticos habilitados no Supabase
- [ ] Dados sensíveis de clientes protegidos por policy de `user_id`

### Frontend
- [ ] Input de formulários sanitizado e validado
- [ ] Sem `dangerouslySetInnerHTML` sem sanitização
- [ ] CORS configurado corretamente
- [ ] Headers de segurança no Vercel (`X-Frame-Options`, `CSP`)

### PDF e Storage
- [ ] Arquivos no Storage acessíveis apenas ao usuário dono
- [ ] URLs de download com tempo de expiração
- [ ] Nenhum dado sensível em URLs públicas

### Dependências
- [ ] `npm audit` rodado antes de cada release
- [ ] Dependências atualizadas (sem vulnerabilidades críticas)
- [ ] Sem pacotes abandonados em posições críticas

## Auditorias Periódicas

| Frequência | Ação |
|------------|------|
| A cada PR  | Revisar mudanças em policies do Supabase |
| Semanal    | `npm audit` + revisar logs de acesso |
| Mensal     | Revisar usuários e permissões no Supabase |
| Por release| Checklist completo acima |

## Incidentes

Registrar qualquer incidente de segurança em `/audits/` com data, descrição e ação tomada.
