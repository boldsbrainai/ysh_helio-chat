# 🧩 Componentes UI Reutilizáveis - Incorporação 360º

Este diretório contém os componentes UI extraídos do **PLANO_INCORPORACAO_RECURSOS.md** para suportar a implementação end-to-end do Yello Solar Hub.

## 📦 Componentes Disponíveis

### 1. **MapViewer** 🗺️
Visualizador de mapas 3D interativo com terreno e controles de câmera.

**Funcionalidades:**
- Renderização 3D com MapLibre GL
- Terreno com exageração ajustável
- Controles de pitch (inclinação) e zoom
- Marcador customizado de localização
- Camada de sombreamento (hillshade)

**Uso:**
```tsx
import { MapViewer } from '@/components/integration'

<MapViewer
  latitude={-23.550520}
  longitude={-46.633308}
  zoom={18}
  pitch={60}
  showTerrain={true}
  onLocationChange={(lat, lon) => console.log(lat, lon)}
/>
```

**Props:**
- `latitude: number` - Latitude da localização
- `longitude: number` - Longitude da localização
- `zoom?: number` - Nível de zoom inicial (padrão: 18)
- `pitch?: number` - Inclinação da câmera (padrão: 60°)
- `showTerrain?: boolean` - Exibir terreno 3D (padrão: true)
- `onLocationChange?: (lat, lon) => void` - Callback quando a localização muda

**Recursos Necessários:**
- `VITE_MAPTILER_API_KEY` - Mapas base e terreno

---

### 2. **ImageUpload** 📸
Componente de upload de imagens com drag & drop, validação e preview.

**Funcionalidades:**
- Drag & drop de arquivos
- Validação de tipo e tamanho
- Preview em tempo real
- Conversão para base64
- Animações com Framer Motion

**Uso:**
```tsx
import { ImageUpload } from '@/components/integration'

<ImageUpload
  title="Upload de Foto do Telhado"
  description="Arraste uma imagem ou clique para selecionar"
  maxSizeMB={10}
  onUpload={async (file, base64) => {
    const analysis = await analyzeRoofImage(base64)
    console.log(analysis)
  }}
  onRemove={() => console.log("Imagem removida")}
/>
```

**Props:**
- `title?: string` - Título do card
- `description?: string` - Descrição/instruções
- `accept?: string` - Tipos de arquivo aceitos (padrão: "image/*")
- `maxSizeMB?: number` - Tamanho máximo em MB (padrão: 10)
- `onUpload: (file, base64) => Promise<void>` - Callback de upload
- `onRemove?: () => void` - Callback de remoção

**Use Cases:**
- Upload de fotos de telhado para análise
- Upload de conta de luz para extração de dados
- Upload de imagens de satélite/drone

---

### 3. **PlanSelector** 💳
Seletor de planos de assinatura com comparação visual.

**Funcionalidades:**
- Cards responsivos de planos
- Destaque para plano recomendado
- Badge de "Mais Popular"
- Comparação de features
- Estado de seleção visual

**Uso:**
```tsx
import { PlanSelector, DEFAULT_PLANS } from '@/components/integration'

<PlanSelector
  plans={DEFAULT_PLANS}
  currentPlanId="free"
  onSelectPlan={(planId) => {
    console.log("Plano selecionado:", planId)
    // Redirecionar para checkout
  }}
/>
```

**Props:**
- `plans: Plan[]` - Array de planos disponíveis
- `currentPlanId?: string` - ID do plano atual do usuário
- `onSelectPlan: (planId) => void` - Callback de seleção

**Interface Plan:**
```typescript
interface Plan {
  id: 'free' | 'pro' | 'enterprise'
  name: string
  price: number
  period: 'month' | 'year'
  description: string
  features: string[]
  highlighted?: boolean
  badge?: string
}
```

