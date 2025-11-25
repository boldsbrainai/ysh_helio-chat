# GitHub Spark Solar Energy Management System

## Architecture Overview

This is a **GitHub Spark + OpenAI ChatKit application** - an AI-powered React chat interface for a Brazilian solar energy management platform ("Yello Solar Hub"). The app provides interactive widgets for energy analysis, solar kit selection, financing calculations, and advanced AI capabilities through OpenAI services.

### Key Technologies

- **GitHub Spark Framework**: Uses `@github/spark` for LLM integration and UI components
- **OpenAI ChatKit**: Agent-powered chat with workflow integration
- **OpenAI Services**: Assistants API, Whisper (voice), TTS, Realtime API
- **React 19 + TypeScript**: Main application framework
- **Vite**: Build tool with SWC plugin for fast builds
- **Tailwind CSS v4**: Styling with Radix UI color system
- **Radix UI**: Headless component primitives
- **Framer Motion**: Animations throughout the UI

## Development Workflow

### Local Development

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # ESLint code checking
```

### Critical Build Configuration

- **Vite config requires Spark plugins**: `sparkPlugin()` and `createIconImportProxy()` are essential
- **Path aliases**: `@/` maps to `src/` directory
- **Build command**: Uses TypeScript with `--noCheck` flag for speed

## Code Patterns & Conventions

### Component Architecture

- **Pages**: Complex page components in `src/components/pages/` with `onToggleSidebar` prop
- **UI Components**: Radix-based primitives in `src/components/ui/`
- **Widget System**: Interactive chat widgets in `src/components/widgets/`

### State Management

- **GitHub Spark KV**: Use `useKV` hook for persistent state (not localStorage)

```tsx
const [sessions, setSessions] = useKV<ChatSession[]>("chat-sessions", []);
```

### Spark Integration

- **LLM Calls**: `window.spark.llm(prompt, "gpt-4o")` for AI responses
- **User Data**: `window.spark.user()` for authentication state
- **Spark Import**: Must import `@github/spark/spark` in main.tsx

### OpenAI Integration

- **ChatKit**: Embeddable agent chat with `<ChatKitEmbed />` component
- **Session Management**: Use `createChatKitSession()` from `@/lib/openai`
- **Voice Agents**: Use `<VoiceAgent />` for Whisper transcription and TTS
- **Assistants API**: Create custom assistants with tools and file uploads
- **Realtime API**: Real-time voice conversations via `RealtimeClient`
- **Configuration**: All settings in `src/lib/openai/config.ts`
- **Documentation**: See `docs/OPENAI_INTEGRATION.md` for detailed usage

### Environment Variables

Required for OpenAI features:

```bash
VITE_OPENAI_API_KEY=sk-proj-...
VITE_OPENAI_WORKFLOW_ID=wf_...
VITE_OPENAI_CHATKIT_ENABLED=true
VITE_OPENAI_WHISPER_ENABLED=true
```

### Widget System

Widget responses are triggered by keyword matching in user messages:

```tsx
const widgetMatch = Object.keys(widgetDemoMessages).find((key) =>
  lowerInput.includes(key)
);
```

New widgets require entries in both `WidgetRenderer.tsx` and `widgetExamples.ts`.

### Styling Approach

- **CSS Variables**: Extensive use of Radix color scales and custom spacing
- **Responsive**: Uses Tailwind responsive prefixes and custom breakpoints
- **Animation**: Framer Motion with consistent spring physics
- **Theme**: Automatic dark/light mode via `useTheme()` hook

### Routing

Simple route-based rendering in main App component using RouteId type. Navigation handled via `currentRoute` state and `handleNavigate()`.

### Portuguese UI

All user-facing text is in Brazilian Portuguese. Error messages, tooltips, and interface labels follow Portuguese conventions.

## Project-Specific Patterns

### Energy Domain

- Focus on solar energy analysis, equipment sizing, and financing
- Brazilian market context (R$ currency, local regulations)
- Integration points for energy bill analysis and solar kit recommendations

### Widget Data Flow

1. User input triggers keyword matching
2. AI response includes widget specification
3. Widget renders with typed data interface
4. User actions trigger callbacks to parent component

### Icon Usage

- **Phosphor Icons**: Primary icon library with `@phosphor-icons/react`
- **Weight variants**: Use `weight="bold"` or `weight="fill"` for emphasis
- **Animation**: Icons often have hover animations via Framer Motion

## Common Gotchas

1. **Spark Plugins**: Vite build fails without proper Spark plugin configuration
2. **KV Storage**: Don't use localStorage for app state - use Spark's `useKV` hook
3. **CSS Imports**: Main.tsx must import Spark CSS before custom styles
4. **Widget Types**: All widget data must match `WidgetType` enum in `WidgetRenderer.tsx`
5. **Portuguese Content**: All UI text should be in Portuguese
6. **OpenAI API Keys**: Never expose API keys in client code - use server-side endpoints in production
7. **ChatKit Sessions**: Sessions expire - implement refresh logic with `refreshChatKitSession()`
8. **Voice Permissions**: Always request microphone permissions before recording
9. **Audio Formats**: Whisper supports WebM, MP3, WAV (max 25MB)
10. **Realtime WebSocket**: Handle connection errors and reconnection logic

## File Organization

```
src/
├── components/
│   ├── pages/          # Full page components
│   ├── ui/             # Reusable UI primitives
│   ├── widgets/        # Chat widget system
│   ├── ChatKitEmbed.tsx    # OpenAI ChatKit component
│   ├── VoiceAgent.tsx      # Voice input/output component
│   └── *.tsx           # Main app components
├── hooks/              # Custom React hooks
├── lib/
│   ├── openai/        # OpenAI integration utilities
│   │   ├── config.ts      # Configuration
│   │   ├── chatkit.ts     # ChatKit sessions
│   │   ├── assistants.ts  # Assistants API
│   │   ├── whisper.ts     # Voice transcription
│   │   ├── realtime.ts    # Realtime API
│   │   └── index.ts       # Exports
│   └── utils.ts       # General utilities
└── styles/             # CSS and theme files
docs/
└── OPENAI_INTEGRATION.md  # Detailed OpenAI integration guide
```

When adding new features, follow the established patterns for widget integration, Portuguese localization, Spark framework usage, and OpenAI service integration.
