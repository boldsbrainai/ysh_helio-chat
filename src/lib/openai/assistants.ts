/**
 * OpenAI Assistants API Integration
 *
 * Provides utilities for working with OpenAI Assistants API
 */

import { openAIConfig } from "./config";

export interface AssistantMessage {
  role: "user" | "assistant";
  content: string;
  file_ids?: string[];
}

export interface AssistantThread {
  id: string;
  created_at: number;
  metadata?: Record<string, any>;
}

export interface AssistantRun {
  id: string;
  thread_id: string;
  assistant_id: string;
  status: "queued" | "in_progress" | "completed" | "failed" | "cancelled";
  created_at: number;
  completed_at?: number;
}

/**
 * Creates an assistant with specified configuration
 */
export async function createAssistant(config: {
  name: string;
  instructions: string;
  model?: string;
  tools?: Array<{ type: string }>;
  file_ids?: string[];
}) {
  const response = await fetch("https://api.openai.com/v1/assistants", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "OpenAI-Beta": "assistants=v2",
      Authorization: `Bearer ${openAIConfig.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model || openAIConfig.assistants.defaultModel,
      name: config.name,
      instructions: config.instructions,
      tools: config.tools || [],
      file_ids: config.file_ids || [],
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create assistant: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Creates a new thread for conversation
 */
export async function createThread(
  messages: AssistantMessage[] = [],
  metadata?: Record<string, any>
): Promise<AssistantThread> {
  const response = await fetch("https://api.openai.com/v1/threads", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "OpenAI-Beta": "assistants=v2",
      Authorization: `Bearer ${openAIConfig.apiKey}`,
    },
    body: JSON.stringify({
      messages,
      metadata,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create thread: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Adds a message to an existing thread
 */
export async function addMessageToThread(
  threadId: string,
  content: string,
  file_ids?: string[]
) {
  const response = await fetch(
    `https://api.openai.com/v1/threads/${threadId}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "OpenAI-Beta": "assistants=v2",
        Authorization: `Bearer ${openAIConfig.apiKey}`,
      },
      body: JSON.stringify({
        role: "user",
        content,
        file_ids,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to add message: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Runs an assistant on a thread
 */
export async function runAssistant(
  threadId: string,
  assistantId: string,
  instructions?: string
): Promise<AssistantRun> {
  const response = await fetch(
    `https://api.openai.com/v1/threads/${threadId}/runs`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "OpenAI-Beta": "assistants=v2",
        Authorization: `Bearer ${openAIConfig.apiKey}`,
      },
      body: JSON.stringify({
        assistant_id: assistantId,
        instructions,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to run assistant: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Retrieves messages from a thread
 */
export async function getThreadMessages(threadId: string) {
  const response = await fetch(
    `https://api.openai.com/v1/threads/${threadId}/messages`,
    {
      headers: {
        "OpenAI-Beta": "assistants=v2",
        Authorization: `Bearer ${openAIConfig.apiKey}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get messages: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Uploads a file for use with assistants
 */
export async function uploadFile(
  file: File,
  purpose: "assistants" | "fine-tune" = "assistants"
) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("purpose", purpose);

  const response = await fetch("https://api.openai.com/v1/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openAIConfig.apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload file: ${response.statusText}`);
  }

  return response.json();
}
