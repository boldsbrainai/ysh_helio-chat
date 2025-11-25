/**
 * Widget Templates Usage Examples
 * 
 * This file demonstrates how to use the widget template functions in your backend
 * to generate ChatKit-compatible JSON widgets. These examples show the complete
 * workflow from data retrieval to widget generation to message construction.
 */

import {
  productCardWidget,
  creditLinesWidget,
  irradiationMapWidget,
  createMessageWithWidget,
  type ProductCardData,
  type CreditLineData,
  type IrradiationMapData,
  type ChatKitMessage
} from './widget-templates'

/**
 * Example 1: Product Card Widget Usage
 * 
 * Scenario: User asks "Quais inversores de 5kW você recomenda?"
 * 
 * Backend Flow:
 * 1. Receive user query via ChatKit API
 * 2. Parse intent (looking for solar inverters, 5kW power)
 * 3. Query your product database
 * 4. Generate widget JSON using the template
 * 5. Send response with widget to ChatKit
 */

export function exampleProductCardUsage() {
  // Step 1: Fetch product data from your database
  // This would typically be: const product = await db.products.findById(productId)
  const productFromDatabase: ProductCardData = {
    productId: "INV-GROWATT-MIN-5000TL-X",
    name: "Inversor Solar Growatt MIN 5000TL-X",
    description: "Inversor string de alta eficiência com monitoramento WiFi integrado e proteções avançadas. Ideal para sistemas residenciais de até 6.5kWp.",
    imageUrl: "https://cdn.yello.com.br/products/growatt-min-5000tl-x.jpg",
    priceBRL: 4799.00,
    originalPriceBRL: 5999.00,
    rating: 4.9,
    discountPercentage: 20,
    sku: "INV-GROWATT-5000",
    manufacturer: "Growatt",
    features: [
      "Potência nominal de 5000W com sobrecarga de até 1.1x",
      "Eficiência máxima de 98.4% (europeia 97.6%)",
      "2 MPPT independentes para máxima flexibilidade",
      "Monitoramento WiFi com app ShinePhone",
      "Proteção IP65 para instalação externa",
      "Garantia de 10 anos (extensível para 15 anos)"
    ],
    specifications: [
      { label: "Potência CA Nominal", value: "5000 W" },
      { label: "Tensão CA Nominal", value: "220/380 V" },
      { label: "Tensão CC Máxima", value: "1000 V" },
      { label: "Corrente CC Máxima", value: "12.5 A/12.5 A" },
      { label: "Eficiência Máxima", value: "98.4%" },
      { label: "Número de MPPTs", value: "2" },
      { label: "Dimensões", value: "430 × 370 × 165 mm" },
      { label: "Peso", value: "16.5 kg" }
    ]
  }

  // Step 2: Generate the widget JSON using the template
  const widgetJson = productCardWidget(productFromDatabase)

  // Step 3: Create the complete message with widget
  const responseText = `Encontrei o Growatt MIN 5000TL-X para você! É um dos inversores mais populares na faixa de 5kW, com excelente eficiência de 98.4% e está com 20% de desconto. 

Ele tem 2 MPPTs independentes, o que é ótimo para telhados com diferentes orientações ou sombreamento parcial. O monitoramento WiFi já vem integrado e a proteção IP65 permite instalação externa sem gabinete adicional.`

  const message = createMessageWithWidget(responseText, widgetJson)

  // Step 4: Return this message structure to ChatKit
  // In your actual backend: return res.json(message)
  return message
}

/**
 * Example 2: Credit Lines Widget Usage
 * 
 * Scenario: User asks "Quais opções de financiamento estão disponíveis?"
 * 
 * Backend Flow:
 * 1. Receive user query
 * 2. Query your financing database or external banking APIs
 * 3. Format data for multiple credit lines
 * 4. Generate list widget
 * 5. Send response with widget
 */