**Planos Padrão:**
- **Grátis**: 3 projetos, 10 análises/mês
- **Profissional** ⭐: 50 projetos, 500 análises/mês, Sentinel-2 (R$ 97/mês)
- **Empresarial**: Ilimitado, white-label, API (R$ 297/mês)

---

### 4. **WorkflowStepper** 📝
Stepper multi-etapas com validação e navegação.

**Funcionalidades:**
- Progress bar visual
- Navegação entre etapas
- Validação customizada por etapa
- Etapas opcionais
- Histórico de navegação

**Uso:**
```tsx
import { WorkflowStepper, WorkflowStep } from '@/components/integration'

const steps: WorkflowStep[] = [
  {
    id: 'address',
    title: 'Localização',
    description: 'Informe o endereço da instalação',
    content: <LocationPicker onLocationSelect={...} />,
    validation: () => selectedLocation !== null,
  },
  {
    id: 'consumption',
    title: 'Consumo',
    description: 'Informe o consumo mensal de energia',
    content: <Input type="number" ... />,
    validation: () => consumption > 0,
  },
]

<WorkflowStepper
  steps={steps}
  currentStep={currentStep}
  onStepChange={setCurrentStep}
  onComplete={() => {
    console.log("Workflow concluído!")
    // Processar dados e gerar relatório
  }}
/>
```

**Props:**
- `steps: WorkflowStep[]` - Array de etapas do workflow
- `currentStep: number` - Índice da etapa atual
- `onStepChange: (step) => void` - Callback de mudança de etapa
- `onComplete: () => void` - Callback ao concluir todas as etapas

**Interface WorkflowStep:**
```typescript
interface WorkflowStep {
  id: string
  title: string
  description: string
  content: ReactNode
  validation?: () => boolean
  optional?: boolean
}
```

**Workflows Sugeridos:**
- Dimensionamento solar (5 etapas)
- Simulação de financiamento (4 etapas)
- Análise de terreno (3 etapas)
- Homologação (6 etapas)

---

### 5. **ScenarioComparison** ⚡
Comparação visual de cenários de dimensionamento solar.

**Funcionalidades:**
- Cards comparativos de cenários
- Cálculos automáticos (kWp, ROI, payback)
- Destaque para cenário recomendado
- Ícones temáticos por cenário
- Formatação de moeda brasileira

**Uso:**
```tsx
import { ScenarioComparison, generateDemoScenarios } from '@/components/integration'

const scenarios = generateDemoScenarios(
  500, // consumo mensal em kWh
  5.5, // irradiação média (kWh/m²/dia)
  0.80 // performance ratio
)

<ScenarioComparison
  scenarios={scenarios}
  selectedScenarioId="equilibrado"
  onSelectScenario={(scenarioId) => {
    console.log("Cenário selecionado:", scenarioId)
    // Prosseguir para seleção de equipamentos
  }}
/>
```

**Props:**
- `scenarios: Scenario[]` - Array de cenários calculados
- `selectedScenarioId?: string` - ID do cenário selecionado
- `onSelectScenario: (id) => void` - Callback de seleção

**Interface Scenario:**
```typescript
interface Scenario {
  id: string
  name: string
  multiplier: number // 1.14, 1.30, 1.45
  systemSize: number // kWp
  panelCount: number
  estimatedGeneration: number // kWh/mês
  investment: number // R$
  payback: number // anos
  roi25Years: number // %
  coverage: string
  description: string
  recommended?: boolean
}
```

**Cenários Padrão:**
- **Conservador (1.14x)**: 85-90% cobertura, investimento menor
- **Equilibrado (1.30x)** ⭐: 95-100% cobertura, melhor custo-benefício
- **Otimizado (1.45x)**: 100%+ cobertura, geração de créditos extras

---

### 6. **AnalysisReport** 📊
Relatório técnico completo de análise solar com seções customizáveis.

**Funcionalidades:**
- Seções organizadas com ícones
- Recomendações, avisos e notas
- Botões de download PDF e compartilhamento
- Formatação profissional
- Nota legal automática

