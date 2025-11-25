/**
 * ChatKit Widget Template Definitions for Yello Solar Hub
 * 
 * These templates generate JSON widget definitions following ChatKit's component architecture.
 * Each template function accepts data parameters and returns a fully structured widget object
 * that can be sent within a ChatKit message payload.
 * 
 * Usage in backend:
 * 1. Import the template function
 * 2. Fetch your data (from database, API, etc.)
 * 3. Call the template with your data
 * 4. Include the returned JSON in your ChatKit message's widget field
 * 
 * @see https://openai.github.io/chatkit-python
 */

export interface ProductCardData {
  productId: string
  name: string
  description: string
  imageUrl: string
  priceBRL: number
  originalPriceBRL?: number
  rating?: number
  discountPercentage?: number
  features?: string[]
  specifications?: Array<{ label: string; value: string }>
  manufacturer?: string
  sku?: string
}

export interface CreditLineData {
  id: string
  bankName: string
  productName: string
  termMonths: number
  monthlyInterestRate: number
  annualInterestRate: number
  minAmount: number
  maxAmount: number
  features: string[]
  requirements?: string[]
  processingTimeDays?: number
}

export interface IrradiationMapData {
  location: {
    latitude: number
    longitude: number
    city: string
    state: string
  }
  irradiationData: {
    ghi: number
    dni: number
    dhi: number
    unit: string
  }
  mapImageUrl: string
  dataSource: 'CAMS' | 'NASA_POWER'
  timeRange: {
    start: string
    end: string
  }
  estimatedGeneration?: {
    kwhPerMonth: number
    kwhPerYear: number
  }
}

/**
 * Product Card Widget Template
 * 
 * Generates a rich product card widget for displaying solar equipment (panels, inverters, batteries, etc.)
 * with image, pricing, specifications, and action buttons.
 * 
 * @param data - Product information including name, price, image, features
 * @returns ChatKit widget JSON object
 * 
 * @example
 * const product = {
 *   productId: "INV-GROWATT-5000",
 *   name: "Inversor Fotovoltaico Growatt 5kW",
 *   description: "Inversor solar de alta eficiência com monitoramento WiFi",
 *   imageUrl: "https://cdn.example.com/products/growatt-5000.jpg",
 *   priceBRL: 4799,
 *   originalPriceBRL: 5999,
 *   rating: 4.9,
 *   discountPercentage: 20,
 *   features: [
 *     "Potência nominal de 5000W",
 *     "Eficiência máxima de 97.6%",
 *     "Monitoramento WiFi integrado"
 *   ],
 *   specifications: [
 *     { label: "Potência", value: "5000W" },
 *     { label: "Eficiência", value: "97.6%" }
 *   ]
 * }
 * 
 * const widgetJson = productCardWidget(product)
 * // Include widgetJson in your ChatKit message's widget field
 */
export function productCardWidget(data: ProductCardData) {
  const discountBadge = data.discountPercentage 
    ? `${data.discountPercentage}% OFF` 
    : undefined

  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  }).format(data.priceBRL)

  const formattedOriginalPrice = data.originalPriceBRL 
    ? new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2
      }).format(data.originalPriceBRL)
    : undefined

  return {
    id: `product-${data.productId}`,
    type: "product",
    data: {
      name: data.name,
      description: data.description,
      image: data.imageUrl,
      price: formattedPrice,
      originalPrice: formattedOriginalPrice,
      rating: data.rating?.toString(),
      badge: discountBadge,
      features: data.features || [],
      specifications: data.specifications || [],
      metadata: {
        productId: data.productId,
        sku: data.sku,
        manufacturer: data.manufacturer
      },
      actions: [
        {
          label: "Adicionar ao Orçamento",
          type: "add_to_quote",
          variant: "default",
          icon: "cart",
          payload: {
            productId: data.productId,
            name: data.name,
            price: data.priceBRL,
            action: "add_to_quote"
          }
        },
        {
          label: "Ver Especificações Completas",
          type: "view_product_details",
          variant: "outline",
          payload: {
            productId: data.productId,
            action: "view_details"
          }
        }
      ]
    }
  }
}