export function exampleCreditLinesUsage() {
  // Step 1: Fetch credit line data from database or banking APIs
  // This would be: const creditLines = await db.creditLines.findAll({ active: true })
  const creditLinesFromDatabase: CreditLineData[] = [
    {
      id: "fne-sol-2024",
      bankName: "Banco do Nordeste",
      productName: "FNE Sol",
      termMonths: 120,
      monthlyInterestRate: 0.69,
      annualInterestRate: 8.5,
      minAmount: 5000,
      maxAmount: 100000,
      processingTimeDays: 15,
      features: [
        "Taxa de juros subsidiada pelo governo federal",
        "Carência de até 12 meses para início do pagamento",
        "Financiamento de até 100% do projeto (equipamentos + instalação)",
        "Sem necessidade de garantias para valores até R$ 20.000",
        "Disponível para microgeradores (até 75kW)"
      ],
      requirements: [
        "Pessoa física ou jurídica dos estados da região Nordeste",
        "Projeto técnico com ART/TRT",
        "Comprovação de renda"
      ]
    },
    {
      id: "bb-credito-solar-2024",
      bankName: "Banco do Brasil",
      productName: "BB Crédito Solar",
      termMonths: 96,
      monthlyInterestRate: 1.19,
      annualInterestRate: 15.2,
      minAmount: 3000,
      maxAmount: 150000,
      processingTimeDays: 7,
      features: [
        "Prazo de até 96 meses para pagamento",
        "Carência de até 6 meses",
        "Taxas competitivas para correntistas BB",
        "Análise de crédito simplificada via app",
        "Possibilidade de uso do FGTS como entrada"
      ],
      requirements: [
        "Conta corrente ativa no BB há pelo menos 3 meses",
        "Score de crédito mínimo de 600",
        "Comprovação de renda mensal"
      ]
    },
    {
      id: "bv-financiamento-solar-2024",
      bankName: "Banco BV",
      productName: "BV Energia Solar",
      termMonths: 84,
      monthlyInterestRate: 1.49,
      annualInterestRate: 19.5,
      minAmount: 5000,
      maxAmount: 80000,
      processingTimeDays: 3,
      features: [
        "Aprovação em até 48 horas",
        "Processo 100% digital via app BV",
        "Sem necessidade de vínculo bancário prévio",
        "Parcelas fixas durante todo o período",
        "Simulação instantânea sem consulta ao CPF"
      ],
      requirements: [
        "Idade entre 18 e 75 anos",
        "CPF regularizado",
        "Renda mínima de R$ 1.500"
      ]
    },
    {
      id: "caixa-construcard-solar-2024",
      bankName: "Caixa Econômica Federal",
      productName: "Construcard Solar",
      termMonths: 240,
      monthlyInterestRate: 0.89,
      annualInterestRate: 11.2,
      minAmount: 5000,
      maxAmount: 200000,
      processingTimeDays: 20,
      features: [
        "Prazo de até 240 meses (20 anos)",
        "Menor taxa de juros do mercado",
        "Possibilidade de usar FGTS como parte do pagamento",
        "Juros pré ou pós-fixados",
        "Vinculado a financiamento habitacional da Caixa"
      ],
      requirements: [
        "Financiamento habitacional ativo na Caixa ou imóvel próprio quitado",
        "Análise de capacidade de pagamento",
        "Projeto aprovado pela distribuidora local"
      ]
    }
  ]

  // Step 2: Generate the widget JSON
  const widgetJson = creditLinesWidget(creditLinesFromDatabase)

  // Step 3: Create the complete message
  const responseText = `Encontrei 4 linhas de crédito disponíveis para financiar seu projeto solar. As taxas variam de 0.69% a.m. (FNE Sol) até 1.49% a.m. (BV), com prazos de até 20 anos.

O **FNE Sol** tem a melhor taxa (0.69% a.m.) mas é restrito à região Nordeste. Para outras regiões, o **Construcard da Caixa** oferece 0.89% a.m. com prazo de até 240 meses.

Se você precisa de aprovação rápida, o **BV** aprova em até 48 horas com processo 100% digital.

Clique em qualquer opção abaixo para simular as parcelas para seu projeto:`

  const message = createMessageWithWidget(responseText, widgetJson)

  return message
}

/**
 * Example 3: Irradiation Map Widget Usage
 * 
 * Scenario: User asks "Qual a irradiação solar em Belo Horizonte?"
 * 
 * Backend Flow:
 * 1. Receive user query with location
 * 2. Extract location (city, coordinates)
 * 3. Query CAMS API (via pvlib.iotools.get_cams)
 * 4. Generate map image (using your mapping service)
 * 5. Calculate estimated generation
 * 6. Generate widget with all data
 * 7. Send response
 */

