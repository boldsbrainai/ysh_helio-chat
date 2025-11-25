/** @format */

import { useState, useRef, KeyboardEvent, useEffect } from "react";
import { useKV } from "@github/spark/hooks";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  PaperPlaneRight,
  Sparkle,
  List,
  Lightning,
  MagnifyingGlass,
  Share,
  Gear,
  ImageSquare,
  Code,
  Compass,
  FolderOpen,
  Sun,
} from "@phosphor-icons/react";
import { Message } from "@/components/Message";
import { TypingIndicator } from "@/components/TypingIndicator";
import { ChatSidebar } from "@/components/ChatSidebar";
import { PromptLibrary } from "@/components/PromptLibrary";
import { SearchDialog } from "@/components/SearchDialog";
import { ShareDialog } from "@/components/ShareDialog";
import { SettingsDialog } from "@/components/SettingsDialog";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import { useTheme } from "@/hooks/use-theme";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import { toast } from "sonner";
import { Widget, WidgetAction } from "@/components/widgets/WidgetRenderer";
import { widgetDemoMessages } from "@/components/widgets/widgetExamples";
import { SolarWidgetService } from "@/lib/api/solar-widget-service";
import { motion } from "framer-motion";
// Documentation
import { GalleryPage, CodexPage } from "@/components/pages/documentation";
// AI Features
import {
  ChatKitDemoPage,
  RealtimeVoicePage,
  GPTsPage,
  PromptsPage,
} from "@/components/pages/ai-features";
// Project Management
import {
  ProjectsPage,
  DashboardPage,
  PDFProposalGenerator,
} from "@/components/pages/project-management";
// Commerce
import {
  EquipmentPage,
  CheckoutPage,
  CreditAnalysisPage,
  TechnicalSheetsPage,
} from "@/components/pages/commerce";
// Solar Analysis
import {
  EarthObservationPage,
  ShadingAnalysisPage,
  TemporalAnalysisPage,
  SizingPage,
  SolarWorkflowPage,
  HomologationPage,
} from "@/components/pages/solar-analysis";
// Auth
import { LoginPage } from "@/components/pages/auth";
// Compliance
import {
  ReleaseNotesPage,
  TermsPage,
  BugReportPage,
  DownloadsPage,
  KeyboardShortcutsPage,
} from "@/components/pages/compliance";
import yelloIconJpg from "@/assets/images/yello-icon.svg";
import yelloVideoMp4 from "@/assets/video/Tipo_phototovideo__202510220124_uir1y.mp4";
import LogoVideo from "@/components/ui/LogoVideo";
import { useVideoPlayback } from "@/contexts/VideoPlaybackContext";
import { AnalyticsPanel } from "@/components/devtools/AnalyticsPanel";
import { exchangeFacebookCode } from "@/lib/api/facebook-auth";
import { AuthUser, ensureAuthUserSession, useAuth } from "@/hooks/use-auth";

export type RouteId =
  | "chat"
  | "gallery"
  | "codex"
  | "gpts"
  | "projects"
  | "prompts"
  | "equipment"
  | "sizing"
  | "homologation"
  | "credit"
  | "dashboard"
  | "earth-observation"
  | "chatkit-demo"
  | "realtime-voice"
  | "technical-sheets"
  | "release-notes"
  | "terms"
  | "bug-report"
  | "downloads"
  | "shortcuts"
  | "login"
  | "checkout"
  | "shading-analysis"
  | "temporal-analysis"
  | "solar-workflow"
  | "pdf-proposal";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  widget?: Widget;
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  timestamp: number;
}

