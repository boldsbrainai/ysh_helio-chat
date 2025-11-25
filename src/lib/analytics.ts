export interface AnalyticsEvent {
  type: string;
  timestamp?: number;
  payload?: any;
}

export async function sendAnalyticsEvent(event: AnalyticsEvent) {
  try {
    await fetch("/api/analytics/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...event, timestamp: Date.now() }),
    });
  } catch (e) {
    // Don't fail UI - analytics is best-effort
    console.warn("Failed to send analytics event:", e);
  }
}

// Optionally expose SSE client subscription helper
export function subscribeToAnalyticsStream(onmessage: (data: any) => void) {
  try {
    const es = new EventSource("/api/analytics/stream");
    es.onmessage = (evt) => {
      try {
        const parsed = JSON.parse(evt.data);
        onmessage(parsed);
      } catch {
        onmessage(evt.data);
      }
    };
    return () => es.close();
  } catch (err) {
    console.warn("EventSource not supported or failed to connect", err);
    return () => {};
  }
}
