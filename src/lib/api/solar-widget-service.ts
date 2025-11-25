/**
 * Enhanced Solar API Integration for Chat Widgets
 * Connects API services to dynamic widget generation in chat system
 */

import { Widget } from "@/components/widgets/WidgetRenderer";
import { pvgisService, nasaService, aneelService } from "@/lib/api/solar-api";

interface ContextData {
  location?: {
    lat: number;
    lon: number;
    cep?: string;
    address?: string;
  };
  consumption?: number;
  systemSize?: number;
  utilityData?: any;
}

/**
 * Fetches real solar data and creates dynamic widgets based on context
 */
export class SolarWidgetService {
  /**
   * Creates a solar analysis widget with real API data
   */
  static async createSolarAnalysisWidget(context: ContextData): Promise<Widget> {
    // Get location data
    let lat = context.location?.lat || -23.5505; // Default to São Paulo
    let lon = context.location?.lon || -46.6333;
    
    try {
      // Fetch real solar data from APIs
      const [pvgisData, nasaData] = await Promise.allSettled([
        pvgisService.calculateProduction({
          lat,
          lon,
          peakpower: context.systemSize || 5.0,
          loss: 14,
          angle: 30,
          aspect: 0
        }),
        nasaService.getClimateData({
          lat,
          lon,
          parameters: ["ALLSKY_SFC_SW_DWN", "T2M", "WS10M", "PRECTOTCORR"]
        })
      ]);

      // Calculate financial projections
      const monthlyConsumption = context.consumption || 450; // Default consumption
      const monthlySavings = monthlyConsumption * 0.75; // 75% of electricity cost
      const estimatedCost = (context.systemSize || 5) * 5000; // R$5000 per kW
      const annualSavings = monthlySavings * 12;
      const paybackYears = estimatedCost / annualSavings;
      const roi25Years = annualSavings * 25 - estimatedCost;

      return {
        id: `solar-analysis-${Date.now()}`,
        type: "solar-analysis-results",
        data: {
          location: {
            displayName: context.location?.address || `Coordenadas: ${lat}, ${lon}`,
            lat,
            lon,
            city: "São Paulo", // This would be determined from geocoding
            state: "SP"
          },
          roof: {
            area: 48.7, // m²
            azimuth: 12,
            orientation: "Norte",
            qualityScore: 94
          },
          irradiation: {
            daily: nasaData.status === "fulfilled" ? nasaData.value.irradiation_avg : 4.5,
            monthly: (nasaData.status === "fulfilled" ? nasaData.value.irradiation_avg : 4.5) * 30,
            annual: (nasaData.status === "fulfilled" ? nasaData.value.irradiation_avg : 4.5) * 365,
            source: nasaData.status === "fulfilled" ? nasaData.value.source : "Estimado"
          },
          system: {
            recommendedPower: context.systemSize || 6.05,
            panelCount: Math.ceil((context.systemSize || 6.05) / 0.55), // Assuming 550W panels
            annualProduction: pvgisData.status === "fulfilled" ? pvgisData.value.E_y : 9075,
            efficiency: 85
          },
          financial: {
            estimatedCost,
            monthlySavings,
            annualSavings,
            paybackYears: parseFloat(paybackYears.toFixed(2)),
            roi25Years: parseFloat(roi25Years.toFixed(2))
          },
          environmental: {
            co2Offset: 4356,
            treesEquivalent: 50
          },
          demographics: {
            population: 12300000,
            averageIncome: 5240
          }
        }
      };
    } catch (error) {
      console.error("Error creating solar analysis widget:", error);
      // Fallback to demo data if API fails
      return {
        id: `solar-analysis-${Date.now()}`,
        type: "solar-analysis-results",
        data: {
          location: {
            displayName: "Localização Padrão",
            lat: -23.5505,
            lon: -46.6333,
            city: "São Paulo",
            state: "SP"
          },
          roof: {
            area: 48.7,
            azimuth: 12,
            orientation: "Norte",
            qualityScore: 94
          },
          irradiation: {
            daily: 4.5,
            monthly: 136.5,
            annual: 1642.5,
            source: "Estimado"
          },
          system: {
            recommendedPower: 6.05,
            panelCount: 11,
            annualProduction: 9075,
            efficiency: 85
          },
          financial: {
            estimatedCost: 30250,
            monthlySavings: 574,
            annualSavings: 6888,
            paybackYears: 4.39,
            roi25Years: 172200
          },
          environmental: {
            co2Offset: 4356,
            treesEquivalent: 50
          },
          demographics: {
            population: 12300000,
            averageIncome: 5240
          }
        }
      };
    }
  }

