"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { ConnectionStatus, EventMessage, TelemetryMessage } from "./types";
import { WsClient } from "./wsClient";

export function useTelemetry() {
  const [status, setStatus] = useState<ConnectionStatus>("Connecting...");
  const [telemetry, setTelemetry] = useState<TelemetryMessage | null>(null);
  const [eventMessage, setEventMessage] = useState<EventMessage | null>(null);
  const clientRef = useRef<WsClient | null>(null);

  useEffect(() => {
    const client = new WsClient({
      onStatus: setStatus,
      onTelemetry: setTelemetry,
      onEvent: setEventMessage,
    });
    clientRef.current = client;
    client.connect();
    return () => client.close();
  }, []);

  const actions = useMemo(() => ({
    updateBackground: () => clientRef.current?.sendBackgroundUpdate(),
  }), []);

  return { status, telemetry, eventMessage, actions };
}
