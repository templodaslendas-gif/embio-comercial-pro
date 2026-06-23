# MERGE-PLAN.md — Plano de Merge Embio + FF Instalações

**Status**: PENDENTE — aguardando conclusão das auditorias  
**Responsável**: Agentes `migration` + `architect`  
**Pré-requisito**: `EMBIO-AUDIT.md` e `FF-MODULES-AUDIT.md` concluídos

---

## Objetivo

Definir como os módulos do FF Instalações serão integrados ao Embio Comercial Pro sem quebrar o código existente.

## Estratégia de Merge

_A definir após auditorias. As opções são:_

1. **Cópia direta**: copiar componentes FF → adaptar para o Embio
2. **Reescrita**: reescrever do zero usando FF como referência
3. **Híbrida**: copiar estrutura, reescrever lógica de negócio

## Mapa de Conflitos Potenciais

### Tabela `clientes`
- Embio tem `clientes` com foco em fazendas/aquicultura
- FF tem `clientes` com foco em instalações elétricas
- **Estratégia**: Unificar em uma tabela com campos opcionais por contexto

_Demais conflitos serão mapeados após auditorias._

## Ordem de Integração

_A confirmar após auditorias. Proposta inicial:_

1. `clientes` — base para todos os outros módulos
2. `catálogo comercial` — necessário para orçamentos FF
3. `conversão orçamento → serviço` — alta sinergia com Embio
4. `agenda` — depende de `clientes` e `serviços`
5. `financeiro` — depende de `serviços`
6. `previsão do tempo` — independente
7. `personalização visual` — independente

## Template de Integração por Módulo

```
## Módulo: [Nome]
**Status**: Pendente | Em andamento | Concluído
**Branch**: feature/integrar-[modulo]

### Componentes a criar/adaptar
- [ ] ComponenteA
- [ ] ComponenteB

### Tabelas a criar/migrar
- [ ] tabela_x
- [ ] tabela_y

### Policies de RLS
- [ ] Policy para tabela_x

### Testes necessários
- [ ] Fluxo principal
- [ ] Integração com Embio

### Rollback
[Como reverter se algo der errado]
```
