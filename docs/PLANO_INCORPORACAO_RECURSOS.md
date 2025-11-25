# 🚀 Plano Avançado de Incorporação de Recursos - Yello Solar Hub

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Mapeamento de Recursos vs. Features](#mapeamento-de-recursos-vs-features)
3. [Arquitetura de Integração](#arquitetura-de-integração)
4. [Roadmap de Implementação](#roadmap-de-implementação)
5. [Guias Técnicos por Recurso](#guias-técnicos-por-recurso)
6. [Segurança e Compliance](#segurança-e-compliance)

---

## 🎯 Visão Geral

Este documento mapeia todos os recursos disponíveis no `.env.local` para features específicas do Yello Solar Hub, priorizando implementação por valor de negócio e complexidade técnica.

### Stack Atual

- **Frontend**: GitHub Spark + React 19 + TypeScript + Vite
- **UI**: Tailwind CSS v4 + Radix UI + Framer Motion
- **Estado**: GitHub Spark KV (persistente)
- **LLM**: OpenAI GPT-4o (Hélio - Copiloto Solar)

### Recursos Críticos Já Integrados ✅

- ✅ OpenAI GPT-4o (chat e análise solar)
- ✅ GitHub Spark KV (gerenciamento de estado)
- ✅ Radix UI + Framer Motion (interface animada)
- ✅ Sistema de widgets interativos
- ✅ Prompt Library e Search Dialog

---

## 🗺️ Mapeamento de Recursos vs. Features

### **PRIORIDADE 1: MVP SOLAR (4-6 semanas)**

#### 1.1 🌍 Earth Observation & Análise de Terreno

**Recursos Necessários:**

- ✅ `VITE_SENTINEL_HUB_*` - Imagens de satélite Sentinel-2
- ✅ `VITE_MAPTILER_API_KEY` - Mapas 3D com terreno
- ✅ `VITE_CESIUM_ION_TOKEN` - Renderização 3D
- ✅ `VITE_AWS_*` - Acesso ao Brazil Data Cube (BDC)

**Features Implementadas:**

| Feature | Status | Arquivo | Descrição |
|---------|--------|---------|-----------|
| **EarthObservationPage** | ✅ Implementado | `src/components/pages/EarthObservationPage.tsx` | Análise temporal com Sentinel-2 |
| **ShadingAnalysisPage** | ✅ Implementado | `src/components/pages/ShadingAnalysisPage.tsx` | Análise 3D de sombreamento |
| **TemporalAnalysisPage** | ✅ Implementado | `src/components/pages/TemporalAnalysisPage.tsx` | Série temporal NDVI |

**Próximos Passos:**

```typescript
// 1. Integrar Sentinel Hub API
// src/lib/earth-observation/sentinel-hub.ts
import { SentinelHubAPI } from '@sentinelhub/sentinelhub-js';

const config = {
  instanceId: import.meta.env.VITE_SENTINEL_HUB_INSTANCE_ID,
  clientId: import.meta.env.VITE_SENTINEL_HUB_CLIENT_ID,
  clientSecret: import.meta.env.VITE_SENTINEL_HUB_CLIENT_SECRET,
};

export async function getSentinel2Image(
  bbox: [number, number, number, number],
  date: string,
  layer: 'TRUE_COLOR' | 'NDVI' | 'MOISTURE'
) {
  // Implementação
}

// 2. Integrar BDC STAC API
// src/lib/earth-observation/bdc-stac.ts (já existe parcialmente)
export async function queryBDCCatalog(
  collection: 'CBERS-4' | 'AMAZONIA-1' | 'SENTINEL-2',
  bbox: [number, number, number, number],
  dateRange: [string, string]
) {
  // Expandir implementação existente
}

// 3. Adicionar cache com Redis
// src/lib/earth-observation/cache.ts
import { KV } from '@vercel/kv';

export async function getCachedImagery(key: string) {
  return await KV.get(`imagery:${key}`);
}
```

**Entregável:**

- [ ] Busca de imagens Sentinel-2 por CEP/coordenadas
- [ ] Visualização de NDVI para análise de vegetação
- [ ] Cache de imagens no Redis (3 dias TTL)
- [ ] Download de GeoTIFF para análise offline

---

#### 1.2 ☀️ Dimensionamento Solar com NREL SAM

**Recursos Necessários:**

- ✅ `VITE_NREL_SAM_API_KEY` - System Advisor Model

**Features Existentes:**

| Feature | Status | Arquivo | Descrição |
|---------|--------|---------|-----------|
| **SizingPage** | ✅ Implementado | `src/components/pages/SizingPage.tsx` | Dimensionamento básico |
| **Solar Widgets** | ✅ Implementado | `src/components/widgets/*` | Widgets de análise solar |

**Implementação Detalhada:**

```typescript
// src/lib/solar/nrel-sam.ts
interface SolarSystemInput {
  latitude: number;
  longitude: number;
  monthlyConsumption: number; // kWh/mês
  electricalPhase: 'monofasico' | 'bifasico' | 'trifasico';
  roofOrientation: number; // azimuth 0-360
  roofTilt: number; // 0-90 graus
  performanceRatio: number; // 0.75-0.85
}

interface SizingScenario {
  name: 'Conservador' | 'Equilibrado' | 'Otimizado';
  multiplier: 1.14 | 1.30 | 1.45;
  coverage: string; // "85-90%" | "95-100%" | "100%+"
  systemSize: number; // kWp
  panelCount: number;
  estimatedGeneration: number; // kWh/mês
  investmentRange: [number, number]; // [min, max] em R$
  payback: number; // anos
  roi25Years: number; // %
}

export async function calculateSolarSystem(
  input: SolarSystemInput
): Promise<SizingScenario[]> {
  // 1. Obter irradiação solar via NREL API
  const irradiation = await getNRELIrradiation(
    input.latitude,
    input.longitude
  );
  
  // 2. Calcular 3 cenários
  const scenarios: SizingScenario[] = [
    calculateScenario('Conservador', 1.14, input, irradiation),
    calculateScenario('Equilibrado', 1.30, input, irradiation),
    calculateScenario('Otimizado', 1.45, input, irradiation),
  ];
  
  return scenarios;
}

// 3. Integração com Hélio (GPT-4o)
// Adicionar ao system prompt do App.tsx:
const helioSystemPrompt = `
...contexto existente...

## CÁLCULOS DE DIMENSIONAMENTO

Ao dimensionar um sistema solar, use os seguintes multiplicadores:

**Cenário Conservador (1.14x):**
- Cobertura: 85-90% do consumo
- Ideal para: Clientes com restrições orçamentárias
- Cálculo: systemSize = (consumoMensal * 1.14) / (irradiação * PR * 30)

**Cenário Equilibrado (1.30x) ⭐ RECOMENDADO:**
- Cobertura: 95-100% + margem de segurança
- Ideal para: Maioria dos clientes
- Cálculo: systemSize = (consumoMensal * 1.30) / (irradiação * PR * 30)

**Cenário Otimizado (1.45x):**
- Cobertura: 100% + excedente para créditos
- Ideal para: Clientes com espaço e orçamento
- Cálculo: systemSize = (consumoMensal * 1.45) / (irradiação * PR * 30)

Use o NREL SAM API para obter irradiação precisa da localização.
`;
```

**Entregável:**

- [ ] Integração completa com NREL SAM API
- [ ] Widget interativo de dimensionamento (3 cenários)
- [ ] Cálculo automático de payback e ROI
- [ ] Exportação de relatório técnico em PDF

---

#### 1.3 🗺️ Mapas 3D e Análise de Sombreamento

**Recursos Necessários:**

- ✅ `VITE_MAPTILER_API_KEY` - Mapas base e terreno
- ✅ `VITE_CESIUM_ION_TOKEN` - Renderização 3D
- ✅ `VITE_OPENROUTE_API_KEY` - Geocodificação

**Implementação MapLibre GL:**

```typescript
// src/lib/maps/maplibre-config.ts
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export function createSolarMap(
  container: string,
  center: [number, number],
  zoom: number = 18
): maplibregl.Map {
  const map = new maplibregl.Map({
    container,
    style: `https://api.maptiler.com/maps/hybrid/style.json?key=${import.meta.env.VITE_MAPTILER_API_KEY}`,
    center,
    zoom,
    pitch: 60, // 3D view
    bearing: 0,
    antialias: true,
    terrain: {
      source: 'maptiler-terrain',
      exaggeration: 1.5,
    },
  });

  // Adicionar camada de terreno 3D
  map.on('load', () => {
    map.addSource('maptiler-terrain', {
      type: 'raster-dem',
      url: `https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=${import.meta.env.VITE_MAPTILER_API_KEY}`,
      tileSize: 256,
    });

    map.setTerrain({
      source: 'maptiler-terrain',
      exaggeration: 1.5,
    });

    // Adicionar camada de sombreamento (hillshade)
    map.addLayer({
      id: 'hillshade',
      type: 'hillshade',
      source: 'maptiler-terrain',
      layout: { visibility: 'visible' },
      paint: {
        'hillshade-exaggeration': 0.5,
        'hillshade-shadow-color': '#000000',
      },
    });
  });

  return map;
}

// src/lib/maps/shading-analysis.ts
export interface ShadingResult {
  annualShading: number; // %
  monthlyShading: number[]; // % por mês
  horizonProfile: { azimuth: number; elevation: number }[]; // 360 pontos
  buildingObstructions: {
    id: string;
    height: number;
    distance: number;
    azimuth: number;
    impactFactor: number;
  }[];
  terrainMetrics: {
    elevation: number;
    slope: number;
    aspect: number; // orientação do terreno
    solarFactor: number; // 0-1
  };
  recommendations: string[];
}

export async function analyzeShadingAtLocation(
  lat: number,
  lon: number,
  roofPolygon?: [number, number][]
): Promise<ShadingResult> {
  // 1. Obter DEM (Digital Elevation Model) do terreno
  const dem = await getDEMData(lat, lon);
  
  // 2. Detectar edifícios próximos via OSM
  const buildings = await getNearbyBuildings(lat, lon, 100); // 100m radius
  
  // 3. Calcular perfil do horizonte (360°)
  const horizonProfile = calculateHorizonProfile(dem, lat, lon);
  
  // 4. Calcular sombreamento mensal
  const monthlyShading = calculateMonthlyShading(
    lat,
    lon,
    horizonProfile,
    buildings
  );
  
  // 5. Gerar recomendações
  const recommendations = generateRecommendations(monthlyShading);
  
  return {
    annualShading: monthlyShading.reduce((a, b) => a + b) / 12,
    monthlyShading,
    horizonProfile,
    buildingObstructions: buildings,
    terrainMetrics: dem,
    recommendations,
  };
}
```

**Entregável:**

- [ ] Mapa 3D interativo com controles de câmera
- [ ] Desenho de polígono do telhado
- [ ] Análise automática de sombreamento (terreno + edifícios)
- [ ] Visualização do perfil do horizonte 360°
- [ ] Recomendações baseadas em % de sombreamento

---

### **PRIORIDADE 2: AUTENTICAÇÃO E PAGAMENTOS (2-3 semanas)**

#### 2.1 🔐 Sistema de Autenticação

**Recursos Necessários:**

- ✅ `VITE_FACEBOOK_APP_ID` (frontend)
- ✅ `FACEBOOK_APP_ID` + `FACEBOOK_APP_SECRET` (backend/server)
- ✅ `VITE_AUTH_SERVICE_URL` (ex.: `http://localhost:8787` apontando para o servidor Node)
- 🔄 (planejado) `NEXTAUTH_SECRET` e `ENCRYPTION_KEY` para tokens persistentes/criptografia em fases futuras

**Implementação (estado atual – Sprint 4):**

1. **Redirecionamento OAuth (frontend)**

```typescript
// src/lib/auth/facebook-oauth.ts
export function loginWithFacebook(redirectUri?: string) {
  const appId = import.meta.env.VITE_FACEBOOK_APP_ID
  if (!appId) throw new Error("VITE_FACEBOOK_APP_ID não configurado")

  const resolvedRedirect = redirectUri ?? `${window.location.origin}/auth/callback`
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: resolvedRedirect,
    scope: "email,public_profile",
    response_type: "code",
    auth_type: "rerequest",
  })

  window.location.href = `https://www.facebook.com/v19.0/dialog/oauth?${params}`
}
```

2. **Troca do `code` pelo perfil (API frontend → backend)**

```typescript
// src/lib/api/facebook-auth.ts
export async function exchangeFacebookCode(code: string, redirectUri: string) {
  const endpoint = `${(import.meta.env.VITE_AUTH_SERVICE_URL || "").replace(/\/$/, "")}/api/auth/facebook/callback`

  const response = await fetch(endpoint || "/api/auth/facebook/callback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ code, redirectUri }),
  })

  if (!response.ok) {
    throw new Error(await response.text() || `Falha ao validar código (${response.status})`)
  }

  return (await response.json()).user
}
```

3. **Callback seguro (`server/facebook-auth-server.js`)**

```javascript
createServer(async (req, res) => {
  if (req.method === "POST" && req.url === "/api/auth/facebook/callback") {
    const { code, redirectUri } = await parseRequestBody(req)
    const tokenPayload = await exchangeCodeForToken(code, redirectUri)
    const profile = await fetchFacebookProfile(tokenPayload.access_token)

    const user = {
      id: profile.id,
      email: profile.email ?? `${profile.id}@facebook.com`,
      name: profile.name ?? "Usuário Facebook",
      avatarUrl: profile.picture?.data?.url,
      createdAt: Date.now(),
      session: {
        accessToken: tokenPayload.access_token,
        expiresAt: Date.now() + (tokenPayload.expires_in ?? 3600) * 1000,
        plan: "free",
      },
    }

    sendJson(res, 200, { user, sessionToken: randomUUID() })
  }
}).listen(process.env.PORT || 8787)
```

4. **Hook compartilhado (`src/hooks/use-auth.ts`)**

```typescript
export function useAuth() {
  const [authUser, setAuthUser] = useKV<AuthUser | null>("current-auth-user", null)

  const loginWithFacebook = useCallback((redirectUri?: string) => {
    startFacebookOAuth(redirectUri)
  }, [])

  useEffect(() => {
    if (!authUser) return
    if (!authUser.session) {
      setAuthUser(ensureAuthUserSession(authUser))
      return
    }
    if (authUser.session.expiresAt <= Date.now()) setAuthUser(null)
  }, [authUser, setAuthUser])

  return { user: authUser, setUser: setAuthUser, loginWithFacebook }
}
```

**Fluxo local (passo a passo):**

1. Configure as variáveis no `.env.local` e no ambiente do servidor Node:

  ```bash
  # Frontend (Vite)
  VITE_FACEBOOK_APP_ID=1234567890
  VITE_AUTH_SERVICE_URL=http://localhost:8787

  # Servidor facebook-auth-server.js
  FACEBOOK_APP_ID=1234567890
  FACEBOOK_APP_SECRET=seu-secret
  PORT=8787
  ```

2. Inicie o servidor seguro (mantém o secret fora do bundle):

  ```bash
  node server/facebook-auth-server.js
  ```

3. Suba o frontend normalmente (`npm run dev`). Ao concluir o OAuth, o App roda o efeito de `/auth/callback`, troca o `code` via `exchangeFacebookCode` e salva o usuário em `useKV`.

4. Execute `npm run test` sempre que alterar o fluxo. As suítes `src/hooks/__tests__/use-auth.test.ts` e `src/lib/api/__tests__/facebook-auth.test.ts` garantem a regressão mínima do hook e da chamada ao backend.

**Features:**

- ✅ Login via Facebook OAuth (`/auth/callback` + Vitest)
- ✅ Persistência de sessão com Spark KV (hook `useAuth` + `ensureAuthUserSession`)
- [ ] Página de perfil do usuário
- [ ] Proteção de rotas premium

---

#### 2.2 💳 Sistema de Pagamentos e Checkout

**Recursos Necessários:**

- ✅ `VITE_ASAAS_TOKEN` - Pagamentos no Brasil
- ✅ `VITE_STRIPE_SECRET_KEY` - Pagamentos internacionais
- ✅ `VITE_CIELO_MERCHANT_ID` - Cartão de crédito

**Arquitetura de Planos:**

```typescript
// src/lib/payments/plans.ts
export interface Plan {
  id: 'free' | 'pro' | 'enterprise';
  name: string;
  price: number; // R$/mês
  features: {
    maxProjects: number;
    maxAnalyses: number;
    sentinelAccess: boolean;
    technicalSupport: boolean;
    whiteLabel: boolean;
  };
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Grátis',
    price: 0,
    features: {
      maxProjects: 3,
      maxAnalyses: 10,
      sentinelAccess: false,
      technicalSupport: false,
      whiteLabel: false,
    },
  },
  {
    id: 'pro',
    name: 'Profissional',
    price: 97,
    features: {
      maxProjects: 50,
      maxAnalyses: 500,
      sentinelAccess: true,
      technicalSupport: true,
      whiteLabel: false,
    },
  },
  {
    id: 'enterprise',
    name: 'Empresarial',
    price: 297,
    features: {
      maxProjects: -1, // ilimitado
      maxAnalyses: -1,
      sentinelAccess: true,
      technicalSupport: true,
      whiteLabel: true,
    },
  },
];

