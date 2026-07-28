# Embio Intelligence Pro — Redesign Visual (Fase 1)

Missão exclusivamente visual. Sem alterações em Supabase, schema, RLS, financeiro, ranking, cashback ou super admin.

## Identidade
- Cor de marca única: petróleo escuro (`#014260`-derivado) como `--primary` em todo o app (hoje só no login). Verde institucional (`--accent`, hsl(120,55%,38%)) mantido como destaque positivo.
- Brilho luminoso restrito a: KPI ativo, botão primário no hover, ponto ativo de gráfico. Nunca neon/gamer.
- Login: logo Embio em destaque forte, "Embio Intelligence Pro", slogan "Gestão inteligente de clientes, propostas e vendas.", mantendo também "Venda mais. Organize melhor. Acompanhe tudo." Remover `NICHE_TAG` ("segmento suíno") de `Auth.tsx` — texto institucional passa a ser genérico multi-segmento. Mobile reorganiza a identidade em coluna vertical própria (não é a coluna desktop encolhida).

## Tipografia
Escala única título/subtítulo/card-label/número/botão via classes utilitárias compartilhadas. Fonte humana/comercial (Inter, já em uso) — sem fontes quadradas/futuristas. Piso mínimo de 12px para qualquer texto com informação (elimina os `text-[10px]`/`text-[10.5px]` usados hoje em labels de grupo e rodapés).

## Sidebar
Mais contraste nos itens inativos, fonte um pouco maior, estado ativo trocado de verde chapado por destaque translúcido + borda luminosa sutil, hover premium, espaçamento maior entre grupos.

## Dashboard (`src/pages/Index.tsx`)
Hierarquia: saudação/contexto → clima compacto → KPIs → gráficos → ações rápidas → atividades/propostas recentes.
Eliminar duplicidade "Orçamentos"/"Propostas" (mesmo destino `/orcamentos`) — 1 card só. Reduzir grade de módulos ao necessário.

## Gráficos (Recharts, mantido)
Só os que ajudam a entender vendas/propostas/desempenho: evolução (área c/ gradiente), mix de status (rosca), funil de propostas (aberto→fechado→finalizado), meta x realizado (lê `branding_settings.meta_mensal`, somente leitura, sem alterar Supabase). Todos com: tooltip pt-BR/moeda, dark mode ok, mobile ok, estado vazio profissional (nunca dado fictício), labels legíveis, animação discreta de entrada.

## Cards
Unificar tudo sobre `PremiumCard` (raio, padding, shadow, hover únicos). Migrar os cards de módulo do dashboard que hoje reimplementam o estilo manualmente.

## Framer Motion
Instalar. Uso restrito a microinterações e entrada suave (fade/slide de seções, hover de cards, ponto de gráfico). Respeitar `prefers-reduced-motion`, sem animar tudo simultaneamente, sem custo perceptível no mobile.

## Responsividade
Validar 320/375/390/430/768/1366/1440/1920: sem scroll horizontal, sidebar/menu mobile, tabelas, gráficos, modais, selects, cards, títulos longos, valores monetários grandes, teclado virtual no login, áreas de toque adequadas.

## Dark mode
Revisão de profundidade real (não inversão simples) em cards, sidebar e gráficos.

## Fora de escopo
StatsCards.tsx (código morto, não referenciado) — não tocar. Nenhuma tabela, migration, policy, função Supabase ou fluxo financeiro. Nenhum dado fictício em gráficos.

## Checkpoint
Working tree limpo em `main` no commit `cb76d62` antes do início — reversão segura via `git revert`/`git reset` se necessário.