**Uso:**
```tsx
import { AnalysisReport, generateDemoReport } from '@/components/integration'
import { Sun, CurrencyCircleDollar, Lightning } from '@phosphor-icons/react'

<AnalysisReport
  projectName="Projeto Solar Residencial - João Silva"
  address="Rua das Flores, 123 - Belo Horizonte, MG"
  date={new Date().toISOString()}
  sections={[
    {
      title: "Dados do Sistema",
      icon: Sun,
      data: [
        { label: "Potência", value: 8.25, unit: "kWp", highlight: true },
        { label: "Painéis", value: 15, unit: "unidades" },
      ]
    },
    // ... mais seções
  ]}
  recommendations={[
    "Sistema bem dimensionado",
    "Orientação favorável (Norte)",
  ]}
  warnings={[
    "Árvore a 8m pode causar sombreamento",
  ]}
  onDownload={() => generatePDF()}
  onShare={() => copyShareLink()}
/>
```

**Props:**
- `projectName: string` - Nome do projeto
- `address: string` - Endereço do projeto
- `date: string` - Data de geração
- `sections: ReportSection[]` - Seções do relatório
- `recommendations?: string[]` - Recomendações técnicas
- `warnings?: string[]` - Avisos importantes
- `notes?: string[]` - Notas técnicas e legais
- `onDownload?: () => void` - Callback de download
- `onShare?: () => void` - Callback de compartilhamento

**Interface ReportSection:**
```typescript
interface ReportSection {
  title: string
  icon: PhosphorIcon
  data: {
    label: string
    value: string | number
    unit?: string
    highlight?: boolean
  }[]
}
```

---

### 7. **LocationPicker** 📍
Seletor de localização com múltiplas opções de entrada.

**Funcionalidades:**
- Busca por endereço/CEP
- Entrada manual de coordenadas
- Geolocalização do navegador
- Geocodificação via OpenStreetMap
- Validação de coordenadas

**Uso:**
```tsx
import { LocationPicker } from '@/components/integration'

<LocationPicker
  onLocationSelect={(location) => {
    console.log("Localização selecionada:", location)
    setProjectLocation(location)
    // Prosseguir para análise de irradiação
  }}
/>
```

**Props:**
- `onLocationSelect: (location) => void` - Callback com dados da localização

**Interface Location:**
```typescript
interface Location {
  address: string
  latitude: number
  longitude: number
  city?: string
  state?: string
  country?: string
}
```

**Métodos de Seleção:**
1. **Busca por endereço**: Geocodificação via Nominatim (OSM)
2. **Coordenadas manuais**: Validação de lat/lon
3. **Localização atual**: Geolocalização do navegador

---

## 🔗 Integração com APIs

### Recursos Necessários (.env.local)

```bash
# Mapas e Terreno
VITE_MAPTILER_API_KEY=your_key_here

# Earth Observation
VITE_SENTINEL_HUB_INSTANCE_ID=your_id
VITE_SENTINEL_HUB_CLIENT_ID=your_client_id
VITE_SENTINEL_HUB_CLIENT_SECRET=your_secret

# Solar Analysis
VITE_NREL_SAM_API_KEY=your_key

# Autenticação
VITE_GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_secret (backend only)

# Pagamentos
VITE_ASAAS_TOKEN=your_token (backend proxy)
VITE_STRIPE_SECRET_KEY=your_key (backend only)

# Analytics
VITE_CLARITY_TOKEN=your_token

# Feature Flags
VITE_HYPERTUNE_TOKEN=your_token
```

---

## 🎨 Estilo e Temas

Todos os componentes seguem o design system do Yello Solar Hub:

- **Cores**: Gradient solar (amarelo → vermelho → rosa)
- **Tipografia**: Inter (sans), PT Serif (serif), Roboto Mono (mono)
- **Animações**: Framer Motion (respeitando `prefers-reduced-motion`)
- **Ícones**: Phosphor Icons (bold weight)
- **Espaçamento**: Sistema de spacing do Tailwind
- **Border Radius**: `--radius` (0.5rem)

