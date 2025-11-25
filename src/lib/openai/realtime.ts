/**
 * OpenAI Realtime API Integration (GA Interface)
 *
 * Provides real-time voice conversation capabilities using the GA API
 */

import { openAIConfig } from "./config";

export interface RealtimeSession {
  type: "realtime" | "transcription";
  model: string;
  modalities?: string[];
  instructions?: string;
  audio?: {
    input?: {
      format?: string;
    };
    output?: {
      voice?: string;
      format?: string;
    };
  };
  turn_detection?: {
    type: "server_vad";
    threshold?: number;
    prefix_padding_ms?: number;
    silence_duration_ms?: number;
  };
}

export interface RealtimeMessage {
  type:
    | "session.created"
    | "session.updated"
    | "conversation.item.added"
    | "conversation.item.done"
    | "response.output_audio.delta"
    | "response.output_text.delta"
    | "response.output_audio_transcript.delta"
    | "response.done"
    | "error";
  session?: RealtimeSession;
  item?: {
    id: string;
    object: "realtime.item";
    type: "message" | "function_call" | "function_call_output";
    status?: string;
    role?: "user" | "assistant";
    content?: Array<{
      type: "output_text" | "output_audio" | "text" | "audio";
      text?: string;
      audio?: string;
      transcript?: string;
    }>;
  };
  delta?: string;
  error?: {
    type: string;
    message: string;
    code?: string;
  };
}

/**
 * Creates a WebSocket connection to the Realtime API
 */
export class RealtimeClient {
  private ws: WebSocket | null = null;
  private audioContext: AudioContext | null = null;
  private messageHandlers: Map<string, (message: RealtimeMessage) => void> =
    new Map();

  constructor() {
    if (typeof window !== "undefined" && window.AudioContext) {
      this.audioContext = new AudioContext();
    }
  }

  /**
   * Connects to the Realtime API (GA Interface)
   */
  async connect(sessionConfig?: Partial<RealtimeSession>): Promise<void> {
    const model = sessionConfig?.model || openAIConfig.realtime.model;
    const url = `wss://api.openai.com/v1/realtime?model=${model}`;

    this.ws = new WebSocket(url);

    return new Promise((resolve, reject) => {
      if (!this.ws) return reject(new Error("WebSocket not initialized"));

      this.ws.onopen = () => {
        this.send({
          type: "session.update",
          session: {
            type: "realtime",
            model: model,
            modalities: ["text", "audio"],
            instructions:
              "Você é o Hélio, Co-Piloto Solar da Yello Solar Hub - um assistente especializado em energia solar fotovoltaica para o mercado brasileiro.",
            audio: {
              input: {
                format: "pcm16",
              },
              output: {
                voice: openAIConfig.realtime.voice,
                format: "pcm16",
              },
            },
            turn_detection: {
              type: "server_vad",
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 500,
            },
            ...sessionConfig,
          },
        });
        resolve();
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        reject(error);
      };

      this.ws.onmessage = (event) => {
        try {
          const message: RealtimeMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error("Error parsing message:", error);
        }
      };

      this.ws.onclose = () => {
        console.log("WebSocket connection closed");
      };
    });
  }

  /**
   * Sends a message to the Realtime API
   */
  send(message: any): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket not connected");
    }
    this.ws.send(JSON.stringify(message));
  }

  /**
   * Sends text input to the assistant
   */
  sendText(text: string): void {
    this.send({
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [
          {
            type: "input_text",
            text,
          },
        ],
      },
    });

    // Trigger response generation
    this.send({
      type: "response.create",
    });
  }

  /**
   * Sends audio input to the assistant
   */
  sendAudio(audioData: ArrayBuffer): void {
    // Convert to base64
    const base64Audio = btoa(
      new Uint8Array(audioData).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ""
      )
    );

    this.send({
      type: "input_audio_buffer.append",
      audio: base64Audio,
    });
  }

  /**
   * Commits the audio buffer (signals end of user speech)
   */
  commitAudio(): void {
    this.send({
      type: "input_audio_buffer.commit",
    });

    this.send({
      type: "response.create",
    });
  }

  /**
   * Registers a message handler
   */
  on(eventType: string, handler: (message: RealtimeMessage) => void): void {
    this.messageHandlers.set(eventType, handler);
  }

  /**
   * Removes a message handler
   */
  off(eventType: string): void {
    this.messageHandlers.delete(eventType);
  }

  /**
   * Handles incoming messages
   */
  private handleMessage(message: RealtimeMessage): void {
    // Call registered handlers
    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      handler(message);
    }

    // Call wildcard handler if exists
    const wildcardHandler = this.messageHandlers.get("*");
    if (wildcardHandler) {
      wildcardHandler(message);
    }
  }

  /**
   * Plays audio response
   */
  async playAudio(base64Audio: string): Promise<void> {
    if (!this.audioContext) {
      throw new Error("AudioContext not available");
    }

    // Decode base64 to ArrayBuffer
    const binaryString = atob(base64Audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Decode audio data
    const audioBuffer = await this.audioContext.decodeAudioData(bytes.buffer);

    // Play audio
    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.audioContext.destination);
    source.start();
  }

  /**
   * Disconnects from the Realtime API
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Checks if connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
