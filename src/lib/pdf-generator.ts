import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

export interface SolarProposalData {
  clientName: string
  clientDocument?: string
  clientAddress?: string
  clientEmail?: string
  clientPhone?: string
  
  projectLocation: {
    address: string
    city: string
    state: string
    cep: string
    coordinates?: {
      latitude: number
      longitude: number
    }
  }
  
  consumptionData: {
    monthlyConsumptionKWh: number
    averageBillValue: number
    electricalPhase: "monofásica" | "bifásica" | "trifásica"
    tariffKWhValue?: number
  }
  
  solarData: {
    irradiationKWhM2Day: number
    performanceRatio: number
    averageSunHours: number
    annualDegradation?: number
  }
  
  systemConfiguration: {
    scenario: "conservador" | "equilibrado" | "otimizado"
    systemSizeKWp: number
    numberOfPanels: number
    panelPowerW: number
    panelBrand: string
    panelModel: string
    inverterBrand: string
    inverterModel: string
    inverterPowerKW: number
    numberOfInverters: number
    mountingStructure: string
    estimatedAnnualProductionKWh: number
    coveragePercentage: number
  }
  
  financialAnalysis: {
    totalInvestment: number
    equipmentCost: number
    installationCost: number
    projectCost: number
    monthlyEconomyEstimate: number
    annualEconomyEstimate: number
    simplePaybackYears: number
    roi25Years: number
    irr?: number
  }
  
  financing?: {
    bank: string
    termMonths: number
    interestRateMonthly: number
    downPayment?: number
    monthlyPayment: number
    totalFinanced: number
  }
  
  shadingAnalysis?: {
    annualShadingPercentage: number
    shadingLevel: "excelente" | "bom" | "moderado" | "significativo"
    terrainElevation?: number
    terrainSlope?: number
    terrainAspect?: number
  }
  
  nextSteps?: string[]
  
  observations?: string
  
  generatedBy?: string
  generatedDate?: Date
}