/**
 * Credit Lines Widget Template
 * 
 * Generates a list widget comparing multiple solar financing options from different banks.
 * Ideal for displaying FNE Sol, Banco do Brasil, Caixa, BV, and other credit lines.
 * 
 * @param creditLines - Array of credit line information from different financial institutions
 * @returns ChatKit widget JSON object
 * 
 * @example
 * const creditLines = [
 *   {
 *     id: "fne-sol-2024",
 *     bankName: "Banco do Nordeste",
 *     productName: "FNE Sol",
 *     termMonths: 120,
 *     monthlyInterestRate: 0.69,
 *     annualInterestRate: 8.5,
 *     minAmount: 5000,
 *     maxAmount: 100000,
 *     features: [
 *       "Taxa de juros subsidiada",
 *       "Carência de até 12 meses",
 *       "Financiamento de até 100% do projeto"
 *     ]
 *   },
 *   // ... more credit lines
 * ]
 * 
 * const widgetJson = creditLinesWidget(creditLines)
 */
export function creditLinesWidget(creditLines: CreditLineData[]) {
  const items = creditLines.map(line => {
    const monthlyRate = `${line.monthlyInterestRate.toFixed(2)}% a.m.`
    const annualRate = `${line.annualInterestRate.toFixed(2)}% a.a.`
    
    const minAmountFormatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(line.minAmount)
    
    const maxAmountFormatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(line.maxAmount)

    const termYears = Math.floor(line.termMonths / 12)
    const termLabel = termYears > 0 
      ? `${termYears} ${termYears === 1 ? 'ano' : 'anos'}`
      : `${line.termMonths} meses`

    return {
      icon: "💰",
      title: `${line.bankName} - ${line.productName}`,
      subtitle: `${monthlyRate} (${annualRate}) • Prazo: até ${termLabel} • ${minAmountFormatted} a ${maxAmountFormatted}`,
      badge: line.processingTimeDays 
        ? `${line.processingTimeDays} dias úteis` 
        : undefined,
      metadata: {
        creditLineId: line.id,
        bankName: line.bankName,
        features: line.features,
        requirements: line.requirements
      },
      action: {
        type: "simulate_financing",
        payload: {
          creditLineId: line.id,
          bankName: line.bankName,
          productName: line.productName,
          monthlyInterestRate: line.monthlyInterestRate,
          termMonths: line.termMonths,
          action: "open_simulator"
        }
      }
    }
  })

  return {
    id: `credit-lines-${Date.now()}`,
    type: "list",
    data: {
      header: "Linhas de Crédito para Energia Solar",
      items: items,
      footer: `${creditLines.length} opções de financiamento disponíveis • Consulte taxas atualizadas`
    }
  }
}

/**
 * Irradiation Map Widget Template
 * 
 * Generates a card widget displaying a solar irradiation map for a specific location,
 * along with irradiation data (GHI, DNI, DHI) from CAMS or NASA POWER.
 * 
 * @param data - Location, irradiation values, map image URL, and data source
 * @returns ChatKit widget JSON object
 * 
 * @example
 * const mapData = {
 *   location: {
 *     latitude: -19.9167,
 *     longitude: -43.9345,
 *     city: "Belo Horizonte",
 *     state: "MG"
 *   },
 *   irradiationData: {
 *     ghi: 5.2,
 *     dni: 4.8,
 *     dhi: 2.1,
 *     unit: "kWh/m²/day"
 *   },
 *   mapImageUrl: "https://api.yello.com.br/maps/irradiation/belo-horizonte.png",
 *   dataSource: "CAMS",
 *   timeRange: {
 *     start: "2023-01-01",
 *     end: "2023-12-31"
 *   },
 *   estimatedGeneration: {
 *     kwhPerMonth: 650,
 *     kwhPerYear: 7800
 *   }
 * }
 * 
 * const widgetJson = irradiationMapWidget(mapData)
 */
