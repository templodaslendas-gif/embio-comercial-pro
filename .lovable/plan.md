## Escopo
Editar APENAS `src/pages/Index.tsx`. Sem alterações em backend, rotas, schemas, i18n, outras telas, `index.css` ou `tailwind.config.ts`. Sem novas dependências (usar `recharts` + `lucide-react` já instalados).

## Preservado integralmente
`useAuth`, `useBranding`, query `supabase.from("quotes").select`, `productDetails`, `propulsorDetails`, `filteredByMonth`, `availableMonths`, `statusLabels`, `unitLabel`, `renderQuoteList`, badges, ids dos `expandedCard` (`feitos`, `fechados`, `aberto`, `finalizados`, `produtos`, `propulsores`), filtros por mês, contagens, footer `t("dashboard.dataFooter")`, watermark da logo.

## Nova estrutura

```text
┌────────────────────────────────────────────┐
│ HERO premium                               │
│  Saudação (Bom dia/tarde/noite, Nome 👋)   │
│  Título: Painel de Orçamentos              │
│  Subtítulo + data atual PT-BR              │
│  Mini-resumo: Total · Movimentado · Aprov% │
├────────────────────────────────────────────┤
│ AÇÕES RÁPIDAS (Link p/ rotas existentes)   │
├────────────────────────────────────────────┤
│ MÉTRICAS (4 cards premium, count-up)       │
├────────────────────────────────────────────┤
│ GRÁFICOS: Área 30d  |  Donut status        │
├────────────────────────────────────────────┤
│ Produtos Cotados   |   Propulsores Cotados │
└────────────────────────────────────────────┘
```

## Detalhes

### Fundo premium
Wrapper raiz `relative`; camada `-z-10` com dois blobs (`bg-primary/20 blur-3xl rounded-full w-[480px] h-[480px]` top-right; `bg-accent/15 blur-3xl` bottom-left) + radial-gradient sutil inline. Watermark da logo mantida.

### Hero
Saudação por `new Date().getHours()` (<12 dia / <18 tarde / noite). Nome = primeiro token de `branding.company_name`, fallback `user.email` (capitalizado). Data via `toLocaleDateString("pt-BR", {weekday, day:'2-digit', month:'long'})`. Mini-resumo em 3 mini-cards translúcidos.

- `valorMovimentado` (useMemo): `Σ input_value * (frascos>0 ? frascos : 1) `(fallback `input_value` quando `frascos=0`), formatado em BRL via `Intl.NumberFormat`.
- `taxaAprovacao` (useMemo): `total ? round(fechados/total*100) : 0` exibido como `X%`.

### Quick Actions
4 pills (`Link`) responsivas (`grid-cols-2 sm:grid-cols-4`): Novo orçamento (`/novo-orcamento`), Clientes (`/clientes`), Marca (`/configuracoes-marca`), Preparo (`/instrucoes-preparo`). Estilo `bg-card/60 backdrop-blur border border-border/40 hover:border-primary/40`, ícone Lucide em círculo `bg-primary/10`.

### Cards de métricas
Mesmos dados/expansão. Classes: `rounded-3xl border border-border/40 bg-card/70 backdrop-blur-xl shadow-[0_8px_30px_-12px_hsl(var(--primary)/0.15)] hover:-translate-y-0.5 hover:shadow-[0_14px_40px_-12px_hsl(var(--primary)/0.25)] transition-all duration-300`. Ícone em círculo com gradiente `from-primary/15 to-accent/10`. Número grande com **count-up** local via `requestAnimationFrame` (~600ms, ease-out cubic) num hook `useCountUp`. Linha tendência placeholder: `— Últimos 30 dias` (sem inventar %). Expansão idêntica (`renderQuoteList`, Select de mês para `feitos`).

### Gráficos (recharts)
- `evolution` (useMemo): array de 30 dias (hoje−29..hoje), `{date,label,count}` agregando `quotes` por `created_at` (chave `YYYY-MM-DD`).
- `AreaChart` com gradiente `hsl(var(--primary))` (0.35→0), `XAxis` discreto, sem grid, `Tooltip` com `bg hsl(var(--card))`, border `hsl(var(--border))`, radius 12.
- Donut `PieChart` com 3 fatias: Aprovados `hsl(var(--primary))`, Em aberto `hsl(var(--accent))`, Finalizados `hsl(var(--muted-foreground)/0.4)`. Legenda lateral com contagens.
- Empty state (`quotes.length===0`) com ícone `Inbox` + texto: "Os dados aparecerão conforme novos orçamentos forem criados.".

### Produtos / Propulsores
Mesmos cards/expansão; apenas adotam o estilo premium novo (rounded-3xl, backdrop-blur, gradient no ícone). Count-up no número principal.

### Loading premium
Substituir `Loader2` por skeleton: hero (linhas pulse), 4 cards `h-36 rounded-3xl border border-border/40 bg-card/60 backdrop-blur animate-pulse`, 2 placeholders de gráficos `h-64`.

### Microinterações
`animate-fade-in` + `style={{animationDelay}}` em stagger; hover translate/shadow; ícones com `group-hover:scale-105`; transições `duration-300`. Sem Framer Motion.

### Mobile-first
- Hero stack vertical no mobile, lado-a-lado em `sm:`.
- Métricas `grid-cols-2 lg:grid-cols-4`, padding `p-4 sm:p-5`.
- Quick actions `grid-cols-2 sm:grid-cols-4`.
- Gráficos `grid-cols-1 md:grid-cols-2`. Donut com altura fixa `h-44`, legenda à direita; em telas muito estreitas mantém legibilidade.

### Performance
`useMemo` para `valorMovimentado`, `taxaAprovacao`, `evolution`, `statusMix`. Sem novas libs. Animações em CSS + um único `requestAnimationFrame` por número.

## Garantias
Nenhum outro arquivo é tocado. Todas as queries, status, expansão, filtros e textos i18n existentes continuam funcionando exatamente como antes.
