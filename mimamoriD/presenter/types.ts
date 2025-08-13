export interface TelemetryMessage {
  type: "telemetry";
  peak_index: number | null;
  data_values: number[];
  back_values: number[];
  filtered: number[];
}

export interface EventMessage {
  type: "event";
  peak_position: number | null;
  status: number; // 1: ベッド上, 2: 端座位, 3: 離床, 4: 訪問客
  person: 1 | 2 | null; // 1: 高齢者, 2: 他者
  message: string;
}

export type ConnectionStatus = "Connecting..." | "Connected" | "Disconnected" | "Error";
