export interface SolarProduct {
  id: string
  manufacturer: string
  model: string
  power: number
  efficiency?: number
  specs: Array<{ label: string; value: string }>
  imageUrl?: string
  price?: string
}

export interface FinancingOption {
  bank: string
  rate: string
  term: number
  monthlyPayment: string
  totalPayment: string
}

export interface IrradiationData {
  location: string
  lat: number
  lng: number
  annualIrradiation: number
  monthly: number[]
}

export interface SizingResult {
  consumption: number
  systemSize: number
  panelCount: number
  estimatedGeneration: number
  paybackYears: number
  monthlySavings: number
  roi: number
}

export interface LocationData {
  displayName: string
  road?: string
  suburb?: string
  city?: string
  state?: string
  country?: string
}

export interface ShadingAnalysisData {
  location: LocationData
  roof: {
    area: number
    tilt: number
    azimuth: number
  }
  shading: {
    averageShading: number
    solarAccess: number
  }
  system: {
    recommendedSize: number
    estimatedGeneration: number
  }
  financial: {
    estimatedCost: string
    monthlySavings: number
    paybackYears: number
  }
}

export const createProductComparisonWidget = (products: SolarProduct[]) => {
  return {
    type: "Card",
    title: "Comparação de Equipamentos",
    children: products.map(product => ({
      type: "Row",
      gap: "12px",
      align: "start",
      children: [
        {
          type: "Image",
          src: product.imageUrl || "/placeholder.png",
          alt: `${product.manufacturer} ${product.model}`,
          width: "80px",
          height: "80px",
        },
        {
          type: "Col",
          gap: "8px",
          flex: 1,
          children: [
            {
              type: "Title",
              value: `${product.manufacturer} ${product.model}`,
              size: "md",
            },
            {
              type: "Text",
              value: `${product.power} kW${product.efficiency ? ` • ${product.efficiency}% eficiência` : ''}`,
              size: "sm",
            },
            ...(product.price ? [{
              type: "Text",
              value: product.price,
              size: "lg",
              weight: "bold",
            }] : []),
          ]
        }
      ]
    }))
  }
}

export const createFinancingWidget = (options: FinancingOption[]) => {
  return {
    type: "Card",
    title: "Opções de Financiamento",
    children: options.map(option => ({
      type: "Col",
      gap: "8px",
      children: [
        {
          type: "Title",
          value: option.bank,
          size: "md",
        },
        {
          type: "Row",
          justify: "between",
          children: [
            { type: "Text", value: "Taxa:", size: "sm" },
            { type: "Text", value: option.rate, size: "sm", weight: "bold" },
          ]
        },
        {
          type: "Row",
          justify: "between",
          children: [
            { type: "Text", value: "Prazo:", size: "sm" },
            { type: "Text", value: `${option.term} meses`, size: "sm", weight: "bold" },
          ]
        },
        {
          type: "Row",
          justify: "between",
          children: [
            { type: "Text", value: "Parcela:", size: "sm" },
            { type: "Text", value: option.monthlyPayment, size: "sm", weight: "bold" },
          ]
        },
        {
          type: "Divider",
          spacing: "8px"
        }
      ]
    }))
  }
}

export const createIrradiationWidget = (data: IrradiationData) => {
  return {
    type: "Card",
    title: "Dados de Irradiação Solar",
    children: [
      {
        type: "Title",
        value: data.location,
        size: "lg",
      },
      {
        type: "Text",
        value: `Coordenadas: ${data.lat.toFixed(4)}, ${data.lng.toFixed(4)}`,
        size: "sm",
      },
      {
        type: "Divider",
        spacing: "12px"
      },
      {
        type: "Row",
        justify: "between",
        children: [
          { type: "Text", value: "Irradiação Anual:", size: "md" },
          { type: "Text", value: `${data.annualIrradiation} kWh/m²/ano`, size: "md", weight: "bold" },
        ]
      },
      {
        type: "Row",
        justify: "between",
        children: [
          { type: "Text", value: "Média Mensal:", size: "md" },
          { type: "Text", value: `${data.monthly.reduce((a, b) => a + b, 0) / 12} kWh/m²/mês`, size: "md", weight: "bold" },
        ]
      }
    ]
  }
}