// src/lib/payments/asaas.ts
export async function createAsaasPayment(
  userId: string,
  planId: string,
  customerEmail: string
) {
  const response = await fetch('https://sandbox.asaas.com/api/v3/payments', {
    method: 'POST',
    headers: {
      'access_token': import.meta.env.VITE_ASAAS_TOKEN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      customer: customerEmail,
      billingType: 'CREDIT_CARD',
      value: PLANS.find(p => p.id === planId)?.price,
      dueDate: new Date().toISOString().split('T')[0],
    }),
  });
  
  return response.json();
}
```

**CheckoutPage Enhancement:**

```typescript
// src/components/pages/CheckoutPage.tsx - Adicionar
import { PLANS } from '@/lib/payments/plans';
import { createAsaasPayment } from '@/lib/payments/asaas';

export function CheckoutPage({ onToggleSidebar }: PageProps) {
  const [selectedPlan, setSelectedPlan] = useState<Plan>(PLANS[1]); // Pro
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'pix' | 'boleto'>('credit_card');
  
  const handlePayment = async () => {
    const payment = await createAsaasPayment(
      user.id,
      selectedPlan.id,
      user.email
    );
    
    if (payment.status === 'CONFIRMED') {
      toast.success('Pagamento confirmado! Seu plano foi ativado.');
      // Atualizar plano do usuário no KV
    }
  };
  
  return (
    <div>
      {/* Exibir cards dos planos */}
      {/* Formulário de pagamento */}
      {/* Integração com Asaas/Stripe */}
    </div>
  );
}
```

**Entregável:**

- [ ] Página de checkout com 3 planos
- [ ] Integração Asaas (PIX, boleto, cartão)
- [ ] Verificação de limites por plano
- [ ] Dashboard de assinatura

---

### **PRIORIDADE 3: DATABASE E PERSISTÊNCIA (1-2 semanas)**

#### 3.1 🗄️ Migração para Neon Postgres

**Recursos Necessários:**

- ✅ `VITE_DATABASE_URL` - Neon Postgres

**Schema Prisma:**

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  cpf       String?  @unique
  phone     String?
  plan      String   @default("free") // 'free' | 'pro' | 'enterprise'
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  projects  Project[]
  analyses  SolarAnalysis[]
}

model Project {
  id          String   @id @default(cuid())
  userId      String
  name        String
  address     String
  latitude    Float
  longitude   Float
  roofArea    Float? // m²
  roofTilt    Float? // graus
  roofAzimuth Float? // 0-360
  status      String   @default("draft") // 'draft' | 'analyzing' | 'completed'
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  user        User              @relation(fields: [userId], references: [id])
  analyses    SolarAnalysis[]
  equipment   EquipmentList[]
}

model SolarAnalysis {
  id                 String   @id @default(cuid())
  projectId          String
  userId             String
  analysisType       String // 'sizing' | 'shading' | 'temporal'
  
  // Sizing data
  systemSize         Float? // kWp
  panelCount         Int?
  estimatedGeneration Float? // kWh/mês
  investment         Float? // R$
  payback            Float? // anos
  roi25Years         Float? // %
  
  // Shading data
  annualShading      Float? // %
  horizonProfile     Json? // array de {azimuth, elevation}
  
  // Temporal data
  ndviTimeSeries     Json? // array de {date, ndvi}
  
  createdAt          DateTime @default(now())
  
  project            Project  @relation(fields: [projectId], references: [id])
  user               User     @relation(fields: [userId], references: [id])
}

model Equipment {
  id           String  @id @default(cuid())
  type         String // 'panel' | 'inverter' | 'structure'
  manufacturer String
  model        String
  power        Float? // W (para painéis) ou kW (para inversores)
  efficiency   Float? // %
  price        Float? // R$
  datasheet    String? // URL para ficha técnica
  
  lists        EquipmentList[]
}

model EquipmentList {
  id         String  @id @default(cuid())
  projectId  String
  equipmentId String
  quantity   Int
  
  project    Project   @relation(fields: [projectId], references: [id])
  equipment  Equipment @relation(fields: [equipmentId], references: [id])
}
```