function App() {
  useTheme();
  const prefersReducedMotion = usePrefersReducedMotion();

  const [chatSessions, setChatSessions] = useKV<ChatSession[]>(
    "chat-sessions",
    []
  );
  const [currentSessionId, setCurrentSessionId] = useKV<string | null>(
    "current-session-id",
    null
  );
  const [currentRoute, setCurrentRoute] = useKV<RouteId>(
    "current-route",
    "chat"
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPromptLibraryOpen, setIsPromptLibraryOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [user, setUser] = useState<{ login: string; isOwner: boolean } | null>(
    null
  );
  const { user: authUser, setUser: setAuthUser } = useAuth();
  const [isProcessingFacebookOAuth, setIsProcessingFacebookOAuth] = useState(
    () =>
      typeof window !== "undefined" &&
      window.location.pathname === "/auth/callback"
  );
  const { showVideo, requestReplay } = useVideoPlayback();
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const sessions = chatSessions || [];
  const currentSession = sessions.find((s) => s.id === currentSessionId);
  const chatMessages = currentSession?.messages || [];

  const scrollRef = useAutoScroll(chatMessages);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await window.spark.user();
        setUser(userData);
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    requestReplay();
  }, [requestReplay]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.pathname !== "/auth/callback") return;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const error = params.get("error") || params.get("error_description");
    const redirectUri = `${window.location.origin}${window.location.pathname}`;

    const sendToLogin = (message?: string) => {
      if (message) {
        toast.error(message);
      }
      setCurrentRoute("login");
      window.history.replaceState({}, "", "/login");
      setIsProcessingFacebookOAuth(false);
    };

    if (error) {
      sendToLogin("Login via Facebook cancelado. Tente novamente.");
      return;
    }

    if (!code) {
      sendToLogin("Código de autorização do Facebook ausente.");
      return;
    }

    const finalizeSuccess = () => {
      window.history.replaceState({}, "", "/");
      setIsProcessingFacebookOAuth(false);
    };

    const completeCallback = async () => {
      try {
        const userFromServer = await exchangeFacebookCode(code, redirectUri);
        const normalizedUser = ensureAuthUserSession(userFromServer);
        setAuthUser(normalizedUser);
        setCurrentRoute("chat");
        toast.success(
          `Bem-vindo, ${normalizedUser.name?.split(" ")[0] || "integrador"}!`
        );
        finalizeSuccess();
      } catch (callbackError) {
        console.error("Erro ao concluir login com Facebook", callbackError);
        sendToLogin("Não foi possível validar seu login com o Facebook.");
      }
    };

    completeCallback();
  }, [setAuthUser, setCurrentRoute, setIsProcessingFacebookOAuth]);

  useEffect(() => {
    if (!currentSessionId && sessions.length === 0) {
      const newSessionId = Date.now().toString();
      const newSession: ChatSession = {
        id: newSessionId,
        title: "Nova conversa",
        messages: [],
        timestamp: Date.now(),
      };
      setChatSessions([newSession]);
      setCurrentSessionId(newSessionId);
    } else if (!currentSessionId && sessions.length > 0) {
      setCurrentSessionId(sessions[0].id);
    }
  }, []);

  const updateCurrentSession = (messages: ChatMessage[]) => {
    if (!currentSessionId) return;

    setChatSessions((current) => {
      const sessions = current || [];
      const sessionIndex = sessions.findIndex((s) => s.id === currentSessionId);

      if (sessionIndex === -1) return sessions;

      const updatedSession = { ...sessions[sessionIndex], messages };

      if (messages.length > 0 && updatedSession.title === "Nova conversa") {
        const firstUserMessage = messages.find((m) => m.role === "user");
        if (firstUserMessage) {
          updatedSession.title =
            firstUserMessage.content.slice(0, 50) +
            (firstUserMessage.content.length > 50 ? "..." : "");
        }
      }

      const newSessions = [...sessions];
      newSessions[sessionIndex] = updatedSession;
      return newSessions;
    });
  };

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading || !currentSessionId) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: trimmedInput,
      timestamp: Date.now(),
    };

    const newMessages = [...chatMessages, userMessage];
    updateCurrentSession(newMessages);
    setInput("");
    setIsLoading(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    const lowerInput = trimmedInput.toLowerCase();
    const widgetMatch = Object.keys(widgetDemoMessages).find((key) =>
      lowerInput.includes(key)
    );

    try {
      const promptText = widgetMatch
        ? `Você é o Hélio, Co-Piloto Solar da Yello Solar Hub - um assistente especializado em energia solar fotovoltaica para o mercado brasileiro. O usuário solicitou visualizar um widget interativo. Reconheça a solicitação naturalmente em português e explique o que o widget mostra.

Mensagem do usuário: ${trimmedInput}`
        : `Você é o Hélio, Co-Piloto Solar da Yello Solar Hub. Fale em português brasileiro de forma clara e técnico-amigável.

## Sua Missão
Guiar integradores e compradores através de projetos solares fotovoltaicos com foco em: dimensionamento, seleção de equipamentos, análise financeira e conformidade regulatória.

## Conformidade Legal (Lei 14.300/2022)
- **Sistema de Compensação de Energia**: Explique créditos de energia (kWh gerados viram descontos na conta)
- **GD (Geração Distribuída)**: Sistemas residenciais/comerciais conectados à rede
- **GC (Geração Compartilhada)**: Assinatura de usina solar sem precisar de telhado (explique quando o usuário não tem área disponível)
- **Regras de Transição**: Sistemas até 6/1/2023 têm regras antigas, depois disso Lei 14.300 com TUSD fio B

## Linguagem Clara - Sempre Explique Jargões
- **kWp (quilowatt-pico)**: Potência do sistema em condições ideais de sol
- **PR (Performance Ratio)**: Eficiência real do sistema (quanto da energia teórica vira energia real, tipicamente 75-85%)
- **Irradiação**: Quantidade de sol que chega no local (kWh/m²/dia)
- **Payback**: Tempo para recuperar investimento (anos)
- **ROI**: Retorno sobre investimento (% anual)
- **MPPT**: Rastreador de ponto de máxima potência (otimiza produção)
- **String**: Conjunto de painéis conectados em série
- **Fase**: Tipo de ligação elétrica (monofásica 127V, bifásica 127V/220V, trifásica 220V/380V)

## Coleta de Dados - Peça APENAS Essenciais
Não peça informações desnecessárias. Foque no mínimo:
1. **CEP ou cidade**: Para irradiação solar
2. **Consumo médio mensal** (kWh): Para dimensionar o sistema
3. **Fase da instalação**: Monofásica, bifásica ou trifásica

## Cenários de Dimensionamento - Sempre Apresente 3 Opções
Para cada projeto, calcule e apresente:

**Cenário Conservador (1.14x)**
- Sistema menor, mais conservador
- Ideal para quem quer investimento inicial menor
- Cobre ~85-90% do consumo

**Cenário Equilibrado (1.30x)** ⭐ RECOMENDADO
- Balanço entre investimento e retorno
- Compensa perdas e coberturas nubladas
- Cobre 95-100% do consumo + margem de segurança

**Cenário Otimizado (1.45x)**
- Sistema maior, maximiza economia futura
- Gera créditos extras para consumo crescente
- Cobre 100% + excedente para crescimento

## Análise Financeira - Sempre Inclua
- **Investimento total**: Valor do sistema instalado
- **Economia mensal estimada**: Redução na conta de luz (R$/mês)
- **Payback simples**: Anos para retorno (investimento ÷ economia anual)
- **ROI em 25 anos**: Retorno percentual ao longo da vida útil
- **Comparação à vista vs financiado**: "Parcela de R$X vs conta atual de R$Y"

## Opções de Financiamento
Apresente bancos principais com condições típicas:
- **Banco do Brasil**: CDC Energia Renovável (até 120 meses)
- **Caixa Econômica**: Construcard Solar (até 240 meses)
- **BV Financeira**: Crédito Solar (até 96 meses, sem garantia)
- **Santander**: Crédito Sustentável (até 84 meses)
- **FNE Sol (Nordeste)**: Taxa subsidiada para região Nordeste

Sempre mostre: "Parcela R$X/mês vs Conta de luz R$Y/mês = Economia líquida R$Z/mês"

## Geração Compartilhada - Ofereça Quando Aplicável
Se o usuário mencionar:
- "Não tenho telhado disponível"
- "Moro em apartamento"
- "Área sombreada"
- "Telhado em más condições"

→ Apresente **GC (Geração Compartilhada)** ou **assinatura de fazenda solar** como alternativa

## Nota Regulatória - Sempre Inclua
Ao final de cada dimensionamento, adicione breve nota:
"⚠️ **Nota Regulatória (Lei 14.300/2022)**: Este sistema se enquadra em [micro/minigeração] e segue as regras de compensação da ANEEL. É necessário homologação pela concessionária [nome da concessionária local] antes da instalação."

## Próximos Passos - CTAs Curtos e Claros
Termine SEMPRE com 2-3 próximos passos objetivos:
✅ "Ver lista de equipamentos compatíveis"
✅ "Simular financiamento detalhado"
✅ "Analisar sombreamento do telhado"
✅ "Gerar proposta técnico-comercial"
✅ "Consultar requisitos da concessionária"

## Tom e Diretrizes
- **Seja proativo**: Antecipe dúvidas e sugira próximos passos
- **Seja pedagógico**: Explique o "porquê" de cada recomendação
- **Seja preciso**: Use unidades corretas (kWp, kWh, kWh/m²/dia)
- **Seja imparcial**: Ofereça várias marcas de equipamentos
- **Cite fontes**: CAMS, NASA POWER, Lei 14.300, NBR 16690

Mensagem do usuário: ${trimmedInput}`;

      const response = await window.spark.llm(promptText, "gpt-4o");

      // Enhanced widget creation with API integration
      let widgetData: Widget | undefined;
      if (widgetMatch) {
        try {
          // Determine context from chat history to personalize widget
          const context = extractContextFromMessages(newMessages);
          // Create widget with real API data
          widgetData = await SolarWidgetService.createWidgetForRequest(trimmedInput, context);
        } catch (error) {
          console.error("Error creating API-enhanced widget:", error);
          // Fall back to demo widgets if API fails
          widgetData = widgetDemoMessages[widgetMatch as keyof typeof widgetDemoMessages];
        }
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: Date.now(),
        widget: widgetData,
      };

      updateCurrentSession([...newMessages, assistantMessage]);
    } catch (error) {
      toast.error("Falha ao obter resposta. Tente novamente.");
      console.error("Error getting AI response:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      if (e.metaKey || e.ctrlKey) {
        e.preventDefault();
        handleSend();
      } else if (!e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    }
  };

  const handleNewChat = () => {
    const newSessionId = Date.now().toString();
    const newSession: ChatSession = {
      id: newSessionId,
      title: "Nova conversa",
      messages: [],
      timestamp: Date.now(),
    };

    setChatSessions((current) => [newSession, ...(current || [])]);
    setCurrentSessionId(newSessionId);
    setInput("");
    setIsSidebarOpen(false);
    toast.success("Started new chat");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    const messageIndex = chatMessages.findIndex((msg) => msg.id === messageId);
    if (messageIndex === -1) return;

    const updatedMessage = {
      ...chatMessages[messageIndex],
      content: newContent,
    };
    const messagesUpToEdit = chatMessages.slice(0, messageIndex);

    const newMessages = [...messagesUpToEdit, updatedMessage];
    updateCurrentSession(newMessages);
    setIsLoading(true);

    const lowerInput = newContent.toLowerCase();
    const widgetMatch = Object.keys(widgetDemoMessages).find((key) =>
      lowerInput.includes(key)
    );

    try {
      const promptText = widgetMatch
        ? `Você é o Hélio, Co-Piloto Solar da Yello Solar Hub - um assistente especializado em energia solar fotovoltaica para o mercado brasileiro. O usuário solicitou visualizar um widget interativo. Reconheça a solicitação naturalmente em português e explique o que o widget mostra.

Mensagem do usuário: ${newContent}`
        : `Você é o Hélio, Co-Piloto Solar da Yello Solar Hub. Fale em português brasileiro de forma clara e técnico-amigável.

## Sua Missão
Guiar integradores e compradores através de projetos solares fotovoltaicos com foco em: dimensionamento, seleção de equipamentos, análise financeira e conformidade regulatória.

## Conformidade Legal (Lei 14.300/2022)
- **Sistema de Compensação de Energia**: Explique créditos de energia (kWh gerados viram descontos na conta)
- **GD (Geração Distribuída)**: Sistemas residenciais/comerciais conectados à rede
- **GC (Geração Compartilhada)**: Assinatura de usina solar sem precisar de telhado (explique quando o usuário não tem área disponível)
- **Regras de Transição**: Sistemas até 6/1/2023 têm regras antigas, depois disso Lei 14.300 com TUSD fio B

## Linguagem Clara - Sempre Explique Jargões
- **kWp (quilowatt-pico)**: Potência do sistema em condições ideais de sol
- **PR (Performance Ratio)**: Eficiência real do sistema (quanto da energia teórica vira energia real, tipicamente 75-85%)
- **Irradiação**: Quantidade de sol que chega no local (kWh/m²/dia)
- **Payback**: Tempo para recuperar investimento (anos)
- **ROI**: Retorno sobre investimento (% anual)
- **MPPT**: Rastreador de ponto de máxima potência (otimiza produção)
- **String**: Conjunto de painéis conectados em série
- **Fase**: Tipo de ligação elétrica (monofásica 127V, bifásica 127V/220V, trifásica 220V/380V)

## Coleta de Dados - Peça APENAS Essenciais
Não peça informações desnecessárias. Foque no mínimo:
1. **CEP ou cidade**: Para irradiação solar
2. **Consumo médio mensal** (kWh): Para dimensionar o sistema
3. **Fase da instalação**: Monofásica, bifásica ou trifásica

## Cenários de Dimensionamento - Sempre Apresente 3 Opções
Para cada projeto, calcule e apresente:

**Cenário Conservador (1.14x)**
- Sistema menor, mais conservador
- Ideal para quem quer investimento inicial menor
- Cobre ~85-90% do consumo

**Cenário Equilibrado (1.30x)** ⭐ RECOMENDADO
- Balanço entre investimento e retorno
- Compensa perdas e coberturas nubladas
- Cobre 95-100% do consumo + margem de segurança

**Cenário Otimizado (1.45x)**
- Sistema maior, maximiza economia futura
- Gera créditos extras para consumo crescente
- Cobre 100% + excedente para crescimento

## Análise Financeira - Sempre Inclua
- **Investimento total**: Valor do sistema instalado
- **Economia mensal estimada**: Redução na conta de luz (R$/mês)
- **Payback simples**: Anos para retorno (investimento ÷ economia anual)
- **ROI em 25 anos**: Retorno percentual ao longo da vida útil
- **Comparação à vista vs financiado**: "Parcela de R$X vs conta atual de R$Y"

## Opções de Financiamento
Apresente bancos principais com condições típicas:
- **Banco do Brasil**: CDC Energia Renovável (até 120 meses)
- **Caixa Econômica**: Construcard Solar (até 240 meses)
- **BV Financeira**: Crédito Solar (até 96 meses, sem garantia)
- **Santander**: Crédito Sustentável (até 84 meses)
- **FNE Sol (Nordeste)**: Taxa subsidiada para região Nordeste

Sempre mostre: "Parcela R$X/mês vs Conta de luz R$Y/mês = Economia líquida R$Z/mês"

## Geração Compartilhada - Ofereça Quando Aplicável
Se o usuário mencionar:
- "Não tenho telhado disponível"
- "Moro em apartamento"
- "Área sombreada"
- "Telhado em más condições"

→ Apresente **GC (Geração Compartilhada)** ou **assinatura de fazenda solar** como alternativa

## Nota Regulatória - Sempre Inclua
Ao final de cada dimensionamento, adicione breve nota:
"⚠️ **Nota Regulatória (Lei 14.300/2022)**: Este sistema se enquadra em [micro/minigeração] e segue as regras de compensação da ANEEL. É necessário homologação pela concessionária [nome da concessionária local] antes da instalação."

## Próximos Passos - CTAs Curtos e Claros
Termine SEMPRE com 2-3 próximos passos objetivos:
✅ "Ver lista de equipamentos compatíveis"
✅ "Simular financiamento detalhado"
✅ "Analisar sombreamento do telhado"
✅ "Gerar proposta técnico-comercial"
✅ "Consultar requisitos da concessionária"

## Tom e Diretrizes
- **Seja proativo**: Antecipe dúvidas e sugira próximos passos
- **Seja pedagógico**: Explique o "porquê" de cada recomendação
- **Seja preciso**: Use unidades corretas (kWp, kWh, kWh/m²/dia)
- **Seja imparcial**: Ofereça várias marcas de equipamentos
- **Cite fontes**: CAMS, NASA POWER, Lei 14.300, NBR 16690

Mensagem do usuário: ${newContent}`;

      const response = await window.spark.llm(promptText, "gpt-4o");

      // Enhanced widget creation with API integration for edit message
      let widgetData: Widget | undefined;
      if (widgetMatch) {
        try {
          // Determine context from chat history to personalize widget
          const context = extractContextFromMessages([...messagesUpToEdit, updatedMessage]);
          // Create widget with real API data
          widgetData = await SolarWidgetService.createWidgetForRequest(newContent, context);
        } catch (error) {
          console.error("Error creating API-enhanced widget:", error);
          // Fall back to demo widgets if API fails
          widgetData = widgetDemoMessages[widgetMatch as keyof typeof widgetDemoMessages];
        }
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: Date.now(),
        widget: widgetData,
      };

      updateCurrentSession([...newMessages, assistantMessage]);
      toast.success("Message edited and regenerated");
    } catch (error) {
      toast.error("Failed to regenerate response. Please try again.");
      console.error("Error regenerating response:", error);
      updateCurrentSession([...messagesUpToEdit, updatedMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateMessage = async () => {
    if (chatMessages.length < 2) return;

    const lastUserMessageIndex = chatMessages.length - 2;
    const lastUserMessage = chatMessages[lastUserMessageIndex];

    if (lastUserMessage.role !== "user") return;

    const messagesWithoutLastAssistant = chatMessages.slice(0, -1);
    updateCurrentSession(messagesWithoutLastAssistant);
    setIsLoading(true);

    try {
      const promptText = `Você é o Hélio, Co-Piloto Solar da Yello Solar Hub. Fale em português brasileiro de forma clara e técnico-amigável.

## Sua Missão
Guiar integradores e compradores através de projetos solares fotovoltaicos com foco em: dimensionamento, seleção de equipamentos, análise financeira e conformidade regulatória.

## Conformidade Legal (Lei 14.300/2022)
- **Sistema de Compensação de Energia**: Explique créditos de energia (kWh gerados viram descontos na conta)
- **GD (Geração Distribuída)**: Sistemas residenciais/comerciais conectados à rede
- **GC (Geração Compartilhada)**: Assinatura de usina solar sem precisar de telhado (explique quando o usuário não tem área disponível)
- **Regras de Transição**: Sistemas até 6/1/2023 têm regras antigas, depois disso Lei 14.300 com TUSD fio B

## Linguagem Clara - Sempre Explique Jargões
- **kWp (quilowatt-pico)**: Potência do sistema em condições ideais de sol
- **PR (Performance Ratio)**: Eficiência real do sistema (quanto da energia teórica vira energia real, tipicamente 75-85%)
- **Irradiação**: Quantidade de sol que chega no local (kWh/m²/dia)
- **Payback**: Tempo para recuperar investimento (anos)
- **ROI**: Retorno sobre investimento (% anual)
- **MPPT**: Rastreador de ponto de máxima potência (otimiza produção)
- **String**: Conjunto de painéis conectados em série
- **Fase**: Tipo de ligação elétrica (monofásica 127V, bifásica 127V/220V, trifásica 220V/380V)

## Coleta de Dados - Peça APENAS Essenciais
Não peça informações desnecessárias. Foque no mínimo:
1. **CEP ou cidade**: Para irradiação solar
2. **Consumo médio mensal** (kWh): Para dimensionar o sistema
3. **Fase da instalação**: Monofásica, bifásica ou trifásica

## Cenários de Dimensionamento - Sempre Apresente 3 Opções
Para cada projeto, calcule e apresente:

**Cenário Conservador (1.14x)**
- Sistema menor, mais conservador
- Ideal para quem quer investimento inicial menor
- Cobre ~85-90% do consumo

**Cenário Equilibrado (1.30x)** ⭐ RECOMENDADO
- Balanço entre investimento e retorno
- Compensa perdas e coberturas nubladas
- Cobre 95-100% do consumo + margem de segurança

**Cenário Otimizado (1.45x)**
- Sistema maior, maximiza economia futura
- Gera créditos extras para consumo crescente
- Cobre 100% + excedente para crescimento

## Análise Financeira - Sempre Inclua
- **Investimento total**: Valor do sistema instalado
- **Economia mensal estimada**: Redução na conta de luz (R$/mês)
- **Payback simples**: Anos para retorno (investimento ÷ economia anual)
- **ROI em 25 anos**: Retorno percentual ao longo da vida útil
- **Comparação à vista vs financiado**: "Parcela de R$X vs conta atual de R$Y"

## Opções de Financiamento
Apresente bancos principais com condições típicas:
- **Banco do Brasil**: CDC Energia Renovável (até 120 meses)
- **Caixa Econômica**: Construcard Solar (até 240 meses)
- **BV Financeira**: Crédito Solar (até 96 meses, sem garantia)
- **Santander**: Crédito Sustentável (até 84 meses)
- **FNE Sol (Nordeste)**: Taxa subsidiada para região Nordeste

Sempre mostre: "Parcela R$X/mês vs Conta de luz R$Y/mês = Economia líquida R$Z/mês"

## Geração Compartilhada - Ofereça Quando Aplicável
Se o usuário mencionar:
- "Não tenho telhado disponível"
- "Moro em apartamento"
- "Área sombreada"
- "Telhado em más condições"

→ Apresente **GC (Geração Compartilhada)** ou **assinatura de fazenda solar** como alternativa

## Nota Regulatória - Sempre Inclua
Ao final de cada dimensionamento, adicione breve nota:
"⚠️ **Nota Regulatória (Lei 14.300/2022)**: Este sistema se enquadra em [micro/minigeração] e segue as regras de compensação da ANEEL. É necessário homologação pela concessionária [nome da concessionária local] antes da instalação."

## Próximos Passos - CTAs Curtos e Claros
Termine SEMPRE com 2-3 próximos passos objetivos:
✅ "Ver lista de equipamentos compatíveis"
✅ "Simular financiamento detalhado"
✅ "Analisar sombreamento do telhado"
✅ "Gerar proposta técnico-comercial"
✅ "Consultar requisitos da concessionária"

## Tom e Diretrizes
- **Seja proativo**: Antecipe dúvidas e sugira próximos passos
- **Seja pedagógico**: Explique o "porquê" de cada recomendação
- **Seja preciso**: Use unidades corretas (kWp, kWh, kWh/m²/dia)
- **Seja imparcial**: Ofereça várias marcas de equipamentos
- **Cite fontes**: CAMS, NASA POWER, Lei 14.300, NBR 16690

Mensagem do usuário: ${lastUserMessage.content}`;

      const response = await window.spark.llm(promptText, "gpt-4o");

      // For regenerate message, use the same context as the original message
      let widgetData: Widget | undefined;
      const lowerInput = lastUserMessage.content.toLowerCase();
      const widgetMatch = Object.keys(widgetDemoMessages).find((key) =>
        lowerInput.includes(key)
      );

      if (widgetMatch) {
        try {
          // Determine context from chat history to personalize widget
          const context = extractContextFromMessages(messagesWithoutLastAssistant);
          // Create widget with real API data
          widgetData = await SolarWidgetService.createWidgetForRequest(lastUserMessage.content, context);
        } catch (error) {
          console.error("Error creating API-enhanced widget:", error);
          // Fall back to demo widgets if API fails
          widgetData = widgetDemoMessages[widgetMatch as keyof typeof widgetDemoMessages];
        }
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: Date.now(),
        widget: widgetData,
      };

      updateCurrentSession([...messagesWithoutLastAssistant, assistantMessage]);
      toast.success("Response regenerated with API data");
    } catch (error) {
      toast.error("Failed to regenerate response. Please try again.");
      console.error("Error regenerating response:", error);
      updateCurrentSession(messagesWithoutLastAssistant);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to extract context from chat messages to personalize API calls
  function extractContextFromMessages(messages: ChatMessage[]) {
    const context: {
      location?: { lat: number; lon: number; cep?: string; address?: string };
      consumption?: number;
      systemSize?: number;
    } = {};

    // Look through messages to extract key context information
    for (const message of messages) {
      const content = message.content.toLowerCase();
      
      // Extract consumption information
      const consumptionRegex = /(\d+)\s*(kwh|médio|consumo|conta)/;
      const consumptionMatch = content.match(consumptionRegex);
      if (consumptionMatch) {
        const value = parseInt(consumptionMatch[1]);
        if (value > 0 && value < 10000) { // Reasonable consumption range
          context.consumption = value;
        }
      }

      // Extract location information (CEP or coordinates)
      const cepRegex = /(\d{5})[-\s]?(\d{3})/;
      const cepMatch = content.match(cepRegex);
      if (cepMatch) {
        // TODO: Convert CEP to coordinates using ViaCEP API
        // For now, use default SP coordinates
        context.location = {
          lat: -23.5505,
          lon: -46.6333,
          cep: cepMatch[1] + cepMatch[2]
        };
      }
      
      // Extract system size information
      const systemRegex = /(\d+\.?\d*)\s*(kw|kwp|sistema)/;
      const systemMatch = content.match(systemRegex);
      if (systemMatch) {
        const value = parseFloat(systemMatch[1]);
        if (value > 0 && value < 100) { // Reasonable system size range
          context.systemSize = value;
        }
      }
    }

    // Set default location if none found
    if (!context.location) {
      context.location = {
        lat: -23.5505,
        lon: -46.6333,
        address: "São Paulo, SP"
      };
    }

    return context;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <ChatSidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        currentRoute={currentRoute}
        onRouteChange={setCurrentRoute}
        onNewChat={handleNewChat}
        chatSessions={chatSessions || []}
        currentSessionId={currentSessionId}
        onSessionSelect={setCurrentSessionId}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {currentRoute === "chat" ? (
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="border-b border-border/40 bg-card/70 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center justify-between h-16 px-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => setIsSidebarOpen(true)}
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                  >
                    <List size={20} weight="bold" />
                  </Button>
                  <div>
                    <h2 className="font-semibold text-foreground">Yello Solar Hub</h2>
                    <p className="text-xs text-muted-foreground">
                      Co-Piloto Solar para dimensionamento fotovoltaico
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={() => setIsPromptLibraryOpen(true)}
                  >
                    <Sparkle size={18} weight="bold" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={() => setIsSearchOpen(true)}
                  >
                    <MagnifyingGlass size={18} weight="bold" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={() => setIsShareOpen(true)}
                  >
                    <Share size={18} weight="bold" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={() => setIsSettingsOpen(true)}
                  >
                    <Gear size={18} weight="bold" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea ref={scrollRef} className="flex-1 overflow-auto">
              <div className="pb-24">
                {chatMessages.map((message, index) => (
                  <div key={message.id}>
                    <Message
                      role={message.role}
                      content={message.content}
                      widget={message.widget}
                      isLastAssistantMessage={index === chatMessages.length - 1 && message.role === "assistant"}
                      onEdit={(newContent) => {
                        const updatedMessages = [...chatMessages];
                        updatedMessages[index] = { ...updatedMessages[index], content: newContent };
                        updateCurrentSession(updatedMessages);
                      }}
                      onRegenerate={message.role === "assistant" ? handleRegenerateMessage : undefined}
                    />
                    {index < chatMessages.length - 1 && (
                      <Separator className="my-0.5" />
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="px-4 sm:px-6">
                    <div className="flex gap-3.5 px-4 py-5">
                      <div className="flex-shrink-0 pt-0.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent via-accent/90 to-accent/80 flex items-center justify-center shadow-md">
                          <Sparkle size={18} weight="fill" className="text-accent-foreground" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <TypingIndicator />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t border-border/40 bg-card/70 backdrop-blur-md sticky bottom-0">
              <div className="p-4">
                <div className="flex gap-2">
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Como posso ajudar com seu projeto solar hoje?"
                    className="resize-none min-h-[60px] max-h-40 bg-background/50 border-2 focus:border-accent/50"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="shrink-0 self-end bg-gradient-to-r from-[#FFD60A] via-[#FF3D3D] to-[#FF0066] hover:opacity-90 text-white h-12"
                  >
                    <PaperPlaneRight size={20} weight="bold" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Powered by Hélio Solar Assistant • Dados reais de PVGIS, NASA POWER e ANEEL
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            {currentRoute === "sizing" && <SizingPage onToggleSidebar={() => setIsSidebarOpen(true)} />}
            {currentRoute === "earth-observation" && <EarthObservationPage onToggleSidebar={() => setIsSidebarOpen(true)} />}
            {currentRoute === "shading-analysis" && <ShadingAnalysisPage onToggleSidebar={() => setIsSidebarOpen(true)} />}
            {currentRoute === "temporal-analysis" && <TemporalAnalysisPage onToggleSidebar={() => setIsSidebarOpen(true)} />}
            {currentRoute === "solar-workflow" && <SolarWorkflowPage onToggleSidebar={() => setIsSidebarOpen(true)} />}
            {currentRoute === "homologation" && <HomologationPage onToggleSidebar={() => setIsSidebarOpen(true)} />}
            {currentRoute === "projects" && <ProjectsPage onToggleSidebar={() => setIsSidebarOpen(true)} />}
            {currentRoute === "dashboard" && <DashboardPage onToggleSidebar={() => setIsSidebarOpen(true)} />}
            {currentRoute === "equipment" && <EquipmentPage onToggleSidebar={() => setIsSidebarOpen(true)} />}
            {currentRoute === "checkout" && <CheckoutPage onToggleSidebar={() => setIsSidebarOpen(true)} />}
            {currentRoute === "credit" && <CreditAnalysisPage onToggleSidebar={() => setIsSidebarOpen(true)} />}
            {currentRoute === "chatkit-demo" && <ChatKitDemoPage onToggleSidebar={() => setIsSidebarOpen(true)} />}
            {currentRoute === "realtime-voice" && <RealtimeVoicePage onToggleSidebar={() => setIsSidebarOpen(true)} />}
            {currentRoute === "gpts" && <GPTsPage onToggleSidebar={() => setIsSidebarOpen(true)} />}
            {currentRoute === "prompts" && <PromptsPage onToggleSidebar={() => setIsSidebarOpen(true)} />}
            {currentRoute === "gallery" && <GalleryPage onToggleSidebar={() => setIsSidebarOpen(true)} />}
            {currentRoute === "codex" && <CodexPage onToggleSidebar={() => setIsSidebarOpen(true)} />}
            {currentRoute === "technical-sheets" && <TechnicalSheetsPage onToggleSidebar={() => setIsSidebarOpen(true)} />}
            {currentRoute === "release-notes" && <ReleaseNotesPage onToggleSidebar={() => setIsSidebarOpen(true)} />}
            {currentRoute === "terms" && <TermsPage onToggleSidebar={() => setIsSidebarOpen(true)} />}
            {currentRoute === "bug-report" && <BugReportPage onToggleSidebar={() => setIsSidebarOpen(true)} />}
            {currentRoute === "downloads" && <DownloadsPage onToggleSidebar={() => setIsSidebarOpen(true)} />}
            {currentRoute === "shortcuts" && <KeyboardShortcutsPage onToggleSidebar={() => setIsSidebarOpen(true)} />}
            {currentRoute === "login" && <LoginPage onToggleSidebar={() => setIsSidebarOpen(true)} />}
            {currentRoute === "pdf-proposal" && <PDFProposalGenerator onToggleSidebar={() => setIsSidebarOpen(true)} />}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <PromptLibrary
        isOpen={isPromptLibraryOpen}
        onClose={() => setIsPromptLibraryOpen(false)}
        onInsert={(prompt) => {
          setInput(prompt);
          setIsPromptLibraryOpen(false);
          setTimeout(() => textareaRef.current?.focus(), 0);
        }}
      />
      <SearchDialog
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        chatMessages={chatMessages}
      />
      <ShareDialog
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        chatMessages={chatMessages}
      />
      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Analytics Panel */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="default"
          onClick={() => setIsAnalyticsOpen(!isAnalyticsOpen)}
          className="bg-[#6366F1] hover:bg-[#4F46E5]"
        >
          {isAnalyticsOpen ? "Ocultar" : "Analytics"}
        </Button>
        {isAnalyticsOpen && <AnalyticsPanel />}
      </div>

      {/* Video Background */}
      <LogoVideo
        src={yelloVideoMp4}
        className="fixed inset-0 w-full h-full object-cover -z-10 opacity-5 pointer-events-none"
      />
    </div>
  );
}

export default App;