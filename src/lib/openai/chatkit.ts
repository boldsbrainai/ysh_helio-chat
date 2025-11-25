/**
 * ChatKit Session Management
 *
 * Enhanced session management with automatic refresh, persistence,
 * error recovery, and authentication integration
 */

import { openAIConfig } from "./config";

export interface ChatKitSession {
  client_secret: string;
  session_id: string;
  expires_at?: string;
  created_at?: number;
  user_id?: string;
  device_id?: string;
}

export interface CreateSessionOptions {
  userId?: string;
  deviceId?: string;
  metadata?: Record<string, any>;
  forceNew?: boolean;
}

export interface SessionPersistence {
  clientSecret: string;
  sessionId: string;
  expiresAt?: string;
  createdAt: number;
  userId?: string;
  deviceId?: string;
}

const STORAGE_KEY = "chatkit-session";
const DEVICE_ID_KEY = "chatkit-device-id";
const SESSION_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes buffer before expiry

/**
 * Creates a new ChatKit session with enhanced error handling and retry logic
 */
export async function createChatKitSession(
  options: CreateSessionOptions = {}
): Promise<string> {
  const { userId, deviceId, metadata, forceNew = false } = options;

  if (!forceNew) {
    const cached = getCachedSession();
    if (cached && isSessionValid(cached)) {
      console.log("Using cached ChatKit session");
      return cached.clientSecret;
    }
  }

  const effectiveDeviceId = deviceId || getDeviceId();
  const effectiveUserId = userId || effectiveDeviceId;

  try {
    const sparkUser = await window.spark.user().catch(() => null);
    const userMetadata = sparkUser
      ? {
          github_login: sparkUser.login,
          github_id: sparkUser.id,
          is_owner: sparkUser.isOwner,
          ...metadata,
        }
      : metadata;

    const response = await fetchWithRetry(
      "https://api.openai.com/v1/chatkit/sessions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "OpenAI-Beta": "chatkit_beta=v1",
          Authorization: `Bearer ${openAIConfig.apiKey}`,
        },
        body: JSON.stringify({
          workflow: {
            id: openAIConfig.chatkit.workflowId,
          },
          user: effectiveUserId,
          metadata: userMetadata,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ChatKitError(
        `Failed to create session: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    const data: ChatKitSession = await response.json();

    cacheSession({
      clientSecret: data.client_secret,
      sessionId: data.session_id,
      expiresAt: data.expires_at,
      createdAt: Date.now(),
      userId: effectiveUserId,
      deviceId: effectiveDeviceId,
    });

    return data.client_secret;
  } catch (error) {
    console.error("Error creating ChatKit session:", error);
    throw error;
  }
}

/**
 * Refreshes an existing ChatKit session with fallback to create new
 */
export async function refreshChatKitSession(
  currentClientSecret: string
): Promise<string> {
  try {
    const response = await fetchWithRetry(
      "https://api.openai.com/v1/chatkit/sessions/refresh",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "OpenAI-Beta": "chatkit_beta=v1",
          Authorization: `Bearer ${openAIConfig.apiKey}`,
        },
        body: JSON.stringify({
          client_secret: currentClientSecret,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        console.warn("Session expired or invalid, creating new session");
        clearCachedSession();
        return createChatKitSession({ forceNew: true });
      }

      const errorData = await response.json().catch(() => ({}));
      throw new ChatKitError(
        `Failed to refresh session: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    const data: ChatKitSession = await response.json();

    const cached = getCachedSession();
    if (cached) {
      cacheSession({
        ...cached,
        clientSecret: data.client_secret,
        sessionId: data.session_id,
        expiresAt: data.expires_at,
      });
    }

    return data.client_secret;
  } catch (error) {
    console.error("Error refreshing ChatKit session:", error);
    throw error;
  }
}

/**
 * Validates an existing session
 */
export async function validateSession(clientSecret: string): Promise<boolean> {
  try {
    const response = await fetch(
      "https://api.openai.com/v1/chatkit/sessions/validate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "OpenAI-Beta": "chatkit_beta=v1",
          Authorization: `Bearer ${openAIConfig.apiKey}`,
        },
        body: JSON.stringify({
          client_secret: clientSecret,
        }),
      }
    );

    return response.ok;
  } catch (error) {
    console.error("Error validating session:", error);
    return false;
  }
}

/**
 * Terminates a ChatKit session
 */
export async function terminateSession(clientSecret: string): Promise<void> {
  try {
    await fetch("https://api.openai.com/v1/chatkit/sessions/terminate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "OpenAI-Beta": "chatkit_beta=v1",
        Authorization: `Bearer ${openAIConfig.apiKey}`,
      },
      body: JSON.stringify({
        client_secret: clientSecret,
      }),
    });

    clearCachedSession();
  } catch (error) {
    console.error("Error terminating session:", error);
    throw error;
  }
}