export async function exampleIrradiationMapUsage() {
  // Step 1: User query contains location
  const userLocation = {
    city: "Belo Horizonte",
    state: "MG",
    latitude: -19.9167,
    longitude: -43.9345
  }

  // Step 2: Query CAMS API for irradiation data
  // In real backend: 
  // import pvlib from 'pvlib-python'
  // const camsData = await pvlib.iotools.get_cams(
  //   latitude=userLocation.latitude,
  //   longitude=userLocation.longitude,
  //   start='2023-01-01',
  //   end='2023-12-31'
  // )
  
  // Simulated CAMS response (in real app, this comes from the API)
  const irradiationFromCAMS = {
    ghi: 5.42,  // kWh/m²/day - annual average
    dni: 4.87,  // kWh/m²/day - annual average
    dhi: 2.18,  // kWh/m²/day - annual average
  }

  // Step 3: Generate map visualization
  // This would call your mapping service that generates a visual map
  // showing irradiation levels, horizon profile, shading analysis, etc.
  const mapImageUrl = `https://api.yello.com.br/maps/irradiation?lat=${userLocation.latitude}&lng=${userLocation.longitude}&year=2023`

  // Step 4: Calculate estimated generation (simplified)
  // In real app, this would use pvlib ModelChain for accurate simulation
  const systemSize = 1.0 // 1 kWp reference system
  const performanceRatio = 0.80 // 80% PR (losses)
  const avgDaysPerMonth = 30.42
  
  const kwhPerMonth = Math.round(
    irradiationFromCAMS.ghi * systemSize * performanceRatio * avgDaysPerMonth
  )
  const kwhPerYear = kwhPerMonth * 12

  // Step 5: Prepare complete data structure
  const mapData: IrradiationMapData = {
    location: userLocation,
    irradiationData: {
      ghi: irradiationFromCAMS.ghi,
      dni: irradiationFromCAMS.dni,
      dhi: irradiationFromCAMS.dhi,
      unit: "kWh/m²/dia"
    },
    mapImageUrl: mapImageUrl,
    dataSource: "CAMS",
    timeRange: {
      start: "2023-01-01",
      end: "2023-12-31"
    },
    estimatedGeneration: {
      kwhPerMonth: kwhPerMonth,
      kwhPerYear: kwhPerYear
    }
  }

  // Step 6: Generate widget JSON
  const widgetJson = irradiationMapWidget(mapData)

  // Step 7: Create complete message
  const responseText = `Belo Horizonte tem excelente potencial solar! 🌞

Os dados do **CAMS** (Copernicus) mostram uma irradiação global horizontal (GHI) média de **5.42 kWh/m²/dia**. Isso significa que um sistema de **1 kWp** bem projetado pode gerar aproximadamente **${kwhPerMonth} kWh por mês** (${kwhPerYear} kWh/ano).

Para referência, isso é equivalente à média de consumo de uma residência de médio porte no Brasil. Traduzindo em economia: com a tarifa média de R$ 0,75/kWh da CEMIG, um sistema de 1 kWp economizaria cerca de R$ ${Math.round(kwhPerMonth * 0.75)}/mês.

Os dados foram validados contra as estações terrestres do INMET e apresentam acurácia de <5% de bias para Minas Gerais.`

  const message = createMessageWithWidget(responseText, widgetJson)

  return message
}

/**
 * Example 4: Complete Backend API Endpoint Integration
 * 
 * This example shows how these widgets would be integrated into a complete
 * FastAPI backend endpoint that handles ChatKit messages.
 */

