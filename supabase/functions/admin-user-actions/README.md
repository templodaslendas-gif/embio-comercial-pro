# admin-user-actions

Edge Function que bloqueia, desbloqueia, marca como desligado, reativa e
envia recuperação de senha para contas de vendedores — chamada apenas pelo
painel `/admin` do Super Admin.

Não foi possível testar ou implantar esta função nesta sessão: o ambiente
onde este código foi escrito não tem Supabase CLI, Deno nem Docker
instalados (verificado antes de escrever este arquivo). As instruções
abaixo são exatas para você rodar localmente e implantar por conta própria.

## 1. Pré-requisitos

- [Supabase CLI](https://supabase.com/docs/guides/cli) instalado (`npm install -g supabase` ou `scoop install supabase` no Windows).
- Estar logado: `supabase login`.
- Projeto: `mnatdneugogtmsjafzar` (de `supabase/config.toml`).

## 2. Secrets necessários

`SUPABASE_URL`, `SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` são
injetadas automaticamente em toda Edge Function pelo Supabase — **não**
precisam ser configuradas manualmente com `supabase secrets set`. Para
confirmar que estão disponíveis no seu projeto:

```bash
supabase secrets list --project-ref mnatdneugogtmsjafzar
```

Esta função não usa nenhuma outra variável além dessas três.

## 3. Teste local (antes de implantar)

Requer Docker rodando (o Supabase CLI usa Docker para o stack local).

```bash
# Na raiz do projeto:
supabase start
supabase functions serve admin-user-actions --no-verify-jwt
```

`--no-verify-jwt` desliga a checagem de JWT que a plataforma normalmente
faz antes da function rodar — usamos isso só para poder mandar um payload
de teste sem uma sessão real local. A validação de JWT que importa (quem é
o usuário, e se ele é `super_admin`) continua acontecendo **dentro** do
código da function, sempre.

Com o stack local rodando, teste com curl (substitua `SEU_JWT_DE_ADMIN` por
um access token de uma sessão local de um usuário que já seja
`super_admin` na tabela `user_roles`):

```bash
curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/admin-user-actions' \
  --header 'Authorization: Bearer SEU_JWT_DE_ADMIN' \
  --header 'Content-Type: application/json' \
  --data '{"action":"block","targetUserId":"00000000-0000-0000-0000-000000000000"}'
```

## 4. Deploy em produção

```bash
supabase functions deploy admin-user-actions --project-ref mnatdneugogtmsjafzar
```

Isso implanta a função no projeto remoto. O frontend já está preparado
para chamá-la via `supabase.functions.invoke("admin-user-actions", ...)`
(ver `src/lib/adminUserActions.ts`) — nenhuma URL precisa ser configurada
manualmente, o cliente Supabase já resolve o endpoint da function a partir
das mesmas `VITE_SUPABASE_URL`/`VITE_SUPABASE_PUBLISHABLE_KEY` usadas pelo
resto do app.

## 5. Teste em produção via curl

Pegue um access token real: no navegador, logado como `super_admin`, abra
o DevTools → Application/Storage → Local Storage → chave
`sb-<project-ref>-auth-token` → copie o campo `access_token`.

```bash
curl -i --location --request POST \
  'https://mnatdneugogtmsjafzar.supabase.co/functions/v1/admin-user-actions' \
  --header 'Authorization: Bearer SEU_ACCESS_TOKEN' \
  --header 'Content-Type: application/json' \
  --data '{"action":"send_password_reset","targetUserId":"UUID_DE_UM_VENDEDOR_DE_TESTE"}'
```

Resposta esperada: `200` com `{"success":true,...}`.

## 6. Checklist manual pós-deploy

Rode estes casos com curl ou pela UI, nesta ordem:

1. **Chamador não autenticado** (sem header `Authorization`) → `401`.
2. **Chamador autenticado, mas `vendedor`** (não `super_admin`) → `403`.
3. **`action` fora da lista permitida** (ex.: `"delete"`) → `400`.
4. **`targetUserId` que não é um UUID** (ex.: `"abc"`) → `400`.
5. **Super Admin tentando bloquear a própria conta** (`targetUserId` = id do próprio chamador, `action: "block"`) → `400`.
6. **Bloqueio real**: `action: "block"` num vendedor de teste → `200`; confirme que esse vendedor não consegue mais logar (tentar login real na tela `/auth`); confirme `profiles.status = 'bloqueado'` para ele.
7. **Desbloqueio**: `action: "unblock"` no mesmo vendedor → `200`; confirme que o login volta a funcionar e `profiles.status = 'ativo'`.
8. **Desligamento e reativação**: repita 6 e 7 com `action: "offboard"` e `action: "reactivate"`.
9. **Recuperação de senha**: `action: "send_password_reset"` → `200`; confirme que o e-mail chega à caixa do vendedor de teste.
10. **Rate limit**: chame a function duas vezes seguidas (menos de 2s de intervalo) com o mesmo admin → a segunda chamada deve retornar `429`.

Se qualquer um desses passos falhar, pare e revise o código antes de usar a
função com vendedores reais.
