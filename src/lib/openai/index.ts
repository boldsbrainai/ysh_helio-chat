/**
 * OpenAI Integration - Index
 *
 * Central export point for all OpenAI services
 */

// Configuration
export { openAIConfig, validateOpenAIConfig } from "./config";
export type { OpenAIConfig } from "./config";

// ChatKit
export {
  createChatKitSession,
  refreshChatKitSession,
  getDeviceId,
} from "./chatkit";
export type { ChatKitSession, CreateSessionOptions } from "./chatkit";

// Assistants API
export {
  createAssistant,
  createThread,
  addMessageToThread,
  runAssistant,
  getThreadMessages,
  uploadFile,
} from "./assistants";
export type {
  AssistantMessage,
  AssistantThread,
  AssistantRun,
} from "./assistants";

// Whisper (Voice)
export {
  transcribeAudio,
  translateAudio,
  textToSpeech,
  AudioRecorder,
  useVoiceRecorder,
} from "./whisper";
export type { TranscriptionOptions, TranscriptionResponse } from "./whisper";

// Realtime API
export { RealtimeClient } from "./realtime";
export type { RealtimeSession, RealtimeMessage } from "./realtime";
