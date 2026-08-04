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

---

## [DEC-003] Arquitetura Modular em `src/modules/`
**Data**: 2026-06-25
**Status**: Aprovada
**Responsável**: Lead

### Contexto
A integração inicial do FF Instalações foi planejada como "sistema paralelo" — módulos FF seriam adicionados ao lado do Embio sem estrutura clara. Após auditoria completa dos 22 arquivos FF, ficou claro que a abordagem paralela criaria dívida técnica imediata: queries soltas em `src/lib/ff/`, componentes sem domínio definido, sem contrato de importação.

### Decisão
Adotar arquitetura modular com três domínios em `src/modules/`:

```
src/modules/
  commercial/   ← lógica comercial genérica (FF + futuros módulos)
  embio/        ← lógica específica da Embio (produtos, propulsores, dimensionamento)
  shared/       ← infraestrutura reutilizável (auth, branding, UI, utils)
```

Cada módulo é autocontido: tem suas queries, componentes e um `index.ts` de barrel export. Módulos comerciais não conhecem módulos Embio. Ambos consomem `shared/`.

A migração é **aditiva**: novos módulos FF entram em `src/modules/commercial/`. O código Embio existente é reorganizado gradualmente, sem quebrar funcionalidade durante o processo.

### Consequências
- **Positivas**: escalabilidade clara; possível reutilizar `commercial/` em outros produtos; testabilidade por módulo; onboarding mais fácil para novos devs
- **Negativas**: custo único de migrar o código existente para `modules/` (Fases S1, E1, E2); `src/components/ui/` permanece fora da estrutura modular (shadcn convenção — não mover)
- Require adição de alias `@/modules` no `tsconfig.json` antes de mover arquivos

### Alternativas Consideradas
- **Manter estrutura plana atual**: mais simples no curto prazo, mas cresceria para pasta `src/` com 50+ arquivos sem organização
- **Feature folders** (pasta por feature em `src/features/`): similar à decisão tomada, mas sem separação clara commercial/embio/shared

---

## [DEC-004] `src/components/ui/` Permanece no Lugar
**Data**: 2026-06-25
**Status**: Aprovada
**Responsável**: Lead

### Contexto
A decisão DEC-003 cria `src/modules/shared/components/` para componentes de layout. A questão é se os componentes shadcn (`src/components/ui/`) devem ser movidos para dentro de `modules/`.

### Decisão
`src/components/ui/` **permanece em seu local atual** e nunca será movida para `modules/`.

### Consequências
- Ferramenta `npx shadcn add` continua funcionando sem configuração extra
- Caminhos como `@/components/ui/button` continuam válidos em todos os módulos
- Cria uma exceção intencional na estrutura modular: `shared/components/` contém componentes de layout, não componentes shadcn

### Alternativas Consideradas
- **Mover para `modules/shared/components/ui/`**: quebraria a toolchain shadcn e exigiria atualizar centenas de imports

---

## [DEC-005] Tabelas `clientes` (FF) e `clients` (Embio) Permanecem Separadas
**Data**: 2026-06-25
**Status**: Aprovada
**Responsável**: Lead

### Contexto
O plano original previa unificar os dois sistemas de clientes em uma única tabela `clients` (Embio), adicionando colunas FF. Após ler o código real dos dois sistemas, os schemas são incompatíveis:

- `clients` (Embio): `producer_name`, `property_name`, `location`, `production_type` — cliente produtor rural
- `clientes` (FF): `nome`, `telefone`, `endereco`, `observacoes` — cliente de instalações elétricas

### Decisão
Criar tabela `clientes` (nomenclatura FF, em pt-BR) **separada** da tabela `clients` (Embio). Não adicionar colunas FF à tabela `clients` existente.

### Consequências
- A tabela `clients` permanece intocada (sem risco de regressão)
- Um "cliente" Embio e um "cliente" FF são entidades distintas no banco
- Se no futuro for necessário vincular os dois (ex: um produtor rural que também é cliente de instalações), criar tabela de relacionamento ou campo `clients_id` opcional em `clientes`

### Alternativas Consideradas
- **ADD COLUMN na `clients`**: risco de regressão em queries que assumem campos específicos; mistura semântica; campos em idiomas diferentes na mesma tabela

---

## [DEC-006] `SettingsProvider` (FF) Substituído por `useBranding()` (Embio)
**Data**: 2026-06-25
**Status**: Aprovada
**Responsável**: Lead

### Contexto
O `SettingsProvider.tsx` do FF:
1. Importa `hexToOklchString` de `@/lib/colorUtils` — arquivo não existe no Embio
2. Leria a tabela `configuracoes` (hex colors) — redundante com `branding_settings` (HSL colors)
3. Expõe `useSettings()` com `{ config.nome_empresa, config.logo_url, config.cor_primaria }`

