# Yello Solar Hub - AI Development Guide

A GitHub Spark + React 19 chat application for Brazilian solar energy analysis with OpenAI integration, interactive widgets, and high-fidelity solar data visualization.

## Architecture Overview

**Tech Stack:**
- GitHub Spark (LLM framework), React 19, TypeScript, Vite with SWC
- Tailwind CSS v4, Radix UI primitives, Framer Motion animations
- OpenAI ChatKit, Assistants API, Whisper/TTS, Realtime API
- MapLibre GL for 3D terrain visualization

**Critical Build Dependencies:**
```typescript
// vite.config.ts - Both plugins are REQUIRED
import sparkPlugin from "@github/spark/spark-vite-plugin";
import createIconImportProxy from "@github/spark/vitePhosphorIconProxyPlugin";
```

## Development Commands

```bash
npm run dev          # Start with HMR at localhost:5173
npm run build        # Production build (tsc -b --noCheck && vite build)
npm run lint         # ESLint + custom icon-aria checker
npm run check:icon-aria  # Validate icon buttons have aria-labels
```

## State Management Pattern

**Use GitHub Spark KV for ALL persistent state** (never localStorage):
```tsx
import { useKV } from "@github/spark/hooks";

const [sessions, setSessions] = useKV<ChatSession[]>("chat-sessions", []);
const [currentRoute, setCurrentRoute] = useKV<RouteId>("current-route", "chat");
```

**Why:** Spark KV persists across GitHub contexts and survives navigation/refresh.

## LLM Integration

**Spark LLM calls** for AI responses:
```tsx
const response = await window.spark.llm(promptText, "gpt-4o");
```

**Hélio System Prompt:** 400+ line solar engineering prompt in App.tsx with:
- 3-scenario dimensioning (1.14x/1.30x/1.45x multiplication factors)
- Technical jargon explanations (kWp, PR, MPPT, payback)
- Brazilian regulations (Lei 14.300/2022, ANEEL resolutions)
- Financing options (Banco do Brasil, Caixa, BV, FNE Sol)

**Critical:** All prompts must be in Portuguese (pt-BR). System guides integrators through CEP → consumption → phase → sizing → financing workflow.

## Component Architecture

**Page Components:** All pages in `src/components/pages/` accept `onToggleSidebar: () => void` prop:
```tsx
interface PageProps {
  onToggleSidebar: () => void;
}

export function EquipmentPage({ onToggleSidebar }: PageProps) {
  // Header burger menu must call onToggleSidebar
}
```

**Routing:** Simple state-based routing in App.tsx. No React Router:
```tsx
type RouteId = 'chat' | 'gallery' | 'equipment' | 'shading-analysis' | ...;
const [currentRoute, setCurrentRoute] = useKV<RouteId>("current-route", "chat");
```

**Widget System:** Chat widgets triggered by keyword matching:
```tsx
// App.tsx handleSend()
const widgetMatch = Object.keys(widgetDemoMessages).find(key => 
  lowerInput.includes(key)
);
```
Add new widget types to `WidgetRenderer.tsx` enum + switch, plus entry in `widgetExamples.ts`.

## Animation Guidelines

**Performance-critical:** Use `usePrefersReducedMotion()` hook everywhere:
```tsx
const prefersReducedMotion = usePrefersReducedMotion();

<motion.div
  whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
  style={{ willChange: 'transform' }}
>
```

**Rules:**
1. ONLY animate `transform` and `opacity` (compositor-only properties)
2. NEVER animate `width`, `height`, `margin`, `padding` (causes layout thrashing)
3. Pass empty object `{}` for reduced motion, not `undefined`
4. Add `style={{ willChange: 'transform' }}` for animations

**Timing:** Micro-interactions 100-150ms, state changes 200-300ms, modals 300ms spring.

See `docs/ANIMATION_GUIDELINES.md` for detailed performance patterns.

## Solar Energy Domain Logic

**Data Sources (planned integration):**
- CAMS Radiation Service (Copernicus) via `pvlib.iotools.get_cams()`
- NASA POWER API for irradiance backup
- IBGE DEMs for terrain horizon profiling
- OpenStreetMap buildings via OSMnx

**3-Tier Sizing Logic:**
```typescript
// Conservative: 1.14x multiplier (85-90% coverage)
// Balanced: 1.30x multiplier (95-100% + safety margin) ⭐ RECOMMENDED
// Optimized: 1.45x multiplier (100% + surplus credits)
const systemSize = monthlyConsumption * multiplier / (irradiation * performanceRatio * 30);
```