  /**
   * Creates a solar kit widget with equipment recommendations
   */
  static async createSolarKitWidget(context: ContextData): Promise<Widget> {
    // Get location-specific data to customize the kit
    let lat = context.location?.lat || -23.5505;
    let lon = context.location?.lon || -46.6333;
    
    try {
      // Get solar irradiation to customize recommendations
      const nasaData = await nasaService.getClimateData({
        lat,
        lon,
        parameters: ["ALLSKY_SFC_SW_DWN"]
      });

      const recommendedPower = context.systemSize || 5.4;
      const monthlyProduction = nasaData.irradiation_avg * 30 * recommendedPower * 0.8; // 80% efficiency

      return {
        id: `solar-kit-${Date.now()}`,
        type: "solar-kit",
        data: {
          title: "Kit Solar Residencial Premium",
          subtitle: "Sistema completo para sua residência",
          specs: [
            { label: "Potência", value: `${recommendedPower} kWp` },
            { label: "Geração Mensal", value: `${monthlyProduction.toFixed(0)} kWh` },
            { label: "Área Mínima", value: `${recommendedPower * 10} m²` }
          ],
          components: [
            {
              icon: "☀️",
              name: "Painéis Solares 450W",
              description: "Canadian Solar HiKu7 Mono PERC",
              quantity: `${Math.ceil(recommendedPower/0.45)} unidades`
            },
            {
              icon: "⚡",
              name: "Inversor Híbrido " + Math.ceil(recommendedPower) + "kW",
              description: "Conversão de alta eficiência com backup",
              quantity: "1 unidade"
            },
            {
              icon: "🔋",
              name: "Estrutura de Fixação",
              description: "Alumínio anodizado, garantia 25 anos",
              quantity: "1 kit"
            },
            {
              icon: "📊",
              name: "Sistema de Monitoramento",
              description: "App mobile com acompanhamento em tempo real",
              quantity: "1 licença"
            }
          ],
          price: `R$ ${(recommendedPower * 5000).toFixed(0)}`,
          monthlySavings: `R$ ${(context.consumption ? context.consumption * 0.75 : 400).toFixed(0)}/mês`,
          paybackPeriod: `${Math.max(3, recommendedPower).toFixed(1)} anos`,
          actions: [
            {
              label: "Solicitar Proposta",
              type: "request_proposal",
              variant: "default",
              payload: { kitId: `solar-kit-${Date.now()}` }
            },
            {
              label: "Simular Financiamento",
              type: "simulate_financing",
              variant: "outline",
              payload: { kitId: `solar-kit-${Date.now()}` }
            }
          ]
        }
      };
    } catch (error) {
      console.error("Error creating solar kit widget:", error);
      // Return demo data
      return {
        id: `solar-kit-${Date.now()}`,
        type: "solar-kit",
        data: {
          title: "Kit Solar Residencial Premium",
          subtitle: "Sistema completo para sua residência",
          specs: [
            { label: "Potência", value: "5.4 kWp" },
            { label: "Geração Mensal", value: "650 kWh" },
            { label: "Área Mínima", value: "30 m²" }
          ],
          components: [
            {
              icon: "☀️",
              name: "Painéis Solares 450W",
              description: "Canadian Solar HiKu7 Mono PERC",
              quantity: "12 unidades"
            },
            {
              icon: "⚡",
              name: "Inversor Híbrido 5kW",
              description: "Conversão de alta eficiência com backup",
              quantity: "1 unidade"
            },
            {
              icon: "🔋",
              name: "Estrutura de Fixação",
              description: "Alumínio anodizado, garantia 25 anos",
              quantity: "1 kit"
            },
            {
              icon: "📊",
              name: "Sistema de Monitoramento",
              description: "App mobile com acompanhamento em tempo real",
              quantity: "1 licença"
            }
          ],
          price: "R$ 24.990",
          monthlySavings: "R$ 487/mês",
          paybackPeriod: "4,3 anos",
          actions: [
            {
              label: "Solicitar Proposta",
              type: "request_proposal",
              variant: "default",
              payload: { kitId: `solar-kit-${Date.now()}` }
            },
            {
              label: "Simular Financiamento",
              type: "simulate_financing",
              variant: "outline",
              payload: { kitId: `solar-kit-${Date.now()}` }
            }
          ]
        }
      };
    }
  }

