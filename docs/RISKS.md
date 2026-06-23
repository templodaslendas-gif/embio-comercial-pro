# RISKS.md — Embio Comercial Pro

## Matriz de Riscos

| ID   | Risco | Probabilidade | Impacto | Mitigação |
|------|-------|---------------|---------|-----------|
| R-01 | Perda de dados durante migração do Supabase | Média | Alto | Backup completo antes de migrar; testar em ambiente dev |
| R-02 | Código do Lovable com dependências proprietárias | Alta | Médio | Auditoria completa antes de migrar; substituição planejada |
| R-03 | Módulos FF Instalações com conflito de schema | Média | Alto | Auditoria de merge antes de qualquer integração |
| R-04 | Quebra de cálculos técnicos (dimensionamento) | Baixa | Crítico | Testes comparativos com resultados anteriores |
| R-05 | Performance insatisfatória de geração de PDF | Média | Médio | Testar com dados reais antes de go-live |
| R-06 | Usuários sem adoção do sistema | Média | Alto | Envolvimento do time durante desenvolvimento |
| R-07 | Custo do Supabase Pro maior que esperado | Baixa | Baixo | Monitorar uso; otimizar queries |
| R-08 | Secrets/credenciais expostos acidentalmente | Baixa | Crítico | `.gitignore` rigoroso; revisão de segurança obrigatória |
| R-09 | Regressão após integração de módulos FF | Média | Alto | Testes de regressão antes de merge |
| R-10 | Perda de histórico de orçamentos na migração | Média | Alto | Exportar e importar dados antes de deprecar Lovable |

## Riscos Críticos (Acompanhamento Prioritário)

### R-04 — Quebra de cálculos técnicos
Os cálculos de dimensionamento de lagoas são o coração do produto. Qualquer erro afeta diretamente a credibilidade técnica da Embio.

**Ação**: Antes de go-live, comparar output de pelo menos 20 cálculos reais entre o sistema antigo e o novo.

### R-08 — Secrets expostos
Um commit com credenciais do Supabase pode comprometer todos os dados dos clientes.

**Ação**: Configurar `.gitignore` rigoroso + `git-secrets` ou similar + revisão obrigatória antes de qualquer push.

### R-10 — Perda de histórico
Orçamentos e dados de clientes do Lovable devem ser migrados com integridade.

**Ação**: Antes de qualquer migração de dados, exportar backup completo do Supabase atual e validar importação em ambiente dev.

## Riscos Aceitos

- Ausência de app mobile nativo (fora do escopo)
- SEO inexistente (sistema interno, irrelevante)
- Sem modo offline (requer conexão — aceitável para o uso atual)
