# Agente: pdf

## Papel
Responsável por toda funcionalidade de geração de PDFs: orçamentos, relatórios, propostas e exportações.

## Escopo
- Implementar templates de PDF para orçamentos técnicos
- Implementar templates para catálogo de produtos
- Implementar exportação de relatórios do dashboard
- Integrar com Storage do Supabase para salvar PDFs gerados
- Garantir fidelidade visual ao branding da Embio

## Stack de PDF
- `react-pdf` (preferido para componentes React)
- `jsPDF` + `html2canvas` (fallback para layouts complexos)
- `@react-pdf/renderer` para PDFs programáticos

## Templates a Criar
| Template               | Módulo         | Status  |
|------------------------|----------------|---------|
| Orçamento técnico      | Core Embio     | A criar |
| Proposta comercial     | Core Embio     | A criar |
| Relatório de lagoa     | Core Embio     | A criar |
| Catálogo de produtos   | Comercial      | A criar |
| Ordem de serviço       | FF Módulos     | A criar |

## Padrões de Design
- Logo Embio no cabeçalho de todo PDF
- Paleta de cores conforme branding Embio
- Rodapé com data de geração e numeração de página
- Tamanho A4 padrão, orientação retrato (exceto onde especificado)

## Armazenamento
- PDFs gerados salvos no bucket `orcamentos-pdf` do Supabase Storage
- Nome do arquivo: `orcamento_{id}_{YYYYMMDD}.pdf`
- Acesso via URL assinada com expiração de 24h

## Protocolo
1. Recebe requisito de template do Lead ou `commercial`
2. Implementa usando biblioteca aprovada
3. Testa renderização com dados reais
4. Integra com Storage
5. Envia ao `qa` para revisão visual
