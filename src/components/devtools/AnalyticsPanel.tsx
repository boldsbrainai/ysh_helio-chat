import { useEffect, useState } from "react";
import { subscribeToAnalyticsStream } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AnalyticsMessage {
  id: number;
  type: string;
  timestamp: string;
  payload?: string;
}

export function AnalyticsPanel() {
  const [messages, setMessages] = useState<AnalyticsMessage[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!isSubscribed) return;

    const unsubscribe = subscribeToAnalyticsStream((data) => {
      setMessages((prev) => {
        const next = [
          {
            id: Date.now(),
            type: data.type ?? "unknown",
            timestamp: new Date().toLocaleTimeString(),
            payload: typeof data.payload === "object" ? JSON.stringify(data.payload) : String(data.payload ?? ""),
          },
          ...prev,
        ];
        return next.slice(0, 50);
      });
    });

    return () => unsubscribe();
  }, [isSubscribed]);

  return (
    <div className="w-full max-w-md bg-card border rounded-xl shadow-md">
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <div>
          <p className="text-sm font-semibold">Painel de Analytics (SSE)</p>
          <p className="text-xs text-muted-foreground">Monitora /api/analytics/stream</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => setIsSubscribed((v) => !v)}>
          {isSubscribed ? "Parar" : "Iniciar"}
        </Button>
      </div>
      <ScrollArea className="h-48">
        {messages.length === 0 && (
          <p className="text-xs text-muted-foreground px-4 py-3">
            {isSubscribed ? "Aguardando eventos..." : "Clique em Iniciar para conectar"}
          </p>
        )}
        <div className="divide-y">
          {messages.map((msg) => (
            <div key={msg.id} className="px-4 py-2 text-xs">
              <div className="flex justify-between">
                <span className="font-medium">{msg.type}</span>
                <span className="text-muted-foreground">{msg.timestamp}</span>
              </div>
              {msg.payload && <pre className="mt-1 bg-muted/50 rounded p-2 text-[11px] overflow-x-auto">{msg.payload}</pre>}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

export default AnalyticsPanel;