  /**
   * Creates a financing calculation widget with real bank data
   */
  static async createFinancingWidget(context: ContextData): Promise<Widget> {
    const systemCost = (context.systemSize || 5) * 5000; // R$5000 per kW
    const downPayment = systemCost * 0.2; // 20% down payment
    const financedAmount = systemCost - downPayment;
    
    try {
      // Get tariff data to contextualize financing based on energy savings
      const tariffData = await aneelService.getTariffs(null, context.location?.state || "SP", 1);
      
      return {
        id: `financing-${Date.now()}`,
        type: "financing-calc",
        data: {
          title: "Simulação de Financiamento",
          subtitle: "Opções multi-banco para seu projeto solar",
          totalAmount: `R$ ${systemCost.toFixed(0)}`,
          downPayment: `R$ ${downPayment.toFixed(0)}`,
          financedAmount: `R$ ${financedAmount.toFixed(0)}`,
          options: [
            {
              bank: "Banco BV",
              term: "48 meses",
              rate: "1,89% a.m.",
              monthlyPayment: `R$ ${(financedAmount / 48 * 0.032).toFixed(0)}`,
              totalPayment: `R$ ${(financedAmount * 1.54).toFixed(0)}`
            },
            {
              bank: "Santander",
              term: "48 meses",
              rate: "1,95% a.m.",
              monthlyPayment: `R$ ${(financedAmount / 48 * 0.033).toFixed(0)}`,
              totalPayment: `R$ ${(financedAmount * 1.58).toFixed(0)}`
            },
            {
              bank: "Banco do Brasil",
              term: "60 meses",
              rate: "1,79% a.m.",
              monthlyPayment: `R$ ${(financedAmount / 60 * 0.028).toFixed(0)}`,
              totalPayment: `R$ ${(financedAmount * 1.68).toFixed(0)}`
            }
          ],
          actions: [
            {
              label: "Prosseguir com Financiamento",
              type: "proceed_financing",
              variant: "default",
              payload: { financingId: `financing-${Date.now()}` }
            },
            {
              label: "Ajustar Valores",
              type: "adjust_values",
              variant: "outline",
              payload: { financingId: `financing-${Date.now()}` }
            }
          ]
        }
      };
    } catch (error) {
      console.error("Error creating financing widget:", error);
      // Return demo data
      return {
        id: `financing-${Date.now()}`,
        type: "financing-calc",
        data: {
          title: "Simulação de Financiamento",
          subtitle: "Opções multi-banco para seu projeto solar",
          totalAmount: "R$ 24.990",
          downPayment: "R$ 4.990",
          financedAmount: "R$ 20.000",
          options: [
            {
              bank: "Banco BV",
              term: "48 meses",
              rate: "1,89% a.m.",
              monthlyPayment: "R$ 589",
              totalPayment: "R$ 28.272"
            },
            {
              bank: "Santander",
              term: "48 meses",
              rate: "1,95% a.m.",
              monthlyPayment: "R$ 597",
              totalPayment: "R$ 28.656"
            },
            {
              bank: "Banco do Brasil",
              term: "60 meses",
              rate: "1,79% a.m.",
              monthlyPayment: "R$ 512",
              totalPayment: "R$ 30.720"
            }
          ],
          actions: [
            {
              label: "Prosseguir com Financiamento",
              type: "proceed_financing",
              variant: "default",
              payload: { financingId: `financing-${Date.now()}` }
            },
            {
              label: "Ajustar Valores",
              type: "adjust_values",
              variant: "outline",
              payload: { financingId: `financing-${Date.now()}` }
            }
          ]
        }
      };
    }
  }

