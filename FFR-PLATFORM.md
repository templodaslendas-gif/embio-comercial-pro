# FFR-PLATFORM.md — Embio Comercial Pro

## Plataforma FFR aplicada ao Embio

O Embio Comercial Pro segue a **Plataforma FFR** — metodologia de desenvolvimento e governança para produtos digitais de alto padrão.

Adaptar a FFR ao Embio significa: qualidade visual e técnica de produto SaaS pronto para venda, aplicada a um sistema interno de gestão comercial agropecuária.

---

## 1. Posicionamento do Produto

| Atributo | Valor |
|----------|-------|
| Tipo | SaaS interno / single-tenant |
| Domínio | Biotecnologia aplicada à agropecuária |
| Stack | React + TypeScript + Supabase + Vercel |
| Usuários | Equipe comercial e técnica da Embio |
| Percepção-alvo | "Software pronto para demonstração e venda" |

---

## 2. Pilares da Plataforma FFR

### 2.1 Governança de Código

- Todo código passa por revisão antes de ir para `main`
- Nenhum arquivo ultrapassa 500 linhas — refatorar se necessário
- Sem `console.log` em produção
- Sem `any` em TypeScript sem comentário justificativo
- Sem secrets no código — sempre variáveis de ambiente
- Sem dependências desnecessárias

### 2.2 Design System Primeiro

Toda interface nasce no Design System, não nas páginas.

```
Tokens (CSS vars)
  └── Componentes Premium (PremiumCard, PremiumButton, etc.)
        └── Módulos (Dashboard, Agenda, Clientes...)
              └── Páginas
```

Regra: **se não está no design system, não está na interface.**

### 2.3 Qualidade Visual Não Negociável

- Zero templates genéricos — identidade Embio em todos os elementos
- Hierarquia tipográfica clara em todas as telas
- Estados explícitos: loading, empty, error, success
- Responsivo: funciona em tablet (mínimo 768px)
- Animações com propósito — nunca decorativas

### 2.4 Performance

- Bundle JS < 500KB gzip (alvo atual: reduzir de 497KB via code splitting)
- Lazy load em páginas — `React.lazy()` + `Suspense`
- TanStack Query com `staleTime` configurado em todas as queries
- Sem `SELECT *` no Supabase — sempre colunas explícitas

### 2.5 Segurança

- `ffr-security` audita qualquer mudança em Auth, RLS ou Storage
- Nunca expor `user.id` ou dados sensíveis em URLs
- Validação em todas as bordas do sistema (formulários, APIs)
- `.env` fora do git — sempre

---

## 3. Fluxo de Desenvolvimento

```
Ideia / Requisito
  └── Discuss (decisão documentada em DECISIONS.md)
        └── Plan (plano em .planning/ se multi-arquivo)
              └── Execute (código + testes)
                    └── Verify (build + visual + testes)
                          └── Review (code-review antes do merge)
                                └── Ship (deploy Vercel)
```

Toda feature nova segue esse fluxo. Hotfixes podem pular Discuss e Plan.

---

## 4. Agentes e Responsabilidades

Ver `AGENTS.md` para descrição completa de cada agente.

| Agente | Responsabilidade |
|--------|-----------------|
| Lead (Claude) | Decisões de produto, arquitetura e design |
| security | Audita auth, RLS, uploads, variáveis de ambiente |
| reviewer | Code review antes de merge |
| researcher | Investiga codebase antes de implementação complexa |

---

## 5. Design System Embio

### Paleta

```css
/* Identidade Embio — Biotecnologia Agropecuária */

/* Azul corporativo (tecnologia, profissionalismo) */
--primary: 210 70% 25%;          /* navy — sidebar, botões primários */

/* Verde vivo (agro, natureza, saúde animal) */
--accent: 120 55% 38%;           /* verde Embio — destaques, métricas positivas */

/* Embio tokens */
--embio-green-deep: 210 70% 22%; /* azul profundo */
--embio-green-light: 120 45% 45%;/* verde médio */
--embio-lime: 120 55% 45%;       /* verde lima — ações */
```

### Tipografia

- **Inter** — fonte padrão (corpo, UI, labels)
- Headings: `font-bold` ou `font-extrabold`, tracking `-0.02em`
- Body: 14px (sm), 16px (base)

### Componentes Premium

| Componente | Arquivo | Status |
|-----------|---------|--------|
| PremiumPage | `src/components/premium/PremiumPage.tsx` | ✅ |
| PremiumSection | `src/components/premium/PremiumSection.tsx` | ✅ |
| PremiumCard | `src/components/premium/PremiumCard.tsx` | ✅ |
| PremiumMetric | `src/components/premium/PremiumMetric.tsx` | ✅ |
| PremiumHeader | `src/components/premium/PremiumHeader.tsx` | ✅ |
| PremiumEmptyState | `src/components/premium/PremiumEmptyState.tsx` | ✅ |
| PremiumBadge | `src/components/premium/PremiumBadge.tsx` | ✅ |
| PremiumAction | `src/components/premium/PremiumAction.tsx` | ✅ |
| PremiumChartCard | `src/components/premium/PremiumChartCard.tsx` | ✅ |
| PremiumButton | `src/components/premium/PremiumButton.tsx` | ✅ |
| PremiumTable | `src/components/premium/PremiumTable.tsx` | ✅ |
| PremiumDialog | `src/components/premium/PremiumDialog.tsx` | ✅ |
| PremiumWeather | `src/components/premium/PremiumWeather.tsx` | ✅ |
| PremiumHero | `src/components/premium/PremiumHero.tsx` | ✅ |

---

## 6. Módulos e Rotas

| Módulo | Rota | Grupo |
|--------|------|-------|
| Dashboard | `/` | Comercial |
| Clientes | `/clientes` | Comercial |
| Catálogo | `/catalogo` | Comercial |
| Agenda | `/agenda` | Comercial |
| Produtos | `/produtos/*` | Técnico |
| Propulsores | `/propulsores/*` | Técnico |
| Configurações de Marca | `/configuracoes-marca` | Admin |

---

## 7. Regras de Deploy

- Deploy automático no Vercel via push em `main`
- Variáveis de ambiente configuradas no painel Vercel
- Build deve passar sem erros antes do merge
- Checar bundle size após cada PR que adiciona dependências

---

## 8. Checklist de Entrega (Demo-Ready)

- [ ] Build sem erros
- [ ] Zero placeholders visíveis (textos, logos, imagens)
- [ ] Auth page com identidade Embio
- [ ] Dashboard com dados reais ou dados de demonstração
- [ ] Todos os estados (loading, empty, error) implementados
- [ ] Responsivo em 768px+
- [ ] Commit limpo em `main`
- [ ] Deploy Vercel ativo
