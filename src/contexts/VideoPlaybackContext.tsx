import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

interface VideoPlaybackContextValue {
  showVideo: boolean;
  hideVideo: () => void;
  requestReplay: () => void;
}

const VideoPlaybackContext = createContext<VideoPlaybackContextValue | undefined>(undefined);
const INTRO_DISPLAY_DURATION = 8000; // ms

function VideoPlaybackProvider({ children }: { children: React.ReactNode }) {
  const [showVideo, setShowVideo] = useState(true);
  const timerRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const scheduleHide = useCallback(() => {
    clearTimer();
    timerRef.current = window.setTimeout(() => {
      setShowVideo(false);
    }, INTRO_DISPLAY_DURATION);
  }, [clearTimer]);

  useEffect(() => {
    scheduleHide();
    return () => clearTimer();
  }, [scheduleHide, clearTimer]);

  const hideVideo = useCallback(() => {
    setShowVideo(false);
    clearTimer();
  }, [clearTimer]);

  const requestReplay = useCallback(() => {
    setShowVideo(true);
    scheduleHide();
  }, [scheduleHide]);

  const value = useMemo(
    () => ({
      showVideo,
      hideVideo,
      requestReplay,
    }),
    [showVideo, hideVideo, requestReplay]
  );

  return <VideoPlaybackContext.Provider value={value}>{children}</VideoPlaybackContext.Provider>;
}

function useVideoPlayback() {
  const ctx = useContext(VideoPlaybackContext);
  if (!ctx) {
    throw new Error("useVideoPlayback must be used within VideoPlaybackProvider");
  }
  return ctx;
}

export { VideoPlaybackProvider, useVideoPlayback };