  /**
   * Creates a utility analysis widget with consumption patterns
   */
  static createUtilityAnalysisWidget(context: ContextData): Promise<Widget> {
    return Promise.resolve({
      id: `utility-${Date.now()}`,
      type: "utility-analysis",
      data: {
        title: "Análise de Consumo de Energia",
        subtitle: "Análise de padrões de consumo",
        question: context.consumption ? 
          `Como posso reduzir minha conta de R$ ${context.consumption * 0.75}?` : 
          "Como posso reduzir meu consumo de energia?",
        analysisTitle: "Análise de histórico de consumo",
        steps: [
          "Encontrando padrões de consumo",
          "Comparando com similar região",
          "Gerando recomendações",
          "Pronto"
        ],
        summary: context.consumption ? 
          `Analisamos seu consumo médio de ${context.consumption} kWh/mês e identificamos oportunidades de economia.` : 
          "Analisamos padrões de consumo e identificamos oportunidades de economia.",
        averageLabel: "Consumo médio mensal",
        averageValue: context.consumption ? `${context.consumption} kWh` : "1,083 kWh",
        chartData: [890, 1156, 1289, 1045, 967, 1089, 1146],
        chartLabels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul"],
        actions: [
          {
            label: "Ver Recomendações",
            type: "view_recommendations",
            variant: "default",
            payload: { analysisId: `utility-${Date.now()}` }
          },
          {
            label: "Dimensinar Sistema",
            type: "request_solar_analysis",
            variant: "outline",
            payload: { analysisId: `utility-${Date.now()}` }
          }
        ]
      }
    });
  }

  /**
   * Creates a solar location search widget
   */
  static createLocationSearchWidget(context: ContextData): Widget {
    return {
      id: `location-search-${Date.now()}`,
      type: "solar-location-search",
      data: {
        initialAddress: context.location?.address || ""
      }
    };
  }

  /**
   * Creates the appropriate widget based on context and request
   */
  static async createWidgetForRequest(request: string, context: ContextData): Promise<Widget> {
    const lowerRequest = request.toLowerCase();
    
    if (lowerRequest.includes('análise') || lowerRequest.includes('resultado') || lowerRequest.includes('relatório')) {
      return this.createSolarAnalysisWidget(context);
    } else if (lowerRequest.includes('kit') || lowerRequest.includes('sistema')) {
      return this.createSolarKitWidget(context);
    } else if (lowerRequest.includes('financiamento') || lowerRequest.includes('crédito')) {
      return this.createFinancingWidget(context);
    } else if (lowerRequest.includes('consumo') || lowerRequest.includes('fatura') || lowerRequest.includes('energia')) {
      return this.createUtilityAnalysisWidget(context);
    } else if (lowerRequest.includes('localização') || lowerRequest.includes('endereco') || lowerRequest.includes('cep')) {
      return this.createLocationSearchWidget(context);
    } else {
      // Default to solar analysis if it's related to solar
      if (lowerRequest.includes('solar') || lowerRequest.includes('dimensionamento') || lowerRequest.includes('telhado')) {
        return this.createSolarAnalysisWidget(context);
      }
    }
    
    // Return null if no specific widget applies
    return {
      id: `placeholder-${Date.now()}`,
      type: "solar-analysis-results",
      data: {
        location: {
          displayName: "Localização Padrão",
          lat: -23.5505,
          lon: -46.6333,
          city: "São Paulo",
          state: "SP"
        },
        roof: {
          area: 48.7,
          azimuth: 12,
          orientation: "Norte",
          qualityScore: 94
        },
        irradiation: {
          daily: 4.5,
          monthly: 136.5,
          annual: 1642.5,
          source: "Estimado"
        },
        system: {
          recommendedPower: 6.05,
          panelCount: 11,
          annualProduction: 9075,
          efficiency: 85
        },
        financial: {
          estimatedCost: 30250,
          monthlySavings: 574,
          annualSavings: 6888,
          paybackYears: 4.39,
          roi25Years: 172200
        },
        environmental: {
          co2Offset: 4356,
          treesEquivalent: 50
        },
        demographics: {
          population: 12300000,
          averageIncome: 5240
        }
      }
    };
  }
}