**Migração de Dados:**

```typescript
// src/lib/database/migrate-kv-to-postgres.ts
import { PrismaClient } from '@prisma/client';
import { useKV } from '@github/spark/hooks';

const prisma = new PrismaClient();

export async function migrateProjectsToPostgres() {
  const [kvProjects] = useKV<any[]>('solar-projects', []);
  
  for (const project of kvProjects) {
    await prisma.project.create({
      data: {
        id: project.id,
        userId: project.userId,
        name: project.name,
        address: project.address,
        latitude: project.location.lat,
        longitude: project.location.lon,
        status: 'completed',
      },
    });
  }
  
  console.log(`Migrados ${kvProjects.length} projetos`);
}
```

**Entregável:**

- [ ] Schema Prisma completo
- [ ] Migração de dados do Spark KV
- [ ] CRUD de projetos e análises
- [ ] Relacionamento usuário ↔ projetos ↔ análises

---

### **PRIORIDADE 4: ADVANCED AI FEATURES (3-4 semanas)**

#### 4.1 🎙️ Realtime Voice (Conversas por Voz com Hélio)

**Recursos Necessários:**

- ✅ `VITE_OPENAI_API_KEY`
- ✅ `VITE_OPENAI_REALTIME_ENABLED=true`

**Implementação Existente:**

