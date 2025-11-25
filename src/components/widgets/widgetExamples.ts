import { Widget } from "./WidgetRenderer"
import inversorImage from "@/assets/images/05_(1).png"

export const widgetExamples: { [key: string]: Widget } = {
  solarLocationSearch: {
    id: "location-search-1",
    type: "solar-location-search",
    data: {
      initialAddress: ""
    }
  },

  roofDrawing: {
    id: "roof-drawing-1",
    type: "roof-drawing",
    data: {
      location: {
        lat: -23.5505,
        lon: -46.6333,
        displayName: "Rua das Flores, 123 - Jardim Paulista, São Paulo, SP"
      }
    }
  },

  solarAnalysisResults: {
    id: "solar-analysis-1",
    type: "solar-analysis-results",
    data: {
      location: {
        displayName: "Rua das Flores, 123 - Jardim Paulista, São Paulo, SP",
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
        daily: 5.18,
        monthly: 155.4,
        annual: 1890.7,
        source: "NREL NSRDB 2022"
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
  },

  utilityAnalysis: {
    id: "utility-1",
    type: "utility-analysis",
    data: {
      title: "Utility analysis",
      subtitle: "Análise de consumo de energia",
      question: "How's my energy usage?",
      analysisTitle: "Analyzed past bills",
      steps: [
        "Finding past bills",
        "Analyzing and comparing usage",
        "Generating chart",
        "Pronto"
      ],
      summary: "I analyzed your historical bills and pulled together the details below.",
      averageLabel: "6 month average",
      averageValue: "1,083 kWh",
      chartData: [890, 1156, 1289, 1045, 967, 1089, 1146],
      chartLabels: ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      actions: [
        {
          label: "Ver Recomendações",
          type: "view_recommendations",
          variant: "default",
          payload: { analysisId: "utility-1" }
        },
        {
          label: "Exportar Dados",
          type: "export_data",
          variant: "outline",
          payload: { analysisId: "utility-1" }
        }
      ]
    }
  },

  solarKit: {
    id: "solar-kit-1",
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
          payload: { kitId: "solar-kit-1" }
        },
        {
          label: "Simular Financiamento",
          type: "simulate_financing",
          variant: "outline",
          payload: { kitId: "solar-kit-1" }
        }
      ]
    }
  },

  financingCalc: {
    id: "financing-1",
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
          payload: { financingId: "financing-1" }
        },
        {
          label: "Ajustar Valores",
          type: "adjust_values",
          variant: "outline",
          payload: { financingId: "financing-1" }
        }
      ]
    }
  },

  productCard: {
    id: "product-1",
    type: "product",
    data: {
      name: "Inversor Fotovoltaico Híbrido 5kW",
      description: "Inversor solar híbrido de alta eficiência com sistema de backup integrado para máxima autonomia energética",
      image: inversorImage,
      price: "R$ 4.799",
      originalPrice: "R$ 5.999",
      rating: "4.9",
      badge: "20% OFF",
      features: [
        "Potência nominal de 5000W com suporte para picos de 7500W",
        "Eficiência máxima de 97.6% para conversão otimizada",
        "Sistema de backup integrado com troca automática",
        "Monitoramento remoto via WiFi e aplicativo móvel",
        "Garantia estendida de 10 anos com suporte técnico"
      ],
      actions: [
        {
          label: "Adicionar ao Carrinho",
          type: "add_to_cart",
          variant: "default",
          icon: "cart",
          payload: { productId: "product-1" }
        },
        {
          label: "Ver Detalhes",
          type: "view_details",
          variant: "outline",
          payload: { productId: "product-1" }
        }
      ]
    }
  },

  pollWidget: {
    id: "poll-1",
    type: "poll",
    data: {
      question: "Qual recurso devemos priorizar em seguida?",
      options: [
        { id: "opt-1", label: "Suporte a modo escuro", votes: 0 },
        { id: "opt-2", label: "Aplicativo móvel nativo", votes: 0 },
        { id: "opt-3", label: "Análises e relatórios avançados", votes: 0 },
        { id: "opt-4", label: "Colaboração em equipe em tempo real", votes: 0 }
      ],
      totalVotes: 0,
      allowMultiple: false
    }
  },

  progressWidget: {
    id: "progress-1",
    type: "progress",
    data: {
      title: "Marco do Projeto Q1",
      subtitle: "Desenvolvimento de Nova Plataforma 2024",
      items: [
        { label: "Pesquisa e Planejamento", progress: 100, status: "complete" },
        { label: "Fase de Design e Prototipagem", progress: 85, status: "active" },
        { label: "Desenvolvimento Backend", progress: 42, status: "active" },
        { label: "Desenvolvimento Frontend", progress: 38, status: "active" },
        { label: "Testes e Garantia de Qualidade", progress: 0, status: "pending" }
      ],
      overallProgress: 53,
      dueDate: "31 de Março de 2024"
    }
  },

  statsWidget: {
    id: "stats-1",
    type: "stats",
    data: {
      title: "Visão Geral de Desempenho",
      period: "Últimos 30 dias",
      metrics: [
        { label: "Usuários Totais", value: "12.453", change: "+12.5%", trend: "up" },
        { label: "Receita", value: "R$ 84.290", change: "+8.2%", trend: "up" },
        { label: "Taxa de Conversão", value: "3.2%", change: "-0.3%", trend: "down" },
        { label: "Sessão Média", value: "4m 32s", change: "+15.8%", trend: "up" }
      ]
    }
  },
  
  orderCard: {
    id: "order-1",
    type: "card",
    data: {
      title: "Pedido #12345",
      subtitle: "Realizado em 15 de Janeiro de 2024",
      content: "Seu pedido foi enviado e está a caminho. Entrega prevista: 20 de Janeiro de 2024. Acompanhe o status em tempo real através do nosso sistema de rastreamento.",
      badges: [
        { label: "Enviado", variant: "default" },
        { label: "2 itens", variant: "secondary" }
      ],
      actions: [
        {
          label: "Rastrear Pedido",
          type: "track_order",
          variant: "default",
          payload: { orderId: "12345" }
        },
        {
          label: "Ver Detalhes",
          type: "view_order",
          variant: "outline",
          payload: { orderId: "12345" }
        }
      ],
      status: {
        text: "Atualizado há 2 horas",
        icon: "📦"
      }
    }
  },
  
  taskList: {
    id: "tasks-1",
    type: "list",
    data: {
      header: "Tarefas de Hoje",
      items: [
        {
          icon: "📄",
          title: "Revisar relatório trimestral",
          subtitle: "Prazo em 2 horas • Prioridade Alta",
          badge: "Urgente",
          action: {
            type: "open_task",
            payload: { taskId: "task-1" }
          }
        },
        {
          icon: "📅",
          title: "Reunião de equipe às 15h",
          subtitle: "Sala de Conferências B • 45 minutos",
          badge: "Hoje",
          action: {
            type: "open_task",
            payload: { taskId: "task-2" }
          }
        },
        {
          icon: "⏰",
          title: "Enviar planilha de horas",
          subtitle: "Antes do fim do expediente",
          action: {
            type: "open_task",
            payload: { taskId: "task-3" }
          }
        }
      ],
      footer: "3 tarefas restantes hoje"
    }
  },
  
  bookingForm: {
    id: "booking-1",
    type: "form",
    data: {
      id: "booking-form",
      title: "Agendar Consulta",
      fields: [
        {
          label: "Tipo de Serviço",
          name: "service",
          type: "select",
          placeholder: "Selecione um serviço",
          required: true,
          options: [
            { label: "Consulta Inicial", value: "consultation" },
            { label: "Retorno", value: "followup" },
            { label: "Check-up Geral", value: "checkup" }
          ]
        },
        {
          label: "Data Preferida",
          name: "date",
          type: "date",
          placeholder: "Selecione uma data",
          required: true
        },
        {
          label: "Observações",
          name: "notes",
          type: "text",
          placeholder: "Alguma necessidade especial?"
        }
      ],
      submitLabel: "Confirmar Agendamento",
      cancelLabel: "Cancelar"
    }
  },
  
  paymentCard: {
    id: "payment-1",
    type: "card",
    data: {
      title: "Pagamento Pendente",
      subtitle: "Fatura #INV-2024-001",
      content: "Seu pagamento de renovação de assinatura está pendente. Complete o pagamento para continuar aproveitando os recursos premium sem interrupções.",
      badges: [
        { label: "R$ 49,99", variant: "default" },
        { label: "Vence Hoje", variant: "destructive" }
      ],
      actions: [
        {
          label: "Pagar Agora",
          type: "pay_invoice",
          variant: "default",
          payload: { invoiceId: "INV-2024-001", amount: 49.99 }
        },
        {
          label: "Ver Fatura",
          type: "view_invoice",
          variant: "outline",
          payload: { invoiceId: "INV-2024-001" }
        }
      ],
      status: {
        text: "Pagamento seguro via Stripe",
        icon: "🔒"
      }
    }
  },
  
  appointmentCalendar: {
    id: "appointment-1",
    type: "calendar",
    data: {
      title: "Consulta Médica",
      date: "25 de Janeiro de 2024 às 10:00",
      status: "confirmado",
      details: [
        { label: "Médico", value: "Dr. Sarah Johnson" },
        { label: "Local", value: "Centro Médico Downtown" },
        { label: "Duração", value: "30 minutos" }
      ],
      description: "Exame físico anual e check-up de saúde completo",
      actions: [
        {
          label: "Reagendar",
          type: "reschedule_appointment",
          variant: "outline",
          payload: { appointmentId: "apt-1" }
        },
        {
          label: "Cancelar",
          type: "cancel_appointment",
          variant: "destructive",
          payload: { appointmentId: "apt-1" }
        }
      ]
    }
  },
  
  featureList: {
    id: "features-1",
    type: "list",
    data: {
      header: "Recursos Premium",
      items: [
        {
          icon: "✨",
          title: "Análises Avançadas",
          subtitle: "Obtenha insights detalhados sobre seus dados e métricas de performance"
        },
        {
          icon: "🔒",
          title: "Suporte Prioritário",
          subtitle: "Equipe de suporte dedicada 24/7 com tempo de resposta rápido"
        },
        {
          icon: "☁️",
          title: "Armazenamento em Nuvem",
          subtitle: "100GB de armazenamento seguro em nuvem com backup automático"
        },
        {
          icon: "🚀",
          title: "Acesso Antecipado",
          subtitle: "Experimente novos recursos antes de todos os outros usuários"
        }
      ],
      footer: "Atualize para Pro para desbloquear todos os recursos"
    }
  }
}