---

## 🚀 Próximos Passos

### Sprint 1-2: Earth Observation (semanas 1-4)
- [ ] Integrar Sentinel Hub API no MapViewer
- [ ] Adicionar camadas NDVI e MOISTURE
- [ ] Implementar cache de imagens com Redis

### Sprint 3: Dimensionamento (semanas 5-6)
- [ ] Integrar NREL SAM API no ScenarioComparison
- [ ] Adicionar cálculos de irradiação por localização
- [ ] Implementar workflow completo de dimensionamento

### Sprint 4: Autenticação (semanas 7-8)
- [ ] Implementar Facebook OAuth
- [ ] Proteger rotas por plano
- [ ] Integrar PlanSelector com sistema de pagamentos

### Sprint 5: Relatórios (semanas 9-10)
- [ ] Implementar geração de PDF no AnalysisReport
- [ ] Adicionar templates de relatórios personalizados
- [ ] Implementar compartilhamento por link

---

## 📚 Exemplos de Uso Completo

### Workflow de Dimensionamento End-to-End

```tsx
import {
  WorkflowStepper,
  LocationPicker,
  ScenarioComparison,
  AnalysisReport,
  generateDemoScenarios
} from '@/components/integration'

export function DimensioningWorkflow() {
  const [currentStep, setCurrentStep] = useState(0)
  const [projectData, setProjectData] = useState({
    location: null,
    consumption: 0,
    phase: '',
  })

  const steps = [
    {
      id: 'location',
      title: 'Localização',
      description: 'Onde será instalado o sistema?',
      content: (
        <LocationPicker
          onLocationSelect={(location) => {
            setProjectData(prev => ({ ...prev, location }))
          }}
        />
      ),
      validation: () => projectData.location !== null,
    },
    {
      id: 'consumption',
      title: 'Consumo de Energia',
      description: 'Qual o consumo mensal médio?',
      content: (
        <Input
          type="number"
          value={projectData.consumption}
          onChange={(e) => setProjectData(prev => ({
            ...prev,
            consumption: Number(e.target.value)
          }))}
        />
      ),
      validation: () => projectData.consumption > 0,
    },
    {
      id: 'scenarios',
      title: 'Cenários',
      description: 'Escolha o melhor cenário para você',
      content: (
        <ScenarioComparison
          scenarios={generateDemoScenarios(projectData.consumption)}
          onSelectScenario={(id) => console.log(id)}
        />
      ),
    },
    {
      id: 'report',
      title: 'Relatório',
      description: 'Análise completa do seu projeto',
      content: <AnalysisReport {...generateDemoReport()} />,
    },
  ]

  return (
    <WorkflowStepper
      steps={steps}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      onComplete={() => {
        toast.success("Projeto criado com sucesso!")
        navigate('/projects')
      }}
    />
  )
}
```

---

## 🐛 Debug e Troubleshooting

### MapViewer não carrega
- Verifique se `VITE_MAPTILER_API_KEY` está configurado
- Certifique-se de que MapLibre GL está carregado no `index.html`
- Verifique o console para erros de CORS

### ImageUpload não aceita arquivos
- Verifique o prop `accept` (padrão: "image/*")
- Verifique o `maxSizeMB` (padrão: 10MB)
- Certifique-se de que o callback `onUpload` é async

### ScenarioComparison com valores incorretos
- Verifique os parâmetros de `generateDemoScenarios()`
- Irradiação deve estar entre 3.5 e 6.5 kWh/m²/dia
- Performance Ratio entre 0.70 e 0.85

---

## 📄 Licença

Este código faz parte do Yello Solar Hub e está licenciado sob os termos definidos no projeto principal.

---

**Última atualização:** 2025-01-22
**Versão:** 1.0.0
**Autor:** Yello Solar Hub Engineering Team