export const backendIntegrationExample = `
# backend/api/chatkit.py (FastAPI example)

from fastapi import FastAPI, Request
from openai import OpenAI
import os

app = FastAPI()
openai_client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

@app.post("/api/chatkit/message")
async def handle_chatkit_message(request: Request):
    """
    This endpoint receives messages from ChatKit, processes them,
    and returns responses with widgets when appropriate.
    """
    data = await request.json()
    user_message = data.get("message", "")
    thread_id = data.get("thread_id")
    
    # Parse user intent
    intent = parse_user_intent(user_message)
    
    if intent == "search_products":
        # User is looking for solar equipment
        product_id = extract_product_id_from_query(user_message)
        product = await db.products.find_by_id(product_id)
        
        # Generate widget JSON using template (TypeScript function called via bridge)
        widget_json = generate_product_widget(product)
        
        # Send message with widget to ChatKit
        response = openai_client.chatkit.threads.messages.create(
            thread_id=thread_id,
            role="assistant",
            content="Encontrei este produto para você:",
            widget=widget_json  # Widget JSON goes here
        )
        
    elif intent == "financing_options":
        # User is asking about financing
        credit_lines = await db.credit_lines.find_all_active()
        widget_json = generate_credit_lines_widget(credit_lines)
        
        response = openai_client.chatkit.threads.messages.create(
            thread_id=thread_id,
            role="assistant",
            content="Aqui estão as opções de financiamento disponíveis:",
            widget=widget_json
        )
    
    elif intent == "irradiation_query":
        # User is asking about solar irradiation
        location = extract_location(user_message)
        irradiation_data = await query_cams_api(location)
        map_image_url = await generate_map(location, irradiation_data)
        
        widget_json = generate_irradiation_widget(
            location, irradiation_data, map_image_url
        )
        
        response = openai_client.chatkit.threads.messages.create(
            thread_id=thread_id,
            role="assistant",
            content=f"Dados de irradiação para {location.city}:",
            widget=widget_json
        )
    
    return {"status": "success", "message_id": response.id}

@app.post("/api/widget-action")
async def handle_widget_action(request: Request):
    """
    This endpoint receives actions triggered by widget button clicks.
    The onAction handler in your frontend sends requests here.
    """
    data = await request.json()
    action_type = data.get("action", {}).get("type")
    payload = data.get("action", {}).get("payload", {})
    
    if action_type == "add_to_quote":
        # User clicked "Adicionar ao Orçamento" on a product card
        product_id = payload.get("productId")
        user_id = data.get("user_id")
        
        await db.quotes.add_item(user_id, product_id)
        return {"status": "success", "message": "Produto adicionado ao orçamento"}
    
    elif action_type == "simulate_financing":
        # User clicked "Simular" on a credit line
        credit_line_id = payload.get("creditLineId")
        # Redirect to financing simulator page or open modal
        return {
            "status": "success",
            "action": "redirect",
            "url": f"/simulator?credit_line={credit_line_id}"
        }
    
    elif action_type == "start_site_analysis":
        # User wants to start a complete analysis
        latitude = payload.get("latitude")
        longitude = payload.get("longitude")
        
        # Queue analysis job (long-running simulation)
        job_id = await queue_analysis_job(latitude, longitude)
        
        return {
            "status": "success",
            "message": "Análise iniciada",
            "job_id": job_id
        }
    
    return {"status": "error", "message": "Unknown action type"}
`

/**
 * Example 5: Widget Action Handling in Frontend
 * 
 * This shows how the frontend ChatKit component handles widget actions
 */

export const frontendActionHandlerExample = `
// frontend/src/components/ChatKitEmbed.tsx

import { ChatKit, useChatKit } from '@openai/chatkit-react'

export function ChatKitEmbed() {
  const { control } = useChatKit({
    api: {
      async getClientSecret() {
        const res = await fetch('/api/chatkit/session', { method: 'POST' })
        const { client_secret } = await res.json()
        return client_secret
      }
    },
    
    // Handle widget actions
    onAction: async (action) => {
      console.log('Widget action triggered:', action)
      
      // Send action to your backend
      const response = await fetch('/api/widget-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })
      
      const result = await response.json()
      
      if (result.status === 'success') {
        // Show success toast
        toast.success(result.message || 'Ação concluída com sucesso')
        
        // Handle specific actions
        if (result.action === 'redirect') {
          window.location.href = result.url
        }
      } else {
        toast.error(result.message || 'Erro ao processar ação')
      }
    }
  })

  return <ChatKit control={control} className="h-[600px] w-[400px]" />
}
`

// Export all examples for documentation
export const widgetTemplatesExamples = {
  productCard: exampleProductCardUsage,
  creditLines: exampleCreditLinesUsage,
  irradiationMap: exampleIrradiationMapUsage,
  backendIntegration: backendIntegrationExample,
  frontendActionHandler: frontendActionHandlerExample
}