export function generateSolarProposalPDF(data: SolarProposalData): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - 2 * margin
  let yPos = margin

  const colors = {
    primary: [255, 214, 10] as [number, number, number],
    secondary: [255, 61, 61] as [number, number, number],
    accent: [255, 0, 102] as [number, number, number],
    text: [38, 38, 38] as [number, number, number],
    textLight: [115, 115, 115] as [number, number, number],
    background: [252, 252, 252] as [number, number, number],
    white: [255, 255, 255] as [number, number, number]
  }

  const addNewPageIfNeeded = (requiredSpace: number) => {
    if (yPos + requiredSpace > pageHeight - margin) {
      doc.addPage()
      yPos = margin
      return true
    }
    return false
  }

  doc.setFillColor(...colors.primary)
  doc.rect(0, 0, pageWidth, 50, "F")
  
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(28)
  doc.setFont("helvetica", "bold")
  doc.text("Proposta Técnico-Comercial", margin, 25)
  
  doc.setFontSize(14)
  doc.setFont("helvetica", "normal")
  doc.text("Sistema Solar Fotovoltaico", margin, 35)

  yPos = 60

  doc.setFillColor(...colors.background)
  doc.roundedRect(margin, yPos, contentWidth, 35, 3, 3, "F")
  
  doc.setTextColor(...colors.text)
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text("Cliente", margin + 5, yPos + 8)
  
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(`Nome: ${data.clientName}`, margin + 5, yPos + 16)
  
  if (data.clientDocument) {
    doc.text(`CPF/CNPJ: ${data.clientDocument}`, margin + 5, yPos + 22)
  }
  
  if (data.clientEmail) {
    doc.text(`E-mail: ${data.clientEmail}`, margin + 5, yPos + 28)
  }
  
  if (data.clientPhone) {
    doc.text(`Telefone: ${data.clientPhone}`, contentWidth / 2 + margin, yPos + 28)
  }

  yPos += 45

  doc.setFillColor(...colors.background)
  doc.roundedRect(margin, yPos, contentWidth, 30, 3, 3, "F")
  
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text("Localização do Projeto", margin + 5, yPos + 8)
  
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(data.projectLocation.address, margin + 5, yPos + 16)
  doc.text(`${data.projectLocation.city} - ${data.projectLocation.state}`, margin + 5, yPos + 22)
  doc.text(`CEP: ${data.projectLocation.cep}`, margin + 5, yPos + 28)

  yPos += 40
  addNewPageIfNeeded(60)

  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...colors.secondary)
  doc.text("Dados de Consumo", margin, yPos)
  yPos += 8

  const consumptionData = [
    ["Consumo Mensal Médio", `${data.consumptionData.monthlyConsumptionKWh.toLocaleString('pt-BR')} kWh`],
    ["Valor Médio da Conta", `R$ ${data.consumptionData.averageBillValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
    ["Tipo de Ligação", data.consumptionData.electricalPhase],
    ...(data.consumptionData.tariffKWhValue ? [["Tarifa (R$/kWh)", `R$ ${data.consumptionData.tariffKWhValue.toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`]] : [])
  ]

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: consumptionData,
    theme: "grid",
    headStyles: {
      fillColor: colors.primary,
      textColor: colors.text,
      fontStyle: "bold"
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: contentWidth * 0.5 },
      1: { halign: "right" }
    },
    margin: { left: margin, right: margin }
  })

  yPos = (doc as any).lastAutoTable.finalY + 15
  addNewPageIfNeeded(60)

  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...colors.secondary)
  doc.text("Dados Solares do Local", margin, yPos)
  yPos += 8

  const solarData = [
    ["Irradiação Solar Média", `${data.solarData.irradiationKWhM2Day.toFixed(2)} kWh/m²/dia`],
    ["Horas de Sol Equivalente", `${data.solarData.averageSunHours.toFixed(1)} h/dia`],
    ["Performance Ratio (PR)", `${(data.solarData.performanceRatio * 100).toFixed(0)}%`],
    ...(data.solarData.annualDegradation ? [["Degradação Anual", `${(data.solarData.annualDegradation * 100).toFixed(2)}%`]] : [])
  ]

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: solarData,
    theme: "grid",
    headStyles: {
      fillColor: colors.primary,
      textColor: colors.text,
      fontStyle: "bold"
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: contentWidth * 0.5 },
      1: { halign: "right" }
    },
    margin: { left: margin, right: margin }
  })

  yPos = (doc as any).lastAutoTable.finalY + 15
  addNewPageIfNeeded(100)

  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...colors.secondary)
  doc.text("Configuração do Sistema", margin, yPos)
  yPos += 5

  const scenarioMap = {
    conservador: "Conservador (1.14x)",
    equilibrado: "Equilibrado (1.30x) - RECOMENDADO",
    otimizado: "Otimizado (1.45x)"
  }

  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...colors.accent)
  doc.text(`Cenário: ${scenarioMap[data.systemConfiguration.scenario]}`, margin, yPos + 8)
  yPos += 15

  const systemData = [
    ["Potência do Sistema", `${data.systemConfiguration.systemSizeKWp.toFixed(2)} kWp`],
    ["Produção Anual Estimada", `${data.systemConfiguration.estimatedAnnualProductionKWh.toLocaleString('pt-BR')} kWh/ano`],
    ["Cobertura do Consumo", `${data.systemConfiguration.coveragePercentage.toFixed(0)}%`],
    ["Painéis Solares", `${data.systemConfiguration.numberOfPanels}x ${data.systemConfiguration.panelBrand} ${data.systemConfiguration.panelModel} (${data.systemConfiguration.panelPowerW}W)`],
    ["Inversor(es)", `${data.systemConfiguration.numberOfInverters}x ${data.systemConfiguration.inverterBrand} ${data.systemConfiguration.inverterModel} (${data.systemConfiguration.inverterPowerKW}kW)`],
    ["Estrutura de Fixação", data.systemConfiguration.mountingStructure]
  ]

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: systemData,
    theme: "grid",
    headStyles: {
      fillColor: colors.primary,
      textColor: colors.text,
      fontStyle: "bold"
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: contentWidth * 0.4 },
      1: { halign: "left" }
    },
    margin: { left: margin, right: margin }
  })

  yPos = (doc as any).lastAutoTable.finalY + 15
  addNewPageIfNeeded(80)

  if (data.shadingAnalysis) {
    doc.setFontSize(18)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...colors.secondary)
    doc.text("Análise de Sombreamento", margin, yPos)
    yPos += 8

    const shadingLevelMap = {
      excelente: "Excelente (< 5%)",
      bom: "Bom (5-10%)",
      moderado: "Moderado (10-20%)",
      significativo: "Significativo (> 20%)"
    }

    const shadingData = [
      ["Sombreamento Anual", `${data.shadingAnalysis.annualShadingPercentage.toFixed(1)}%`],
      ["Classificação", shadingLevelMap[data.shadingAnalysis.shadingLevel]],
      ...(data.shadingAnalysis.terrainElevation ? [["Elevação do Terreno", `${data.shadingAnalysis.terrainElevation.toFixed(0)} m`]] : []),
      ...(data.shadingAnalysis.terrainSlope ? [["Inclinação do Terreno", `${data.shadingAnalysis.terrainSlope.toFixed(1)}°`]] : []),
      ...(data.shadingAnalysis.terrainAspect ? [["Orientação do Terreno", `${data.shadingAnalysis.terrainAspect.toFixed(0)}° (azimute)`]] : [])
    ]

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: shadingData,
      theme: "grid",
      headStyles: {
        fillColor: colors.primary,
        textColor: colors.text,
        fontStyle: "bold"
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: contentWidth * 0.5 },
        1: { halign: "right" }
      },
      margin: { left: margin, right: margin }
    })

    yPos = (doc as any).lastAutoTable.finalY + 15
    addNewPageIfNeeded(80)
  }

  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...colors.secondary)
  doc.text("Análise Financeira", margin, yPos)
  yPos += 8

  const financialData = [
    ["Investimento Total", `R$ ${data.financialAnalysis.totalInvestment.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
    ["   • Equipamentos", `R$ ${data.financialAnalysis.equipmentCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
    ["   • Instalação", `R$ ${data.financialAnalysis.installationCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
    ["   • Projeto", `R$ ${data.financialAnalysis.projectCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
    ["Economia Mensal Estimada", `R$ ${data.financialAnalysis.monthlyEconomyEstimate.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
    ["Economia Anual Estimada", `R$ ${data.financialAnalysis.annualEconomyEstimate.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
    ["Payback Simples", `${data.financialAnalysis.simplePaybackYears.toFixed(1)} anos`],
    ["ROI em 25 anos", `${data.financialAnalysis.roi25Years.toFixed(0)}%`],
    ...(data.financialAnalysis.irr ? [["TIR (Taxa Interna de Retorno)", `${data.financialAnalysis.irr.toFixed(1)}%`]] : [])
  ]

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: financialData,
    theme: "grid",
    headStyles: {
      fillColor: colors.primary,
      textColor: colors.text,
      fontStyle: "bold"
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: contentWidth * 0.5 },
      1: { halign: "right" }
    },
    margin: { left: margin, right: margin }
  })

  yPos = (doc as any).lastAutoTable.finalY + 15
  addNewPageIfNeeded(60)

  if (data.financing) {
    doc.setFontSize(18)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...colors.secondary)
    doc.text("Opção de Financiamento", margin, yPos)
    yPos += 8

    const financingData = [
      ["Instituição Financeira", data.financing.bank],
      ["Prazo", `${data.financing.termMonths} meses`],
      ["Taxa de Juros", `${(data.financing.interestRateMonthly * 100).toFixed(2)}% a.m.`],
      ...(data.financing.downPayment ? [["Entrada", `R$ ${data.financing.downPayment.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`]] : []),
      ["Valor Financiado", `R$ ${data.financing.totalFinanced.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
      ["Parcela Mensal", `R$ ${data.financing.monthlyPayment.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`]
    ]

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: financingData,
      theme: "grid",
      headStyles: {
        fillColor: colors.primary,
        textColor: colors.text,
        fontStyle: "bold"
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: contentWidth * 0.5 },
        1: { halign: "right" }
      },
      margin: { left: margin, right: margin }
    })

    yPos = (doc as any).lastAutoTable.finalY + 10

    const netSavings = data.financialAnalysis.monthlyEconomyEstimate - data.financing.monthlyPayment

    if (netSavings >= 0) {
      doc.setFillColor(220, 252, 231)
    } else {
      doc.setFillColor(254, 242, 242)
    }
    doc.roundedRect(margin, yPos, contentWidth, 12, 2, 2, "F")
    
    doc.setFontSize(11)
    doc.setFont("helvetica", "bold")
    if (netSavings >= 0) {
      doc.setTextColor(22, 101, 52)
    } else {
      doc.setTextColor(153, 27, 27)
    }
    doc.text(
      `Economia Líquida Mensal: R$ ${Math.abs(netSavings).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${netSavings >= 0 ? '(Positivo)' : '(Investimento)'}`,
      margin + 5,
      yPos + 8
    )

    yPos += 20
    addNewPageIfNeeded(60)
  }

  doc.setFillColor(255, 248, 225)
  doc.roundedRect(margin, yPos, contentWidth, 35, 3, 3, "F")
  
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...colors.text)
  doc.text("⚠️ Nota Regulatória (Lei 14.300/2022)", margin + 5, yPos + 8)
  
  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  const regulatoryText = `Este sistema se enquadra em ${data.systemConfiguration.systemSizeKWp <= 75 ? 'microgeração' : 'minigeração'} distribuída e segue as regras de compensação da ANEEL. É necessário homologação pela concessionária local antes da instalação. O sistema gera créditos de energia que compensam o consumo, conforme Lei 14.300/2022.`
  
  const splitText = doc.splitTextToSize(regulatoryText, contentWidth - 10)
  doc.text(splitText, margin + 5, yPos + 16)

  yPos += 45
  addNewPageIfNeeded(60)

  if (data.nextSteps && data.nextSteps.length > 0) {
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...colors.secondary)
    doc.text("Próximos Passos", margin, yPos)
    yPos += 8

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...colors.text)
    
    data.nextSteps.forEach((step, index) => {
      doc.text(`${index + 1}. ${step}`, margin + 5, yPos)
      yPos += 6
    })

    yPos += 10
  }

  if (data.observations) {
    addNewPageIfNeeded(40)
    
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...colors.secondary)
    doc.text("Observações", margin, yPos)
    yPos += 8

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...colors.text)
    
    const splitObservations = doc.splitTextToSize(data.observations, contentWidth)
    doc.text(splitObservations, margin, yPos)
    yPos += splitObservations.length * 5 + 10
  }

  doc.setFillColor(...colors.background)
  doc.rect(0, pageHeight - 30, pageWidth, 30, "F")
  
  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(...colors.textLight)
  
  const footerText = `Gerado por: ${data.generatedBy || 'Yello Solar Hub'} | ${(data.generatedDate || new Date()).toLocaleDateString('pt-BR')} às ${(data.generatedDate || new Date()).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
  doc.text(footerText, pageWidth / 2, pageHeight - 15, { align: "center" })
  
  doc.text("Yello Solar Hub - Sistema de Gestão de Energia Solar", pageWidth / 2, pageHeight - 10, { align: "center" })

  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(...colors.textLight)
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: "right" })
  }

  return doc
}

export function downloadSolarProposalPDF(data: SolarProposalData, filename?: string): void {
  const doc = generateSolarProposalPDF(data)
  const defaultFilename = `proposta-solar-${data.clientName.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(filename || defaultFilename)
}

export function openSolarProposalPDF(data: SolarProposalData): void {
  const doc = generateSolarProposalPDF(data)
  doc.output('dataurlnewwindow')
}
