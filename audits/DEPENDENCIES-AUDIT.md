# DEPENDENCIES-AUDIT.md — Auditoria de Dependências

**Status**: PENDENTE — aguardando extração do `Embio AgroCalc.zip`  
**Responsável**: Agentes `migration` + `security`  
**Data de início**: A definir

---

## Objetivo

Mapear todas as dependências do Embio AgroCalc, identificar pacotes problemáticos, desatualizados ou específicos do Lovable, e planejar substituições.

## Checklist

- [ ] `package.json` extraído e analisado
- [ ] Dependências de produção listadas
- [ ] Dependências de desenvolvimento listadas
- [ ] Dependências específicas do Lovable identificadas
- [ ] `npm audit` executado
- [ ] Vulnerabilidades críticas listadas
- [ ] Versões desatualizadas identificadas
- [ ] Pacotes abandonados identificados

---

## Resultado da Auditoria

_A preencher após extração do código._

### Dependências de Produção

| Pacote | Versão Atual | Versão Mais Recente | Status | Ação |
|--------|-------------|---------------------|--------|------|
| react | (a verificar) | | | |
| typescript | (a verificar) | | | |
| tailwindcss | (a verificar) | | | |
| @supabase/supabase-js | (a verificar) | | | |
| (demais) | | | | |

### Dependências do Lovable (a substituir)

| Pacote | Motivo | Substituto |
|--------|--------|------------|
| (a identificar) | Específico do Lovable | |

### Vulnerabilidades

| Pacote | Severidade | CVE | Ação |
|--------|------------|-----|------|
| (a identificar) | | | |

### Pacotes a Remover

| Pacote | Razão |
|--------|-------|
| (a identificar) | |

### Decisão Final

_A documentar em `/docs/DECISIONS.md` após análise completa._