export const createSizingWidget = (result: SizingResult) => {
  return {
    type: "Card",
    title: "Resultado do Dimensionamento",
    children: [
      {
        type: "Row",
        justify: "between",
        children: [
          { type: "Text", value: "Consumo Mensal:", size: "md" },
          { type: "Text", value: `${result.consumption} kWh`, size: "md", weight: "bold" },
        ]
      },
      {
        type: "Row",
        justify: "between",
        children: [
          { type: "Text", value: "Sistema Recomendado:", size: "md" },
          { type: "Text", value: `${result.systemSize} kWp`, size: "md", weight: "bold" },
        ]
      },
      {
        type: "Row",
        justify: "between",
        children: [
          { type: "Text", value: "Quantidade de Painéis:", size: "md" },
          { type: "Text", value: `${result.panelCount} unidades`, size: "md", weight: "bold" },
        ]
      },
      {
        type: "Divider",
        spacing: "12px"
      },
      {
        type: "Row",
        justify: "between",
        children: [
          { type: "Text", value: "Geração Estimada:", size: "md" },
          { type: "Text", value: `${result.estimatedGeneration} kWh/mês`, size: "md", weight: "bold" },
        ]
      },
      {
        type: "Row",
        justify: "between",
        children: [
          { type: "Text", value: "Economia Mensal:", size: "md" },
          { type: "Text", value: `R$ ${result.monthlySavings.toFixed(2)}`, size: "md", weight: "bold" },
        ]
      },
      {
        type: "Row",
        justify: "between",
        children: [
          { type: "Text", value: "Payback:", size: "md" },
          { type: "Text", value: `${result.paybackYears.toFixed(1)} anos`, size: "md", weight: "bold" },
        ]
      },
      {
        type: "Row",
        justify: "between",
        children: [
          { type: "Text", value: "ROI (25 anos):", size: "md" },
          { type: "Text", value: `${result.roi.toFixed(0)}%`, size: "md", weight: "bold" },
        ]
      }
    ]
  }
}

export const createShadingAnalysisWidget = (data: ShadingAnalysisData) => {
  return {
    type: "Card",
    title: "Análise de Sombreamento",
    children: [
      {
        type: "Title",
        value: data.location.displayName,
        size: "lg",
      },
      {
        type: "Text",
        value: [
          data.location.road,
          data.location.suburb,
          data.location.city,
          data.location.state
        ].filter(Boolean).join(", "),
        size: "sm",
      },
      {
        type: "Divider",
        spacing: "12px"
      },
      {
        type: "Title",
        value: "Características do Telhado",
        size: "md",
      },
      {
        type: "Row",
        justify: "between",
        children: [
          { type: "Text", value: "Área:", size: "sm" },
          { type: "Text", value: `${data.roof.area} m²`, size: "sm", weight: "bold" },
        ]
      },
      {
        type: "Row",
        justify: "between",
        children: [
          { type: "Text", value: "Inclinação:", size: "sm" },
          { type: "Text", value: `${data.roof.tilt}°`, size: "sm", weight: "bold" },
        ]
      },
      {
        type: "Row",
        justify: "between",
        children: [
          { type: "Text", value: "Azimute:", size: "sm" },
          { type: "Text", value: `${data.roof.azimuth}°`, size: "sm", weight: "bold" },
        ]
      },
      {
        type: "Divider",
        spacing: "12px"
      },
      {
        type: "Title",
        value: "Análise de Sombreamento",
        size: "md",
      },
      {
        type: "Row",
        justify: "between",
        children: [
          { type: "Text", value: "Sombreamento Médio:", size: "sm" },
          { type: "Text", value: `${data.shading.averageShading}%`, size: "sm", weight: "bold" },
        ]
      },
      {
        type: "Row",
        justify: "between",
        children: [
          { type: "Text", value: "Acesso Solar:", size: "sm" },
          { type: "Text", value: `${data.shading.solarAccess}%`, size: "sm", weight: "bold" },
        ]
      },
      {
        type: "Divider",
        spacing: "12px"
      },
      {
        type: "Title",
        value: "Sistema Recomendado",
        size: "md",
      },
      {
        type: "Row",
        justify: "between",
        children: [
          { type: "Text", value: "Potência:", size: "sm" },
          { type: "Text", value: `${data.system.recommendedSize} kWp`, size: "sm", weight: "bold" },
        ]
      },
      {
        type: "Row",
        justify: "between",
        children: [
          { type: "Text", value: "Geração Estimada:", size: "sm" },
          { type: "Text", value: `${data.system.estimatedGeneration} kWh/mês`, size: "sm", weight: "bold" },
        ]
      },
      {
        type: "Divider",
        spacing: "12px"
      },
      {
        type: "Title",
        value: "Análise Financeira",
        size: "md",
      },
      {
        type: "Row",
        justify: "between",
        children: [
          { type: "Text", value: "Investimento Estimado:", size: "sm" },
          { type: "Text", value: data.financial.estimatedCost, size: "sm", weight: "bold" },
        ]
      },
      {
        type: "Row",
        justify: "between",
        children: [
          { type: "Text", value: "Economia Mensal:", size: "sm" },
          { type: "Text", value: `R$ ${data.financial.monthlySavings.toFixed(2)}`, size: "sm", weight: "bold" },
        ]
      },
      {
        type: "Row",
        justify: "between",
        children: [
          { type: "Text", value: "Payback:", size: "sm" },
          { type: "Text", value: `${data.financial.paybackYears.toFixed(1)} anos`, size: "sm", weight: "bold" },
        ]
      }
    ]
  }
}
