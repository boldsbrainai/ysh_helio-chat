#!/bin/bash

# Script para executar testes E2E do Cypress e gerar relatório de cobertura
# Uso: ./run-e2e-tests.sh [mode]
# Modos: headless (padrão), open (interface gráfica)

set -e

MODE=${1:-headless}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_DIR="cypress/reports/$TIMESTAMP"

echo "🚀 Yello Solar Hub - Execução de Testes E2E"
echo "============================================"
echo "Modo: $MODE"
echo "Timestamp: $TIMESTAMP"
echo ""

# Verificar se o servidor está rodando
echo "📡 Verificando servidor de desenvolvimento..."
if ! curl -s http://localhost:5173 > /dev/null 2>&1; then
  echo "❌ Erro: Servidor não está rodando em http://localhost:5173"
  echo "Execute 'npm run dev' em outro terminal antes de rodar os testes."
  exit 1
fi
echo "✅ Servidor respondendo"
echo ""

# Criar diretório de relatórios
mkdir -p "$REPORT_DIR"

# Executar testes
echo "🧪 Executando testes Cypress..."
if [ "$MODE" = "open" ]; then
  npx cypress open
else
  npx cypress run \
    --config baseUrl=http://localhost:5173 \
    --reporter json \
    --reporter-options "output=$REPORT_DIR/results.json"
fi

# Gerar relatório resumido
if [ -f "$REPORT_DIR/results.json" ]; then
  echo ""
  echo "📊 Gerando relatório de cobertura..."
  
  # Análise básica dos resultados
  TOTAL_TESTS=$(jq '.stats.tests' "$REPORT_DIR/results.json")
  PASSED=$(jq '.stats.passes' "$REPORT_DIR/results.json")
  FAILED=$(jq '.stats.failures' "$REPORT_DIR/results.json")
  PENDING=$(jq '.stats.pending' "$REPORT_DIR/results.json")
  DURATION=$(jq '.stats.duration' "$REPORT_DIR/results.json")
  
  # Criar relatório markdown
  cat > "$REPORT_DIR/COVERAGE_REPORT.md" <<EOF
# 📊 Relatório de Cobertura E2E - Yello Solar Hub

**Data:** $(date '+%d/%m/%Y %H:%M:%S')
**Duração:** ${DURATION}ms

## Resumo Executivo

- **Total de Testes:** $TOTAL_TESTS
- **Aprovados:** ✅ $PASSED
- **Falhados:** ❌ $FAILED
- **Pendentes:** ⏸️ $PENDING
- **Taxa de Sucesso:** $(echo "scale=2; $PASSED * 100 / $TOTAL_TESTS" | bc)%

## Cobertura por Domínio

### 1. Navegação e Acessibilidade Básica
- Arquivo: \`01-navigation.cy.ts\`
- Status: ✅ Implementado
- Cobertura: Navegação por teclado, sidebar, aria-labels

### 2. Sistema de Chat e Hélio
- Arquivo: \`02-chat-system.cy.ts\`
- Status: ✅ Implementado
- Cobertura: Envio de mensagens, widgets, histórico

### 3. Autenticação
- Arquivo: \`03-authentication.cy.ts\`
- Status: ✅ Implementado
- Cobertura: Facebook OAuth (mock), persistência de sessão

### 4. Análises Solares
- Arquivo: \`04-solar-analysis.cy.ts\`
- Status: ✅ Implementado
- Cobertura: Earth Observation, Shading, Sizing, Temporal

### 5. Checkout e Pagamentos
- Arquivo: \`05-checkout-payments.cy.ts\`
- Status: ✅ Implementado
- Cobertura: Planos, Asaas/Stripe, validações

### 6. Features Avançadas de AI
- Arquivo: \`06-ai-features.cy.ts\`
- Status: ✅ Implementado
- Cobertura: Realtime Voice, análise de imagens, workflows

### 7. Responsividade
- Arquivo: \`07-responsiveness.cy.ts\`
- Status: ✅ Implementado
- Cobertura: Mobile, tablet, desktop

## Workflows Testados

- ✅ Navegação básica e acessibilidade
- ✅ Chat com Hélio (envio de mensagens)
- ✅ Autenticação (mock de sessão)
- ✅ Páginas de análise solar
- ✅ Sistema de checkout
- ⚠️ Workflow de dimensionamento (parcial)
- ⚠️ Upload de imagens (requer fixture)
- ⚠️ Realtime Voice (requer mock de WebSocket)

## APIs e Integrações

### Testadas (Mocks)
- ✅ Spark KV (localStorage mock)
- ✅ Facebook OAuth (localStorage mock)
- ✅ Navegação entre páginas

### Não Testadas (Requer Backend/Mocks)
- ⏸️ OpenAI GPT-4o
- ⏸️ Sentinel Hub
- ⏸️ NREL SAM
- ⏸️ MapTiler/Cesium
- ⏸️ Brazil Data Cube (BDC)
- ⏸️ Asaas/Stripe/Cielo
- ⏸️ Gemini/NVIDIA
- ⏸️ Microsoft Clarity
- ⏸️ Hypertune
- ⏸️ Neon Postgres

## Recomendações

1. **Integrar mocks para APIs externas** usando \`cy.intercept()\`
2. **Adicionar fixtures** para testes de upload de imagem
3. **Implementar testes de erro** (API offline, validações)
4. **Adicionar testes de performance** (Lighthouse CI)
5. **Integrar com CI/CD** (GitHub Actions)

## Próximos Passos

- [ ] Alcançar 80% de cobertura de workflows
- [ ] Adicionar testes de regressão visual
- [ ] Implementar testes de carga (k6)
- [ ] Configurar monitoramento contínuo

---

**Gerado por:** Yello Solar Hub CI/CD
**Versão:** 1.0.0
EOF

  echo "✅ Relatório gerado em: $REPORT_DIR/COVERAGE_REPORT.md"
  echo ""
  cat "$REPORT_DIR/COVERAGE_REPORT.md"
fi

echo ""
echo "🎉 Execução concluída!"
echo "📂 Resultados salvos em: $REPORT_DIR"