```typescript
// src/components/pages/RealtimeVoicePage.tsx (já existe)
// Melhorias sugeridas:

// 1. Adicionar transcrição em tempo real
// 2. Integrar com contexto solar (enviar dados do projeto atual)
// 3. Permitir comandos de voz:
//    - "Analise o sombreamento deste endereço"
//    - "Calcule o dimensionamento para 500 kWh/mês"
//    - "Mostre equipamentos recomendados"

// src/lib/openai/realtime-voice.ts
export function startRealtimeVoiceSession(projectContext?: Project) {
  const ws = new WebSocket('wss://api.openai.com/v1/realtime', {
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      'OpenAI-Beta': 'realtime=v1',
    },
  });

  ws.on('open', () => {
    // Enviar contexto do projeto
    if (projectContext) {
      ws.send(JSON.stringify({
        type: 'session.update',
        session: {
          instructions: `
            Você é o Hélio, assistente solar.
            Contexto do projeto atual:
            - Endereço: ${projectContext.address}
            - Consumo: ${projectContext.monthlyConsumption} kWh/mês
            - Fase: ${projectContext.electricalPhase}
          `,
        },
      }));
    }
  });

  return ws;
}
```

**Entregável:**

- [ ] Conversas por voz fluidas com Hélio
- [ ] Transcrição em tempo real
- [ ] Comandos de voz para ações (dimensionar, analisar, etc.)
- [ ] Histórico de conversas de voz

