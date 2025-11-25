# Yello Solar Hub – Guia Rápido para Agentes

## Essencial
- Plataforma React 19 com GitHub Spark (`src/App.tsx` concentra roteamento por `useKV`, prompt Hélio e despacho de widgets). Nenhum React Router; o estado de rota vive em KV.
- `vite.config.ts` deve manter `sparkPlugin()` e `createIconImportProxy()`; removê-los quebra a build.
- Persistência sempre via `useKV` (`@github/spark/hooks`); nunca usar `localStorage` ou `sessionStorage` para dados do app.
- Organização principal: `src/components` (pages/ui/widgets), `src/lib` (OpenAI, analytics, navegação), `src/hooks`, `docs/` com guias aprofundados.

## Integrações OpenAI
- Variáveis obrigatórias para recursos de IA: `VITE_OPENAI_API_KEY`, `VITE_OPENAI_CHATKIT_ENABLED`, `VITE_OPENAI_WORKFLOW_ID` (workflows). Voz adiciona flags Whisper/Realtime na `.env`.
- Gerencie sessões em `src/lib/openai/chatkit.ts` usando `createChatKitSession`/`refreshChatKitSession`; respeite o fluxo já exposto em `use-chatkit-session.ts`.
- Voz em tempo real vive em `src/components/RealtimeVoiceAgent.tsx` + `src/lib/openai/realtime.ts`; transcrição/TTS em `src/lib/openai/whisper.ts`.
- Todo prompt/resposta deve permanecer em pt-BR e seguir a cadência CEP → consumo → fase → dimensionamento → financiamento descrita no prompt “Hélio”.

## Padrões de UI
- Páginas em `src/components/pages/` aceitam `onToggleSidebar`; preserve a prop no header/botões de menu.
- Ao criar widgets, atualize o discriminador em `src/components/widgets/WidgetRenderer.tsx` e forneça exemplo em `src/components/widgets/widgetExamples.ts` para match de palavras-chave.
- Componentes com animação usam `usePrefersReducedMotion()` (`src/hooks/use-reduced-motion.ts`); anime apenas `transform`/`opacity` e inclua `style={{ willChange: 'transform' }}`. Consulte `docs/ANIMATION_GUIDELINES.md`.
- Custom lint `eslint-rules/require-icon-button-aria.js` exige `aria-label` em botões só com ícone; ícones Phosphor devem usar `weight="bold"`/`"fill"` e tamanhos especificados nas diretivas de design.

## Domínio Solar
- O prompt em `App.tsx` e `docs/SOLAR_SIZING_WIDGETS_GUIDE.md` fixam três multiplicadores de dimensionamento (1.14x conservador, 1.30x equilibrado, 1.45x otimizado) e fórmulas `payback`/`roi25Years`.
- Contexto brasileiro é obrigatório: textos em pt-BR, valores em R$ (formatação local) e menção à Lei 14.300/2022/ANEEL quando falar de regulação ou créditos de energia.
- Dados externos planejados: CAMS, NASA POWER, DEMs IBGE, footprints OSM (ver `docs/PLANO_INCORPORACAO_RECURSOS.md`). Estruture integrações mantendo fallback conforme guias.
- Sugira Geração Compartilhada quando detectar ausência de telhado adequado; mantenha terminologia do prompt (kWp, PR, MPPT etc.).

## Fluxos de Trabalho
- Scripts principais (`package.json`): `npm run dev`, `npm run build` (tsc -b + vite), `npm run lint` (roda `check:icon-aria` + ESLint), `npm run check:icon-aria`, `npm run test:e2e`/`test:e2e:open` (wrapper `scripts/run-e2e-tests.sh`).
- Cypress specs estão em `cypress/e2e/` e exigem variáveis de ambiente reais; use `cypress/EXECUTION_SUMMARY.md` para resultados anteriores.
- Use `docs/OPENAI_INTEGRATION.md` para detalhes de credenciais e fluxos ChatKit/Assistants, e `PRD.md` para requisitos funcionais antes de alterar lógica de domínio.
- Conferir `src/lib/navigation.ts`, `src/lib/router.tsx` e `src/components/ChatSidebar.tsx` ao ajustar fluxo de navegação entre chat/gallery/equipment.

## Qualidade & Revisão
- O lint falha se um ícone estiver sem `aria-label` ou se textos em inglês escaparem; mantenha cobertura manual executando `npm run lint` antes de PRs.
- Ao tocar animações ou acessibilidade, valide contra `npm run check:icon-aria` e revise `docs/ANIMATION_GUIDELINES.md`.
- Preferir testes de regressão via `npm run test:e2e` após mudanças em fluxo de chat, widgets ou integração OpenAI.
- Documente decisões relevantes em `docs/` quando expandir integrações externas ou acrescentar novos cálculos solares.
