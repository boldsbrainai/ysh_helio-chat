import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SpeakerLow, SpeakerHigh } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import useVideoSettings from "@/hooks/use-video-settings";
import { sendAnalyticsEvent } from "@/lib/analytics";

interface LogoVideoProps {
  videoSrc: string;
  logoSrc: string;
  showVideo: boolean; // control external state if needed
  onHideVideo?: () => void; // notify parent when video finished or should hide
  className?: string;
  loop?: boolean;
  autoPlay?: boolean;
  showControls?: boolean;
  onRequestPlay?: () => void;
}

export default function LogoVideo({
  videoSrc,
  logoSrc,
  className,
  showVideo,
  onHideVideo,
  loop = false,
  autoPlay = true,
  showControls = true,
  onRequestPlay,
}: LogoVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  // Use the global video settings persisted via useKV
  const { settings, setMuted, setVolume } = useVideoSettings();
  const [isMuted, setIsMutedLocal] = useState(settings.muted);
  const [volume, setVolumeLocal] = useState<number>(settings.volume);

  // Keep local state in sync when KV updates from other places
  useEffect(() => {
    if (settings.volume !== volume) setVolumeLocal(settings.volume);
    if (settings.muted !== isMuted) setIsMutedLocal(settings.muted);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.volume, settings.muted]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Ensure consistent volume/muted state
    video.volume = volume;
    video.muted = isMuted;

    if (autoPlay) {
      // Try play, but may be blocked by browser if unmuted
      video.play().catch(() => {
        // ignore autoplay errors
      });
    }
  }, [volume, isMuted, autoPlay]);

  useEffect(() => {
    // Persist to KV via hook whenever local volume/mute changes
    setVolume(volume);
    setMuted(isMuted);
  }, [volume, isMuted, setMuted, setVolume]);

  const handleVideoClick = async () => {
    const video = videoRef.current;
    if (!video) return;
    // restart animation
    video.currentTime = 0;
    video.play().catch(() => {});
    // For UX: unmute if user clicks and volume > 0
    if (isMuted && volume > 0) {
      setIsMutedLocal(false);
      setMuted(false);
    }
    onRequestPlay?.();
    // Track restart event
    sendAnalyticsEvent({ type: "video_restart", payload: { source: "video_click" } });
  };

  const onEnded = () => {
    if (onHideVideo) onHideVideo();
    // if not looping, set muted true? Keep as caller handles showVideo
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMutedLocal(nextMuted);
    setMuted(nextMuted);
    sendAnalyticsEvent({ type: "video_toggle_mute", payload: { muted: nextMuted } });
  };

  return (
    <div className={cn("relative", className)}>
      <AnimatePresence initial={false} mode="wait">
        {showVideo && (
          <motion.div
            key="video"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0"
          >
            <video
              ref={videoRef}
              src={videoSrc}
              className="w-full h-full object-cover cursor-pointer"
              autoPlay={autoPlay}
              playsInline
              muted={isMuted}
              onClick={handleVideoClick}
              onEnded={onEnded}
              loop={loop}
            />

            {/* Volume Controls */}
            {showControls && (
              <div className="absolute bottom-1 right-1 bg-black/40 backdrop-blur-sm rounded-md p-1 flex items-center gap-2">
              <button
                aria-label={isMuted ? "Ativar som" : "Desativar som"}
                className="text-white p-1 rounded-md hover:bg-white/10 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMute();
                }}
              >
                {isMuted ? <SpeakerLow size={16} /> : <SpeakerHigh size={16} />}
              </button>
              <input
                aria-label="Controle de volume"
                className="w-24"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setVolumeLocal(v);
                  if (videoRef.current) videoRef.current.volume = v;
                  if (v > 0 && isMuted) {
                    setIsMutedLocal(false);
                    setMuted(false);
                  }
                  sendAnalyticsEvent({ type: "video_volume_change", payload: { volume: v } });
                }}
              />
              </div>
            )}
          </motion.div>
        )}

        {!showVideo && (
          <motion.div
            key="logo"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0"
          >
            <img
              src={logoSrc}
              alt="Logo"
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => {
                  // Ask parent to show video (restart)
                  onRequestPlay?.();
                  // Track restart event
                  sendAnalyticsEvent({ type: "video_restart", payload: { source: "logo_click" } });
                }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