---

#### 4.2 🖼️ Análise de Imagens com Gemini/GPT-4V

**Recursos Necessários:**

- ✅ `VITE_GEMINI_API_KEY`
- ✅ `VITE_NVIDIA_API_KEY`

**Use Cases:**

1. **Upload de foto do telhado** → Detectar área útil, orientação, obstruções
2. **Upload de conta de luz** → Extrair consumo e tarifas automaticamente
3. **Análise de drone/satélite** → Identificar sombreamento de árvores

```typescript
// src/lib/ai/image-analysis.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function analyzeRoofImage(imageBase64: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-vision' });
  
  const prompt = `
    Analise esta imagem de telhado e forneça:
    1. Tipo de telhado (cerâmica, fibrocimento, metálico, laje)
    2. Orientação estimada (Norte, Sul, Leste, Oeste)
    3. Área útil aproximada (m²)
    4. Presença de obstruções (chaminés, caixas d'água, antenas)
    5. Estado de conservação
    6. Recomendação para instalação solar (viável/não viável)
    
    Formato de resposta JSON.
  `;
  
  const result = await model.generateContent([prompt, imageBase64]);
  return JSON.parse(result.response.text());
}

export async function extractElectricBillData(imageBase64: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-vision' });
  
  const prompt = `
    Extraia os seguintes dados desta conta de luz:
    - Consumo mensal (kWh)
    - Tarifa de energia (R$/kWh)
    - Tarifa de disponibilidade
    - Taxa de iluminação pública
    - Fase elétrica (monofásico/bifásico/trifásico)
    
    Formato JSON.
  `;
  
  const result = await model.generateContent([prompt, imageBase64]);
  return JSON.parse(result.response.text());
}
```

**Widget de Upload de Imagem:**

```typescript
// src/components/widgets/ImageUploadWidget.tsx
export function ImageUploadWidget() {
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const handleUpload = async (file: File) => {
    const base64 = await fileToBase64(file);
    setImage(base64);
    
    setIsAnalyzing(true);
    const result = await analyzeRoofImage(base64);
    setAnalysis(result);
    setIsAnalyzing(false);
  };
  
  return (
    <Card>
      <input type="file" accept="image/*" onChange={handleUpload} />
      {isAnalyzing && <TypingIndicator text="Analisando imagem..." />}
      {analysis && (
        <div>
          <h3>Análise do Telhado</h3>
          <ul>
            <li>Tipo: {analysis.roofType}</li>
            <li>Área útil: {analysis.usableArea} m²</li>
            <li>Orientação: {analysis.orientation}</li>
            <li>Viabilidade: {analysis.feasibility}</li>
          </ul>
        </div>
      )}
    </Card>
  );
}
```

**Entregável:**

- [ ] Upload e análise de fotos de telhado
- [ ] Extração automática de dados da conta de luz
- [ ] Widget de análise de imagens no chat
- [ ] Armazenamento de imagens no Vercel Blob

---

#### 4.3 📊 ChatKit Enhanced (Multi-turn Solar Workflows)

**Recursos Necessários:**

- ✅ `VITE_OPENAI_CHATKIT_ENABLED=true`

**Workflows Guiados:**

```typescript
// src/lib/chatkit/solar-workflows.ts
export interface SolarWorkflow {
  id: 'dimensioning' | 'financing' | 'regulatory';
  steps: WorkflowStep[];
  currentStep: number;
  context: Record<string, any>;
}

export interface WorkflowStep {
  id: string;
  question: string;
  type: 'text' | 'number' | 'select' | 'location';
  validation?: (value: any) => boolean;
  options?: string[];
}

export const DIMENSIONING_WORKFLOW: WorkflowStep[] = [
  {
    id: 'address',
    question: 'Qual o endereço da instalação? (CEP ou endereço completo)',
    type: 'location',
  },
  {
    id: 'consumption',
    question: 'Qual o consumo mensal de energia em kWh?',
    type: 'number',
    validation: (v) => v > 0 && v < 100000,
  },
  {
    id: 'phase',
    question: 'Qual a fase elétrica da instalação?',
    type: 'select',
    options: ['Monofásico', 'Bifásico', 'Trifásico'],
  },
  {
    id: 'roof_type',
    question: 'Qual o tipo de telhado?',
    type: 'select',
    options: ['Cerâmica', 'Fibrocimento', 'Metálico', 'Laje', 'Solo'],
  },
  {
    id: 'budget',
    question: 'Qual o orçamento disponível? (opcional)',
    type: 'number',
  },
];

// Integrar com ChatKit
export function startWorkflow(workflowId: string): SolarWorkflow {
  const workflows = {
    dimensioning: DIMENSIONING_WORKFLOW,
    // ... outros workflows
  };
  
  return {
    id: workflowId,
    steps: workflows[workflowId],
    currentStep: 0,
    context: {},
  };
}
```

**Entregável:**

- [ ] Workflows guiados (dimensionamento, financiamento, regulatório)
- [ ] Progress tracking visual
- [ ] Salvar progresso parcial
- [ ] Gerar relatório final com todos os dados

---

### **PRIORIDADE 5: ANALYTICS E MONITORING (1 semana)**

#### 5.1 📈 Microsoft Clarity

**Recursos Necessários:**

- ✅ `VITE_CLARITY_TOKEN`

**Implementação:**

```typescript
// src/lib/analytics/clarity.ts
export function initClarity() {
  if (import.meta.env.VITE_CLARITY_TOKEN) {
    const script = document.createElement('script');
    script.innerHTML = `
      (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "${import.meta.env.VITE_CLARITY_TOKEN}");
    `;
    document.head.appendChild(script);
  }
}

// src/main.tsx
import { initClarity } from '@/lib/analytics/clarity';

initClarity();
```

**Eventos Personalizados:**

```typescript
// src/lib/analytics/events.ts
export function trackSolarAnalysis(type: 'sizing' | 'shading' | 'temporal') {
  window.clarity?.('event', 'solar_analysis', { type });
}

export function trackProjectCreated(planType: string) {
  window.clarity?.('event', 'project_created', { plan: planType });
}

export function trackCheckoutStarted(planId: string) {
  window.clarity?.('event', 'checkout_started', { plan_id: planId });
}
```

**Entregável:**

- [ ] Clarity instalado e funcionando
- [ ] Eventos personalizados de negócio
- [ ] Heatmaps de interação
- [ ] Gravações de sessão de usuários

---

### **PRIORIDADE 6: FEATURE FLAGS E A/B TESTING (1 semana)**

#### 6.1 🚩 Hypertune

**Recursos Necessários:**

- ✅ `VITE_HYPERTUNE_TOKEN`

**Configuração:**

```typescript
// src/lib/feature-flags/hypertune.ts
import { createClient } from 'hypertune';

const hypertune = createClient({
  token: import.meta.env.VITE_HYPERTUNE_TOKEN,
});

export function useFeatureFlag(flagName: string): boolean {
  return hypertune.get(flagName, false);
}

// Flags sugeridas:
export const FLAGS = {
  ENABLE_VOICE_CHAT: 'enable_voice_chat',
  ENABLE_IMAGE_ANALYSIS: 'enable_image_analysis',
  ENABLE_BDC_INTEGRATION: 'enable_bdc_integration',
  SHOW_NEW_PRICING: 'show_new_pricing',
  ENABLE_WHITELABEL: 'enable_whitelabel',
};

// Uso em componentes:
export function RealtimeVoiceButton() {
  const isEnabled = useFeatureFlag(FLAGS.ENABLE_VOICE_CHAT);
  
  if (!isEnabled) return null;
  
  return <Button>Conversar por Voz</Button>;
}
```

**Entregável:**

- [ ] Configuração Hypertune
- [ ] Feature flags para features experimentais
- [ ] A/B test de pricing (R$ 97 vs R$ 117)
- [ ] Dashboard de métricas por variante

---

## 🔒 Segurança e Compliance

### Variáveis Sensíveis

Nunca expor no frontend (Vite):

- ❌ `FACEBOOK_APP_SECRET`
- ❌ `ASAAS_TOKEN`
- ❌ `STRIPE_SECRET_KEY`
- ❌ `ENCRYPTION_KEY`

**Solução:** Criar backend proxy para operações sensíveis.

### API Keys Seguras
Para produção, mover para backend:
```typescript
// backend/api/solar-analysis.ts
export async function POST(req: Request) {
  const { address, consumption } = await req.json();
  
  // API keys ficam no backend
  const nrelData = await fetch('https://developer.nrel.gov/api/solar', {
    headers: {
      'X-Api-Key': process.env.NREL_SAM_API_KEY, // Backend only
    },
  });
  
  return Response.json(nrelData);
}
```

---

## 📅 Cronograma de Implementação

| Sprint | Semanas | Entregas |
|--------|---------|----------|
| **Sprint 1** | 1-2 | Earth Observation + BDC STAC + Cache Redis |
| **Sprint 2** | 3-4 | NREL SAM Integration + 3 Scenarios Widget |
| **Sprint 3** | 5-6 | MapLibre 3D + Shading Analysis |
| **Sprint 4** | 7-8 | Facebook OAuth + Session Management |
| **Sprint 5** | 9-10 | Asaas Checkout + Pricing Page |
| **Sprint 6** | 11-12 | Postgres Migration + CRUD |
| **Sprint 7** | 13-14 | Realtime Voice + Image Analysis |
| **Sprint 8** | 15-16 | ChatKit Workflows + Analytics |

---

## ✅ Checklist de Validação

### Antes de Produção:
- [ ] Todas as API keys estão no `.env.local` (nunca commitadas)
- [ ] Backend proxy implementado para keys sensíveis
- [ ] Testes E2E com Cypress
- [ ] Performance: Lighthouse score > 90
- [ ] Acessibilidade: WCAG 2.1 AA
- [ ] SEO: Meta tags e structured data
- [ ] Analytics: Clarity tracking events
- [ ] Feature flags: Rollout gradual de features
- [ ] Backup: Database backup diário
- [ ] Monitoring: Error tracking (Sentry)

---

## 🚀 Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Testes E2E
npm run cypress:open

# Lint + Icon Aria Check
npm run lint

# Migração Prisma
npx prisma migrate dev

# Seed database
npx prisma db seed
```

---

## 📚 Referências

- [GitHub Spark Docs](https://github.com/github/spark)
- [OpenAI Realtime API](https://platform.openai.com/docs/guides/realtime)
- [NREL SAM SDK](https://github.com/NREL/SAM)
- [Sentinel Hub API](https://docs.sentinel-hub.com/)
- [MapLibre GL](https://maplibre.org/maplibre-gl-js/docs/)
- [Brazil Data Cube](https://brazil-data-cube.github.io/)
- [Prisma Postgres](https://www.prisma.io/docs/getting-started)

---

**Última atualização:** 22/11/2025  
**Versão:** 1.0.0  
**Contato:** Yello Solar Hub Engineering Team
