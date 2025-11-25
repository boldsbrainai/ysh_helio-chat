/**
 * Voice Agent Component
 *
 * Provides voice input/output capabilities using OpenAI Whisper and TTS
 */

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Microphone,
  Stop,
  SpeakerHigh,
  PaperPlaneRight,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { transcribeAudio, textToSpeech, AudioRecorder } from "@/lib/openai";

interface VoiceAgentProps {
  /**
   * Callback when transcription is complete
   */
  onTranscription?: (text: string) => void;

  /**
   * Callback when voice message should be sent
   */
  onSendMessage?: (text: string) => void;

  /**
   * Whether to show the transcript
   */
  showTranscript?: boolean;

  /**
   * Custom CSS class
   */
  className?: string;
}

export function VoiceAgent({
  onTranscription,
  onSendMessage,
  showTranscript = true,
  className = "",
}: VoiceAgentProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [audioLevel, setAudioLevel] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recorderRef = useRef<AudioRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);

  // Initialize audio analysis
  const initAudioAnalysis = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();

      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      analyserRef.current.fftSize = 256;
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

      const updateLevel = () => {
        if (!analyserRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel((average / 255) * 100);

        if (isRecording) {
          animationFrameRef.current = requestAnimationFrame(updateLevel);
        }
      };

      updateLevel();
    } catch (error) {
      console.error("Error initializing audio analysis:", error);
    }
  }, [isRecording]);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      recorderRef.current = new AudioRecorder();
      await recorderRef.current.start();
      await initAudioAnalysis();
      setIsRecording(true);
      setTranscript("");
      toast.success("Gravação iniciada");
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Erro ao iniciar gravação", {
        description:
          error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }, [initAudioAnalysis]);

  // Stop recording and transcribe
  const stopRecording = useCallback(async () => {
    if (!recorderRef.current) return;

    try {
      setIsProcessing(true);
      setIsRecording(false);

      // Stop audio analysis
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }

      const audioFile = await recorderRef.current.stop();

      // Transcribe
      const result = await transcribeAudio(audioFile, {
        language: "pt",
        response_format: "verbose_json",
      });

      setTranscript(result.text);
      onTranscription?.(result.text);

      toast.success("Transcrição concluída");
    } catch (error) {
      console.error("Error stopping recording:", error);
      toast.error("Erro ao processar áudio", {
        description:
          error instanceof Error ? error.message : "Erro desconhecido",
      });
    } finally {
      setIsProcessing(false);
      recorderRef.current = null;
    }
  }, [onTranscription]);

  // Send transcript as message
  const handleSend = useCallback(() => {
    if (!transcript.trim()) return;
    onSendMessage?.(transcript);
    setTranscript("");
  }, [transcript, onSendMessage]);

  // Speak text using TTS
  const speak = useCallback(async (text: string) => {
    try {
      setIsSpeaking(true);
      const audioBlob = await textToSpeech(text, "alloy", "tts-1");
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error("Error speaking text:", error);
      setIsSpeaking(false);
      toast.error("Erro ao reproduzir áudio");
    }
  }, []);

  return (
    <Card className={`${className} p-6 space-y-4 border-2 shadow-lg`}>
      {/* Recording Status */}
      <div className="text-center space-y-3">
        <AnimatePresence mode="wait">
          {isRecording && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="space-y-2"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="inline-flex w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-600 items-center justify-center shadow-xl"
              >
                <Microphone size={32} weight="fill" className="text-white" />
              </motion.div>
              <p className="text-sm font-bold text-foreground">Gravando...</p>
              <Progress value={audioLevel} className="h-2" />
            </motion.div>
          )}

          {isProcessing && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="space-y-2"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="inline-flex w-20 h-20 rounded-full bg-gradient-to-br from-accent to-accent/80 items-center justify-center shadow-xl"
              >
                <Microphone size={32} weight="fill" className="text-white" />
              </motion.div>
              <p className="text-sm font-bold text-foreground">
                Processando áudio...
              </p>
            </motion.div>
          )}

          {!isRecording && !isProcessing && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="space-y-2"
            >
              <div className="inline-flex w-20 h-20 rounded-full bg-gradient-to-br from-muted to-muted/60 items-center justify-center">
                <Microphone
                  size={32}
                  weight="bold"
                  className="text-muted-foreground"
                />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                Clique para gravar
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex gap-3 justify-center">
        {!isRecording && !isProcessing && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="lg"
              onClick={startRecording}
              className="bg-gradient-to-br from-accent to-accent/80 shadow-lg"
            >
              <Microphone className="mr-2" size={20} weight="bold" />
              Iniciar Gravação
            </Button>
          </motion.div>
        )}

        {isRecording && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="lg"
              onClick={stopRecording}
              variant="destructive"
              className="shadow-lg"
            >
              <Stop className="mr-2" size={20} weight="fill" />
              Parar Gravação
            </Button>
          </motion.div>
        )}
      </div>

      {/* Transcript */}
      {showTranscript && transcript && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="bg-muted/40 rounded-lg p-4 border border-border/50">
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wide mb-2">
              Transcrição
            </p>
            <p className="text-sm text-foreground leading-relaxed">
              {transcript}
            </p>
          </div>

          <div className="flex gap-2">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex-1"
            >
              <Button
                onClick={handleSend}
                disabled={!transcript.trim()}
                className="w-full shadow-md"
              >
                <PaperPlaneRight className="mr-2" size={18} weight="fill" />
                Enviar Mensagem
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                onClick={() => speak(transcript)}
                disabled={isSpeaking}
                variant="outline"
                className="shadow-md"
              >
                <SpeakerHigh size={18} weight={isSpeaking ? "fill" : "bold"} />
              </Button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </Card>
  );
}