O Embio já tem `useBranding()` com equivalentes: `branding.company_name`, `branding.logo_url`, `branding.primary_color`.

### Decisão
Não criar `SettingsProvider`, não criar tabela `configuracoes`. Módulos FF que usam `useSettings()` são adaptados para usar `useBranding()` com mapeamento de campos. Para PDF, converter `primary_color` (HSL) para hex usando a função `hslToHex()` já disponível em `useBranding.tsx`.

### Consequências
- Uma fonte de verdade para configuração visual (branding_settings)
- `SettingsProvider.tsx` e `configuracoes` table removidos do plano permanentemente
- Módulos FF precisam de adaptação nas chamadas de configuração (substituição de `useSettings()`)

### Alternativas Consideradas
- **Criar `configuracoes` separada**: duas tabelas de configuração visual — inconsistência garantida
- **Criar `colorUtils.ts` com OKLCH**: introduz Tailwind v4 color system no projeto que usa Tailwind v3 + HSL

---

## [DEC-007] Módulos FF Não Usam `@tanstack/react-start`
**Data**: 2026-06-25
**Status**: Aprovada
**Responsável**: Lead

### Contexto
Dois arquivos do FF (`auth-attacher.ts`, `auth-middleware.ts`) usam `@tanstack/react-start` (framework SSR). O Embio é uma SPA Vite sem SSR.

### Decisão
`auth-attacher.ts` e `auth-middleware.ts` são **descartados permanentemente**. Nenhum módulo FF importará de `@tanstack/react-start`. O `DashboardModule.tsx` tem um import de tipo (`AgendaPrefill`) de uma rota TanStack que será substituído por definição local do tipo.

### Consequências
- Auth em produção usa exclusivamente o `useAuth.tsx` do Embio (Context + Provider + onAuthStateChange)
- Server-side auth validation não existe no sistema (não é necessária para SPA com Supabase RLS)

### Alternativas Consideradas
- **Instalar `@tanstack/react-start`**: adicionaria runtime SSR a uma SPA — incompatível por design

---

## [DEC-008] `queries.ts` do FF Dividido por Módulo
**Data**: 2026-06-25
**Status**: Aprovada
**Responsável**: Lead

### Contexto
O `queries.ts` do FF é um arquivo único com queries de 6 tabelas diferentes (clientes, servicos, caixa, manutencoes, contas_futuras, configuracoes). O `orcamentoQueries.ts` é similar (catalogo_itens, orcamentos, orcamento_itens).

### Decisão
As queries são **divididas por módulo** — cada `src/modules/commercial/<modulo>/queries.ts` contém apenas as queries relevantes para aquele módulo, extraídas dos arquivos FF.

```
commercial/clientes/queries.ts    ← fetchClientes, createCliente, updateCliente, deleteCliente
commercial/agenda/queries.ts      ← fetchServicos, createServico, marcarConcluido, fetchManutencoes, ...
commercial/financeiro/queries.ts  ← fetchCaixa, createCaixaManual, updateCaixaEntry, ...
commercial/catalogo/queries.ts    ← fetchCatalogo, createCatalogoItem, ...
commercial/orcamentos/queries.ts  ← fetchOrcamentos, createOrcamento, converterOrcamentoEmServico, ...
```

### Consequências
- Acoplamento reduzido: `ClientesModule` só importa queries de clientes
- Mais fácil de testar e manter cada módulo isoladamente
- Custo único de separar as queries (moderado — são funções independentes no arquivo original)

### Alternativas Consideradas
- **Manter `queries.ts` único em `src/lib/ff/`**: mais rápido de copiar, mas cria um "god file" de queries sem dono claro

---

## [DEC-009] Role de Autorização em Tabela `user_roles` Separada
**Data**: 2026-08-04
**Status**: Aprovada
**Responsável**: Lead

### Contexto
Missão 04A precisa de uma fonte oficial de role (`super_admin` / `vendedor`) que o próprio usuário não consiga alterar, compatível com RLS e auditável. As alternativas eram `profiles.role`, uma tabela `user_roles` separada, ou custom claims via Auth Hook.

### Decisão
Criar `public.user_roles(user_id, role)` com `UNIQUE(user_id, role)`, sem nenhuma policy de `INSERT`/`UPDATE`/`DELETE` para `authenticated` — apenas `service_role` escreve. Uma função `public.is_super_admin()` (`SECURITY DEFINER`, `search_path = ''`) é usada nas policies de RLS das tabelas comerciais. Não foi criado Auth Hook de custom claims nesta missão.

