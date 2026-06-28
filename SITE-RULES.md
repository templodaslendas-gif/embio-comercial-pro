# SITE-RULES.md — Regras de Interface e Experiência

Regras não negociáveis para qualquer tela do Embio Comercial Pro.

---

## 1. Identidade Visual

### Nunca
- Usar emojis em títulos, botões ou placeholders de produção
- Usar textos placeholder ("SUA LOGO AQUI", "Lorem ipsum", "TODO")
- Usar cores hardcoded — sempre via tokens CSS (`hsl(var(--primary))`)
- Usar gradientes agressivos ou sombras excessivas
- Usar fontes diferentes de Inter

### Sempre
- Manter hierarquia visual: primário → secundário → muted
- Usar tokens do design system (`primary`, `accent`, `muted`, `border`, etc.)
- Usar componentes Premium para novas telas
- Manter consistência de border-radius (`rounded-xl` para cards, `rounded-2xl` para modais)

---

## 2. Tipografia

| Elemento | Classe Tailwind | Uso |
|----------|----------------|-----|
| Título de página | `text-2xl font-bold tracking-tight` | Apenas um por página |
| Subtítulo | `text-sm text-muted-foreground` | Complementa o título |
| Label de métrica | `text-xs font-medium uppercase tracking-wider text-muted-foreground` | Cards de KPI |
| Valor de métrica | `text-3xl font-bold tabular-nums` | Números grandes |
| Corpo | `text-sm text-foreground` | Conteúdo geral |
| Caption | `text-xs text-muted-foreground` | Notas, datas, badges |

---

## 3. Espaçamento

- Padding de página: `px-4 py-6 md:px-8 md:py-8`
- Gap entre seções: `space-y-6` ou `gap-6`
- Padding interno de card: `p-5` (compacto) ou `p-6` (padrão)
- Gap entre elementos de formulário: `space-y-4`

---

## 4. Estados Obrigatórios

Toda listagem, tabela e widget deve ter:

| Estado | Implementação |
|--------|--------------|
| Loading | `Skeleton` com forma do conteúdo |
| Empty | Ícone + título + descrição + CTA opcional |
| Error | Mensagem clara + botão de retry |
| Success | Toast `sonner` 3–4 segundos |

Sem estado implícito — todo estado deve ser visível.

---

## 5. Formulários

- Validação antes do submit — nunca após
- Feedback de erro inline (abaixo do campo), não apenas toast
- Botão de submit com `disabled` durante `isPending`
- Loader (`Loader2 animate-spin`) no botão durante submit
- Modal de confirmação para todas as ações destrutivas (delete, cancelar)
- Campo obrigatório marcado com `*` no label

---

## 6. Tabelas

- Cabeçalhos: `text-xs uppercase tracking-wider text-muted-foreground`
- Hover: `hover:bg-muted/20 transition-colors`
- Bordas: `border-border/20` (sutis)
- Paginação quando > 20 registros
- Skeleton de 5 linhas durante carregamento
- Empty state quando lista vazia

---

## 7. Sidebar

- Fundo: `--sidebar-background` (azul navy escuro)
- Texto: `--sidebar-foreground` (cinza claro)
- Item ativo: fundo `sidebar-primary/14`, texto `sidebar-primary` (verde)
- Ícones: 15×15px, opacidade 70% (inativo), 100% (ativo)
- Labels de grupo: `text-[10px] uppercase tracking-widest opacity-40`
- Logo: 28×28px, `rounded-md`

---

## 8. Botões

| Variante | Uso |
|---------|-----|
| `default` (primary) | Ação principal da página |
| `accent` | Ações de criação/positivas |
| `outline` | Ações secundárias |
| `ghost` | Ações terciárias (em tabelas, breadcrumb) |
| `destructive` | Delete, cancelar, encerrar |

Um único botão primário por seção. Nunca dois `default` no mesmo nível.

---

## 9. Gráficos (Recharts)

- Cores: usar tokens `primary` e `accent` — sem cores hardcoded
- Tooltip: tema escuro, `cursor={{ fill: "hsl(var(--muted)/0.3)" }}`
- Sem legenda quando há apenas uma série
- `ResponsiveContainer` obrigatório (width 100%)
- Animação: `isAnimationActive={true}` com `animationDuration={600}`

---

## 10. Responsividade

| Breakpoint | Comportamento |
|-----------|--------------|
| < 768px | Sidebar como drawer (shadcn Sheet) |
| 768px–1024px | Sidebar colapsada (ícones) |
| > 1024px | Sidebar expandida com labels |

- Grid de cards: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
- Tabelas: colunas ocultas com `hidden sm:table-cell` / `hidden md:table-cell`
- Formulários em modal: `max-w-lg` no desktop, full screen no mobile

---

## 11. Acessibilidade Mínima

- Focus ring visível em todos os interativos (shadcn cuida disso)
- `aria-label` em ícones sem texto
- Contraste mínimo 4.5:1 para texto sobre fundo
- `type="button"` em botões dentro de formulários que não submetem

---

## 12. Performance

- Sem `SELECT *` no Supabase — sempre colunas explícitas
- `React.lazy()` + `Suspense` em todas as páginas (rotas)
- Imagens: `loading="lazy"` + formato correto
- `staleTime: 5 * 60 * 1000` como padrão em TanStack Query
