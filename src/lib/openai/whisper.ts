/**
 * OpenAI Whisper Integration for Voice Agents
 *
 * Provides speech-to-text and text-to-speech capabilities
 */

import { openAIConfig } from "./config";

export interface TranscriptionOptions {
  language?: string;
  prompt?: string;
  response_format?: "json" | "text" | "srt" | "verbose_json" | "vtt";
  temperature?: number;
}

export interface TranscriptionResponse {
  text: string;
  language?: string;
  duration?: number;
  segments?: Array<{
    id: number;
    start: number;
    end: number;
    text: string;
  }>;
}

/**
 * Transcribes audio to text using Whisper
 */
export async function transcribeAudio(
  audioFile: File,
  options: TranscriptionOptions = {}
): Promise<TranscriptionResponse> {
  const formData = new FormData();
  formData.append("file", audioFile);
  formData.append("model", openAIConfig.whisper.model);

  if (options.language || openAIConfig.whisper.language) {
    formData.append(
      "language",
      options.language || openAIConfig.whisper.language
    );
  }

  if (options.prompt) {
    formData.append("prompt", options.prompt);
  }

  const responseFormat =
    options.response_format || openAIConfig.whisper.responseFormat;
  formData.append("response_format", responseFormat);

  if (options.temperature !== undefined) {
    formData.append("temperature", options.temperature.toString());
  }

  const response = await fetch(
    "https://api.openai.com/v1/audio/transcriptions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAIConfig.apiKey}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to transcribe audio: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Translates audio to English using Whisper
 */
export async function translateAudio(
  audioFile: File,
  options: Omit<TranscriptionOptions, "language"> = {}
): Promise<TranscriptionResponse> {
  const formData = new FormData();
  formData.append("file", audioFile);
  formData.append("model", openAIConfig.whisper.model);

  if (options.prompt) {
    formData.append("prompt", options.prompt);
  }

  const responseFormat =
    options.response_format || openAIConfig.whisper.responseFormat;
  formData.append("response_format", responseFormat);

  const response = await fetch("https://api.openai.com/v1/audio/translations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openAIConfig.apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to translate audio: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Converts text to speech using TTS
 */
export async function textToSpeech(
  text: string,
  voice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer" = "alloy",
  model: "tts-1" | "tts-1-hd" = "tts-1"
): Promise<Blob> {
  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openAIConfig.apiKey}`,
    },
    body: JSON.stringify({
      model,
      voice,
      input: text,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate speech: ${response.statusText}`);
  }

  return response.blob();
}

/**
 * Records audio from the microphone
 */
export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  async start(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
    } catch (error) {
      console.error("Error starting audio recording:", error);
      throw error;
    }
  }

  stop(): Promise<File> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error("MediaRecorder not initialized"));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: "audio/webm" });
        const audioFile = new File([audioBlob], "recording.webm", {
          type: "audio/webm",
        });

        // Clean up
        if (this.stream) {
          this.stream.getTracks().forEach((track) => track.stop());
        }

        resolve(audioFile);
      };

      this.mediaRecorder.stop();
    });
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === "recording";
  }
}

/**
 * Hook for voice recording and transcription
 */
export function useVoiceRecorder() {
  const recorder = new AudioRecorder();

  const startRecording = async () => {
    await recorder.start();
  };

  const stopRecording = async (): Promise<TranscriptionResponse> => {
    const audioFile = await recorder.stop();
    return transcribeAudio(audioFile);
  };

  const isRecording = () => recorder.isRecording();

  return {
    startRecording,
    stopRecording,
    isRecording,
  };
}