### Consequências
- Um vendedor não consegue se autopromover mesmo tendo UPDATE total na própria linha de `profiles`, porque a role nunca esteve em `profiles`.
- Toda promoção/demoção passa obrigatoriamente pelo Supabase Dashboard/SQL Editor (ação manual e auditável) até que exista um fluxo de convite administrativo.
- Preparado para expansão multiempresa futura: `user_roles` já suporta múltiplas roles por usuário via `UNIQUE(user_id, role)`.
- Sem Auth Hook, o frontend consulta `user_roles` diretamente (protegido por RLS) em vez de decodificar um claim do JWT — uma query extra no login, mas sem risco de claim desatualizado após uma mudança de role.

### Alternativas Consideradas
- **`profiles.role`**: mesma tabela que o usuário já teria permissão de `UPDATE` em outras colunas — exigiria proteção coluna-a-coluna (trigger `BEFORE UPDATE` bloqueando mudança de `role`), mais frágil que simplesmente não conceder a policy de escrita.
- **Custom claims via Auth Hook**: mais performático (role já vem no JWT), mas exige configuração manual no Supabase Dashboard (Authentication > Hooks) e sofre de claim desatualizado até o próximo refresh de token após uma mudança de role. Fica registrado como possível evolução futura.

---

## [DEC-010] Bloqueio de Vendedor em Três Camadas: Edge Function + `profiles.status` + RLS
**Data**: 2026-08-04
**Status**: Aprovada
**Responsável**: Lead

### Contexto
Missão 04B precisa que o Super Admin consiga bloquear/desbloquear/desligar/reativar vendedores de forma real (impedindo login), não só uma bandeira decorativa. `auth.admin.updateUserById` (a única forma de banir uma conta de verdade no Supabase Auth) exige a `service_role` key, que nunca pode chegar ao navegador. O ambiente onde este código foi escrito não tinha Supabase CLI/Deno/Docker instalados, então a Edge Function não pôde ser testada nem implantada nesta sessão.

### Decisão
Três camadas, cada uma cobrindo a lacuna da anterior:
1. **Edge Function `admin-user-actions`** (`supabase/functions/admin-user-actions/`) — roda com `service_role` só no servidor, valida o JWT do chamador e confirma `super_admin` via `user_roles` antes de qualquer ação. Bane/desbane de verdade via `auth.admin.updateUserById` (`ban_duration`), e sincroniza `profiles.status` na mesma chamada.
2. **`profiles.status`** (`'ativo' | 'bloqueado' | 'desligado'`, `DEFAULT 'ativo'`) — lido pelo `useAuth` a cada sessão; se não for `'ativo'`, força `signOut()` imediato no frontend. Protegido contra autoedição por um trigger `BEFORE UPDATE` que só aceita mudança de `status` vinda de `super_admin` ou da própria Edge Function (via `auth.role() = 'service_role'`).
3. **`is_active_user()` nas policies de dono** das 6 tabelas comerciais (`clientes`, `catalogo_itens`, `servicos`, `orcamentos`, `orcamento_itens`, `financeiro_movimentacoes`) — fecha a lacuna de um JWT já emitido e ainda válido (o Auth do Supabase não invalida tokens em emissão retroativa): mesmo com token capturado, leitura/escrita direta na API para quando `status != 'ativo'`. Não afeta as policies de leitura administrativa do Super Admin — histórico de um vendedor bloqueado continua visível para ele.

### Consequências
- Bloqueio funciona mesmo sem a Edge Function implantada (camadas 2 e 3 já cortam o acesso), mas só a Edge Function impede login em si — até o deploy, uma sessão já aberta com token ainda válido só é cortada quando o app roda de novo (camada 2) ou quando chama a API diretamente (camada 3), nunca por revogação do próprio Auth.
- `profiles.status` nunca é a fonte de verdade de "a pessoa consegue logar" — é sincronia e UX. A fonte de verdade de acesso real é `auth.users.banned_until`, controlada só pela Edge Function.
- Custo de manutenção: três lugares para manter coerentes em vez de um. Aceito porque nenhuma camada sozinha resolve tudo com as ferramentas disponíveis nesta missão.
- Rate limiting da Edge Function é em memória, por instância — reseta a cada cold start, não é distribuído. Documentado como limitação, não um rate limit robusto.

### Alternativas Consideradas
- **Só `profiles.status` + RLS, sem Edge Function**: mais simples, mas não impede login de verdade — a pessoa continua autenticando no Supabase Auth, só perde acesso *dentro* do app. Rejeitada porque o pedido explícito da missão foi bloqueio real via `auth.admin.updateUserById`.
- **Só Edge Function, sem `profiles.status`**: mais simples de manter, mas sem a Edge Function implantada (não há deploy nesta sessão) o bloqueio não teria efeito nenhum até o usuário rodar `supabase functions deploy` por conta própria. `profiles.status` garante alguma proteção desde o primeiro commit, sem depender de uma etapa manual externa.