/**
 * Generates a unique device ID with fingerprinting
 */
function generateDeviceId(): string {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);

  if (!deviceId) {
    const fingerprint = generateFingerprint();
    deviceId = `device-${fingerprint}-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }

  return deviceId;
}

/**
 * Gets the stored device ID
 */
export function getDeviceId(): string {
  return generateDeviceId();
}

/**
 * Generates a simple browser fingerprint
 */
function generateFingerprint(): string {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const txt = "Yello Solar Hub";

  if (ctx) {
    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.fillText(txt, 2, 2);
  }

  const canvasData = canvas.toDataURL();
  const hash = simpleHash(
    canvasData +
      navigator.userAgent +
      navigator.language +
      screen.width +
      screen.height +
      new Date().getTimezoneOffset()
  );

  return hash.toString(36);
}

/**
 * Simple hash function
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Caches session to localStorage
 */
function cacheSession(session: SessionPersistence): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch (error) {
    console.error("Failed to cache session:", error);
  }
}

/**
 * Retrieves cached session from localStorage
 */
function getCachedSession(): SessionPersistence | null {
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (!cached) return null;

    const session: SessionPersistence = JSON.parse(cached);
    return session;
  } catch (error) {
    console.error("Failed to retrieve cached session:", error);
    return null;
  }
}

/**
 * Clears cached session from localStorage
 */
export function clearCachedSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear cached session:", error);
  }
}

/**
 * Checks if a cached session is still valid
 */
function isSessionValid(session: SessionPersistence): boolean {
  if (!session.expiresAt) {
    const age = Date.now() - session.createdAt;
    return age < 60 * 60 * 1000 - SESSION_EXPIRY_BUFFER;
  }

  const expiryTime = new Date(session.expiresAt).getTime();
  return Date.now() < expiryTime - SESSION_EXPIRY_BUFFER;
}

/**
 * Fetch with retry logic
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3
): Promise<Response> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok || response.status < 500) {
        return response;
      }
      lastError = new Error(`Server error: ${response.status}`);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown error");
      console.warn(`Fetch attempt ${i + 1} failed:`, lastError);
    }

    if (i < maxRetries - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }

  throw lastError || new Error("Failed to fetch after retries");
}

/**
 * Custom ChatKit error class
 */
export class ChatKitError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = "ChatKitError";
  }
}

/**
 * Get session info
 */
export function getSessionInfo(): SessionPersistence | null {
  return getCachedSession();
}

/**
 * Check if session needs refresh
 */
export function needsRefresh(): boolean {
  const cached = getCachedSession();
  if (!cached) return false;

  if (!cached.expiresAt) {
    const age = Date.now() - cached.createdAt;
    return age > 50 * 60 * 1000;
  }

  const expiryTime = new Date(cached.expiresAt).getTime();
  const timeUntilExpiry = expiryTime - Date.now();
  return timeUntilExpiry < 10 * 60 * 1000;
}