**Financial Calculations:**
```typescript
const payback = investmentTotal / (monthlySavings * 12);
const roi25Years = ((monthlySavings * 12 * 25) / investmentTotal) * 100;
```

**Regulatory Context:** Lei 14.300/2022 notes required. Mention GC (Geração Compartilhada) for users without roof access.

## Icon & Accessibility Patterns

**Custom ESLint Rule:** All icon-only buttons MUST have `aria-label`:
```tsx
// ✅ Good
<Button aria-label="Abrir menu">
  <List size={20} weight="bold" />
</Button>

// ❌ Bad - fails lint check
<Button><List size={20} /></Button>
```

**Phosphor Icons:** Use `weight="bold"` or `weight="fill"` for emphasis. Size guidelines: 18-20px header, 15-17px sidebar, 13px inline actions.

## OpenAI Integration

**Environment Variables Required:**
```bash
VITE_OPENAI_API_KEY=sk-proj-...
VITE_OPENAI_WORKFLOW_ID=wf_...
VITE_OPENAI_CHATKIT_ENABLED=true
```

**ChatKit Sessions:** Auto-refresh logic in `src/lib/openai/chatkit.ts`:
```tsx
import { createChatKitSession, refreshChatKitSession } from '@/lib/openai';
```

**Realtime Voice:** WebSocket-based voice conversations using GA API events (`conversation.item.added`, `response.output_audio.delta`). See `RealtimeVoicePage.tsx`.

**Security Warning:** API keys in frontend are DEV-ONLY. Production requires backend proxy.

## File Structure Conventions

```
src/
├── components/
│   ├── pages/          # Page components (all have onToggleSidebar prop)
│   ├── ui/             # Radix primitives (Button, Card, Dialog, etc.)
│   ├── widgets/        # Chat widgets (solar-specific + generic)
│   ├── ChatSidebar.tsx # Navigation with chat history
│   └── Message.tsx     # Chat message with edit/regenerate actions
├── hooks/
│   ├── use-auto-scroll.ts    # Scroll to bottom on new messages
│   ├── use-reduced-motion.ts # Accessibility hook (REQUIRED)
│   └── use-theme.ts          # Dark/light mode
├── lib/
│   ├── openai/        # ChatKit, Whisper, Realtime integrations
│   └── utils.ts       # cn() utility for class merging
└── styles/
    └── theme.css      # CSS variables, Radix color scales
```

## Common Mistakes to Avoid

1. **Don't use localStorage** - use `useKV` hook
2. **Don't forget Spark plugins** - Vite build fails without both `sparkPlugin()` and `createIconImportProxy()`
3. **Don't animate layout properties** - only `transform`/`opacity`
4. **Don't skip `aria-label` on icon buttons** - custom lint rule enforces this
5. **Don't hardcode English text** - all UI must be Portuguese
6. **Don't forget reduced motion** - use `usePrefersReducedMotion()` hook
7. **Don't add widgets without updating both files** - `WidgetRenderer.tsx` enum + `widgetExamples.ts`
8. **Don't skip `onToggleSidebar` prop** - all page components require it

## Key Files to Reference

- `src/App.tsx` - Main app structure, Hélio system prompt (400+ lines)
- `PRD.md` - Full product requirements, technical architecture, phased roadmap
- `docs/ANIMATION_GUIDELINES.md` - Performance patterns, accessibility
- `docs/OPENAI_INTEGRATION.md` - ChatKit setup, voice agents, Realtime API
- `src/components/widgets/WidgetRenderer.tsx` - Widget type definitions
- `eslint-rules/require-icon-button-aria.js` - Custom accessibility rule

## Portuguese Localization

**All user-facing text must be in Brazilian Portuguese:**
- Interface labels: "Buscar", "Compartilhar", "Configurações"
- Error messages: "Falha ao obter resposta. Tente novamente."
- Toasts: "Started new chat" → "Nova conversa iniciada"
- Button text: "New Chat" → "Novo Chat"
- Placeholders: "Message" → "Mensagem para Solar Hub..."

**Currency:** Always use R$ for Brazilian Real formatting.

**Regulations:** Reference Brazilian standards (Lei 14.300/2022, ANEEL, ABNT NBR 16690).

## Testing & Quality

**ESLint checks icon accessibility:**
```bash
npm run check:icon-aria  # Custom script validates aria-labels
```

**Cypress E2E tests** in `cypress/e2e/` for critical flows.

**Type safety:** TypeScript strict mode enabled. Use typed interfaces for widget data, chat messages, sessions.

---

When extending this codebase: follow Spark KV for state, respect reduced motion preferences, maintain Portuguese localization, add widgets to both required files, and ensure page components accept `onToggleSidebar` prop.
