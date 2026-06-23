# FEATURES.md — Embio Comercial Pro

## Módulos e Funcionalidades

### 1. Dimensionamento de Lagoas
- Entrada de parâmetros: área, volume, espécie, densidade, biomassa
- Cálculo automático de demanda de oxigênio
- Indicação de propulsores e aeradores Embio
- Visualização do resultado em tela
- Exportação para PDF / orçamento

### 2. Orçamentos Técnicos
- Criação de orçamento a partir do dimensionamento
- Seleção de produtos do catálogo Embio
- Ajuste manual de quantidades e preços
- Status: Rascunho → Enviado → Aprovado → Rejeitado
- Histórico de versões do orçamento
- Exportação em PDF com branding Embio

### 3. Produtos e Catálogo Embio
- Cadastro de propulsores, aeradores e acessórios
- Especificações técnicas por produto
- Fotos e imagens
- Preços base (ajustáveis no orçamento)
- Categorização e filtros

### 4. Clientes
- Cadastro de clientes com dados de contato
- Histórico de orçamentos por cliente
- Histórico de serviços realizados
- Notas e observações
- Busca e filtros

### 5. Geração de PDF
- Template de orçamento técnico (A4)
- Template de proposta comercial
- Template de relatório de dimensionamento
- Template de ordem de serviço
- Logo e branding Embio em todos os documentos

### 6. Dashboard
- Resumo de orçamentos por status
- Últimos orçamentos gerados
- Clientes recentes
- Indicadores rápidos (volume, conversão)

---

## Módulos FF Instalações (integração futura)

### 7. Agenda
- Calendário de visitas e serviços
- Criação de visita a partir de orçamento aprovado
- Notificações e lembretes
- Visualização diária/semanal/mensal

### 8. Financeiro / Caixa
- Registro de entradas e saídas
- Vinculação de pagamento a orçamento/cliente
- Resumo mensal
- Exportação de extrato

### 9. Catálogo Comercial (FF)
- Catálogo de serviços de instalação
- Tabela de preços por tipo de serviço
- Integração com orçamento

### 10. Conversão Orçamento → Serviço
- Aprovação de orçamento gera Ordem de Serviço
- OS vinculada ao cliente e à agenda
- Status: Aberta → Em execução → Concluída → Faturada

### 11. Previsão do Tempo
- Widget de clima por localização do cliente
- Integração com API pública de clima (OpenWeather ou similar)
- Útil para planejamento de visitas

### 12. Personalização Visual
- Escolha de cores do sistema por usuário/empresa
- Upload de logo personalizada
- Configuração de dados da empresa (para PDFs)

## Prioridade de Implementação

| Prioridade | Módulo |
|------------|--------|
| P0 (core)  | Dimensionamento, Orçamentos, Clientes, PDF, Dashboard |
| P1 (comercial) | Catálogo Embio, Agenda, Conversão OS |
| P2 (financeiro) | Financeiro/Caixa, Catálogo FF |
| P3 (extras) | Previsão do tempo, Personalização visual |