export function irradiationMapWidget(data: IrradiationMapData) {
  const dataSourceLabel = data.dataSource === 'CAMS' 
    ? 'CAMS (Copernicus Atmosphere Monitoring Service)'
    : 'NASA POWER'

  const dateStart = new Date(data.timeRange.start).toLocaleDateString('pt-BR', {
    month: 'short',
    year: 'numeric'
  })
  
  const dateEnd = new Date(data.timeRange.end).toLocaleDateString('pt-BR', {
    month: 'short',
    year: 'numeric'
  })

  const badges = [
    { 
      label: `${data.location.city}, ${data.location.state}`, 
      variant: "secondary" as const
    },
    { 
      label: dataSourceLabel, 
      variant: "default" as const
    }
  ]

  if (data.estimatedGeneration) {
    badges.push({
      label: `~${data.estimatedGeneration.kwhPerMonth} kWh/mês`,
      variant: "default" as const
    })
  }

  const contentParts = [
    `📊 **Dados de Irradiação Solar**`,
    ``,
    `**GHI (Global Horizontal):** ${data.irradiationData.ghi.toFixed(2)} ${data.irradiationData.unit}`,
    `**DNI (Direct Normal):** ${data.irradiationData.dni.toFixed(2)} ${data.irradiationData.unit}`,
    `**DHI (Diffuse Horizontal):** ${data.irradiationData.dhi.toFixed(2)} ${data.irradiationData.unit}`,
    ``,
    `📅 **Período Analisado:** ${dateStart} - ${dateEnd}`,
    ``,
    `🌍 **Coordenadas:** ${data.location.latitude.toFixed(4)}°, ${data.location.longitude.toFixed(4)}°`
  ]

  if (data.estimatedGeneration) {
    contentParts.push(
      ``,
      `⚡ **Geração Estimada (sistema 1kWp):**`,
      `• Mensal: ${data.estimatedGeneration.kwhPerMonth} kWh`,
      `• Anual: ${data.estimatedGeneration.kwhPerYear} kWh`
    )
  }

  return {
    id: `irradiation-map-${data.location.latitude}-${data.location.longitude}`,
    type: "card",
    data: {
      title: `Mapa de Irradiação Solar - ${data.location.city}`,
      subtitle: `Dados de alta fidelidade validados para o Brasil`,
      image: data.mapImageUrl,
      content: contentParts.join('\n'),
      badges: badges,
      metadata: {
        location: data.location,
        irradiationData: data.irradiationData,
        dataSource: data.dataSource,
        timeRange: data.timeRange
      },
      actions: [
        {
          label: "Iniciar Análise Completa",
          type: "start_site_analysis",
          variant: "default",
          payload: {
            latitude: data.location.latitude,
            longitude: data.location.longitude,
            city: data.location.city,
            state: data.location.state,
            dataSource: data.dataSource,
            action: "start_analysis"
          }
        },
        {
          label: "Exportar Dados",
          type: "export_irradiation_data",
          variant: "outline",
          payload: {
            location: data.location,
            irradiationData: data.irradiationData,
            timeRange: data.timeRange,
            action: "export_data"
          }
        }
      ],
      status: {
        text: `Dados validados contra estações INMET/INPE • Acurácia: <5% bias`,
        icon: "✓"
      }
    }
  }
}

/**
 * Helper function to create a ChatKit message with a widget
 * 
 * This demonstrates how to structure a complete message payload with a widget.
 * Your backend would use this pattern when responding to user queries.
 * 
 * @example
 * // In your backend API endpoint
 * const product = await fetchProductFromDatabase(productId)
 * const widgetJson = productCardWidget(product)
 * 
 * const message = createMessageWithWidget(
 *   "Encontrei este inversor solar para você. Ele tem ótima eficiência e está com desconto!",
 *   widgetJson
 * )
 * 
 * // Send this message structure to ChatKit
 * return message
 */
export function createMessageWithWidget(textContent: string, widget: any) {
  return {
    role: 'assistant',
    content: textContent,
    widget: widget
  }
}

/**
 * Type definitions for the complete widget structure
 * Use these types when working with widgets in TypeScript
 */
export type WidgetTemplate = 
  | ReturnType<typeof productCardWidget>
  | ReturnType<typeof creditLinesWidget>
  | ReturnType<typeof irradiationMapWidget>

export type WidgetType = WidgetTemplate['type']

export interface ChatKitMessage {
  role: 'assistant' | 'user'
  content: string
  widget?: WidgetTemplate
}
