import { useCallback, useEffect } from "react";
import { useKV } from "@github/spark/hooks";

export interface VideoSettings {
  volume: number;
  muted: boolean;
}

export function useVideoSettings() {
  // Key in KV that will store the object { volume, muted }
  const [settings, setSettings] = useKV<VideoSettings | null>("video-player-settings", null);

  const setVolume = useCallback(
    (volume: number) => {
      setSettings((s) => ({ ...(s ?? { volume: 0.8, muted: false }), volume }));
    },
    [setSettings]
  );

  const setMuted = useCallback(
    (muted: boolean) => {
      setSettings((s) => ({ ...(s ?? { volume: 0.8, muted: false }), muted }));
    },
    [setSettings]
  );

  const defaults = { volume: 0.8, muted: true };

  useEffect(() => {
    if (settings === null) {
      setSettings(defaults);
    }
  }, [settings, setSettings]);

  return {
    settings: settings ?? defaults,
    setVolume,
    setMuted,
    setSettings,
  } as const;
}

export default useVideoSettings;