export const widgetDemoMessages = {
  "dimensionamento": widgetExamples.solarLocationSearch,
  "dimensionar": widgetExamples.solarLocationSearch,
  "localização": widgetExamples.solarLocationSearch,
  "endereço": widgetExamples.solarLocationSearch,
  "telhado": widgetExamples.roofDrawing,
  "desenhar": widgetExamples.roofDrawing,
  "área": widgetExamples.roofDrawing,
  "resultados": widgetExamples.solarAnalysisResults,
  "análise completa": widgetExamples.solarAnalysisResults,
  "relatório": widgetExamples.solarAnalysisResults,
  "analise": widgetExamples.utilityAnalysis,
  "fatura": widgetExamples.utilityAnalysis,
  "energia": widgetExamples.utilityAnalysis,
  "consumo": widgetExamples.utilityAnalysis,
  "kit": widgetExamples.solarKit,
  "kit solar": widgetExamples.solarKit,
  "escolher": widgetExamples.solarKit,
  "financiamento": widgetExamples.financingCalc,
  "crédito": widgetExamples.financingCalc,
  "simular": widgetExamples.financingCalc,
  "show product": widgetExamples.productCard,
  "show order": widgetExamples.orderCard,
  "show tasks": widgetExamples.taskList,
  "show booking": widgetExamples.bookingForm,
  "show payment": widgetExamples.paymentCard,
  "show appointment": widgetExamples.appointmentCalendar,
  "show features": widgetExamples.featureList,
  "show poll": widgetExamples.pollWidget,
  "show progress": widgetExamples.progressWidget,
  "show stats": widgetExamples.statsWidget,
}
