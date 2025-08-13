import { ConnectionStatus, EventMessage, TelemetryMessage } from "./types";

export type WsHandlers = {
  onStatus?: (s: ConnectionStatus) => void;
  onTelemetry?: (t: TelemetryMessage) => void;
  onEvent?: (e: EventMessage) => void;
};

export class WsClient {
  private socket: WebSocket | null = null;
  private handlers: WsHandlers;

  constructor(handlers: WsHandlers = {}) {
    this.handlers = handlers;
  }

  connect() {
    const url = getWsUrl();
    this.socket = new WebSocket(url);
    this.socket.onopen = () => {
      this.handlers.onStatus?.("Connected");
      // initialize background for server_beta.js
      try { this.socket?.send("update_background"); } catch {}
    };
    this.socket.onclose = () => this.handlers.onStatus?.("Disconnected");
    this.socket.onerror = () => this.handlers.onStatus?.("Error");
    this.socket.onmessage = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data as string);
        if (msg?.type === "telemetry") this.handlers.onTelemetry?.(msg as TelemetryMessage);
        else if (msg?.type === "event") this.handlers.onEvent?.(msg as EventMessage);
      } catch {
        // ignore
      }
    };
  }

  sendBackgroundUpdate() {
    this.socket?.send("update_background");
  }

  close() {
    this.socket?.close();
  }
}

export function getWsUrl(): string {
  if (typeof window === "undefined") return process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8765";
  const envUrl = process.env.NEXT_PUBLIC_WS_URL;
  if (envUrl) return envUrl;
  const isHttps = window.location.protocol === "https:";
  const proto = isHttps ? "wss" : "ws";
  const host = window.location.hostname;
  const port = 8765;
  return `${proto}://${host}:${port}`;
}
