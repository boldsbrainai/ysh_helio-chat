/**
 * OpenAI Configuration
 *
 * Centralized configuration for OpenAI services including:
 * - ChatKit integration
 * - Assistants API
 * - Whisper (voice agents)
 * - Agent workflows
 */

export const openAIConfig = {
  // API Configuration
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || "",

  // ChatKit Configuration
  chatkit: {
    enabled: !!import.meta.env.VITE_OPENAI_CHATKIT_ENABLED,
    workflowId: import.meta.env.VITE_OPENAI_WORKFLOW_ID || "",
    sessionEndpoint: "/api/chatkit/session",
    cdnUrl: "https://cdn.platform.openai.com/deployments/chatkit/chatkit.js",
  },

  // Assistants API Configuration
  assistants: {
    enabled: !!import.meta.env.VITE_OPENAI_ASSISTANTS_ENABLED,
    defaultModel: "gpt-4o",
    fileUploadEnabled: true,
    maxFileSize: 20 * 1024 * 1024, // 20MB
  },

  // Whisper Configuration (Voice Agents)
  whisper: {
    enabled: !!import.meta.env.VITE_OPENAI_WHISPER_ENABLED,
    model: "whisper-1",
    language: "pt", // Brazilian Portuguese
    responseFormat: "json",
  },

  // Agent Workflow Configuration
  workflows: {
    defaultTimeout: 30000, // 30 seconds
    maxRetries: 3,
  },

  // Realtime API Configuration
  realtime: {
    enabled: !!import.meta.env.VITE_OPENAI_REALTIME_ENABLED,
    model: "gpt-4o-realtime-preview",
    voice: "alloy",
  },
} as const;

export type OpenAIConfig = typeof openAIConfig;

// Validation helper
export function validateOpenAIConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!openAIConfig.apiKey) {
    errors.push("VITE_OPENAI_API_KEY is required");
  }

  if (openAIConfig.chatkit.enabled && !openAIConfig.chatkit.workflowId) {
    errors.push("VITE_OPENAI_WORKFLOW_ID is required when ChatKit is enabled");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
