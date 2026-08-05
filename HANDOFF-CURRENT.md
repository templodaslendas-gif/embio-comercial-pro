# HANDOFF-CURRENT.md

**Projeto**: Embio Comercial Pro
**Caminho local**: `C:\Users\Usuario\Desktop\Flavio\sites DIVERSOS\Embio-Comercial-Pro`
**Branch**: main
**Último commit local**: ccba947 — "feat: acesso somente por convite (Missão 05)"
**Missão atual**: MISSÃO 05 — Controle de Acesso Somente por Convite

## Tarefas concluídas

1. `src/hooks/useAuth.tsx`: removido `signUp` público; adicionado `resetPassword(email)` (usa `resetPasswordForEmail` com `redirectTo` para `/reset-password`).
2. `src/pages/Auth.tsx`: reescrito — só login + "Esqueci minha senha"; nenhum toggle/cadastro/signup restante.
3. `src/pages/ResetPassword.tsx` (novo): tela única para aceite de convite e recovery. Gate de segurança: só aceita `type=invite|recovery` no hash da URL + sessão real estabelecida pelo Supabase; trata link expirado/usado (`error`/`error_code` no hash) e timeout de 4s sem sessão. Rota registrada em `App.tsx` como `/reset-password`, fora de `ProtectedRoute`/`AdminRoute`.
4. `supabase/functions/admin-user-actions/index.ts`: adicionadas ações `invite_user` (cria/convida via `auth.admin.inviteUserByEmail`, valida email/nome, não revela e-mail duplicado, usa `APP_ORIGIN` — nunca redirectTo do payload) e `resend_invite`. Triggers existentes (`handle_new_user`, `seed_role_on_signup`, `seed_branding_on_signup`, seed de catálogo) cobrem profile/role/branding/catálogo automaticamente no convite.
5. `src/lib/adminUserActions.ts`: novo tipo `resend_invite`, função `inviteVendedor()`.
6. `src/components/admin/NovoVendedorDialog.tsx` (novo) + botão "Novo vendedor" em `AdminVendedores.tsx`.
7. `src/components/admin/VendedorActionsMenu.tsx`: item "Reenviar convite" adicionado.
8. `supabase/functions/admin-user-actions/README.md`: documentado `APP_ORIGIN` (secret obrigatório, ainda não configurado em produção) e checklist manual estendido (13 passos, incluindo convite/reenvio).
9. `src/i18n/locales/{pt,en}.json`: chaves de `auth` limpas (sem signup/noAccount/hasAccount), novas chaves `auth.forgotPassword*` e seção `resetPassword.*`.
10. Validação: `npx tsc --noEmit` limpo, `npm run test` 5/5, `npm run build` ok (warning de chunk size é pré-existente, fora de escopo). Greps de segurança: zero `service_role` em `src/`, zero `signUp` público, zero senha logada.

## Tarefa em andamento

Nenhuma — bloco da Missão 05 fechado e commitado. Falta apenas o relatório final ao usuário (próxima ação do Claude nesta mesma sessão, não requer código).

## Próxima ação exata para o Codex

Se retomar a partir daqui: **nenhuma ação de código pendente**. Se o usuário aprovar após teste manual, a sequência é:
1. `supabase secrets set APP_ORIGIN=https://SEU_DOMINIO --project-ref mnatdneugogtmsjafzar` (produção).
2. `supabase functions deploy admin-user-actions --project-ref mnatdneugogtmsjafzar`.
3. No Supabase Dashboard: Authentication → Providers → Email → desativar "Allow new users to sign up" (só depois do convite validado manualmente).
4. `git push origin main` — só com aprovação explícita do responsável.

## Arquivos alterados (commitados em ccba947)

`src/App.tsx`, `src/hooks/useAuth.tsx`, `src/pages/Auth.tsx`, `src/pages/ResetPassword.tsx` (novo), `src/lib/adminUserActions.ts`, `src/components/admin/VendedorActionsMenu.tsx`, `src/components/admin/NovoVendedorDialog.tsx` (novo), `src/pages/admin/AdminVendedores.tsx`, `src/i18n/locales/{pt,en}.json`, `supabase/functions/admin-user-actions/{index.ts,README.md}`.

## Alterações não commitadas

Nenhuma relativa a esta missão. Untracked pré-existentes e não tocados: `.claude/`, `docs/superpowers/plans/*.md`, `incoming-ff-modules/`.

## Migrations

Nenhuma criada. Nenhuma aplicada. A base de dados (roles, `profiles.status`, `is_super_admin()`, `is_active_user()`, triggers de seed) já suportava o fluxo — confirmado por leitura das migrations 04A/04A.1/04B antes de codar.

## Edge Functions

- **Criadas/alteradas**: `admin-user-actions` (ações `invite_user`, `resend_invite` adicionadas).
- **Implantadas**: nenhuma. Não publicado nesta sessão (regra da missão).

## Testes executados

`npx tsc --noEmit` (0 erros), `npm run test` (5/5 passando), `npm run build` (sucesso), greps de segurança (`service_role`, `signUp`, senha em log) — todos limpos.

## Testes manuais pendentes

Checklist completo entregue no relatório final ao usuário (19 itens da missão + 4 específicos de convite/reenvio no README da function). Requer: `APP_ORIGIN` configurado e função implantada em ambiente de teste antes de testar convite real.

## Erros conhecidos

Nenhum. Warning de bundle size no build (`index-*.js` de 2MB) é pré-existente, não relacionado a esta missão.

## Restrições

Sem push, sem deploy de function, sem migration remota, sem desativar signup no Supabase Dashboard — todos aguardando aprovação explícita do responsável após teste manual.

## Instrução curta para o Codex

Não recodar nada. Se chamado, apenas: revisar o diff do commit `ccba947`, e — só mediante aprovação explícita do usuário — executar a sequência de deploy/config listada em "Próxima ação exata" acima.
