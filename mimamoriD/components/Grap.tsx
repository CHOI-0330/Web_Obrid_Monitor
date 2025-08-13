"use client";

import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { Button } from "./ui/button";
import { useTelemetry } from "../presenter/useTelemetry";

interface TelemetryMessage {
  type: "telemetry";
  peak_index: number | null;
  data_values: number[];
  back_values: number[];
  filtered: number[];
}

interface GrapProps {
  heightClass?: string;
  disableIntro?: boolean;
  variant?: "standalone" | "embedded";
}

export default function Grap({
  heightClass,
  disableIntro,
  variant = "standalone",
}: GrapProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const { status, telemetry, actions } = useTelemetry();
  const [introText, setIntroText] = useState<string>("");
  const [showIntro, setShowIntro] = useState<boolean>(true);
  const [fadeIntro, setFadeIntro] = useState<boolean>(false);
  const [peakIndex, setPeakIndex] = useState<number | null>(null);
  const [colors, setColors] = useState<{
    data: string;
    back: string;
    filtered: string;
    tick: string;
    grid: string;
  }>({
    data: "#0f172a",
    back: "#64748b",
    filtered: "#94a3b8",
    tick: "#0f172a",
    grid: "rgba(0,0,0,0.08)",
  });

  function isTelemetryMessage(msg: unknown): msg is TelemetryMessage {
    if (typeof msg !== "object" || msg === null) return false;
    const m = msg as Record<string, unknown>;
    return (
      m.type === "telemetry" &&
      Array.isArray(m.data_values) &&
      Array.isArray(m.back_values) &&
      Array.isArray(m.filtered)
    );
  }

  // Resolve design-token colors for Chart.js
  useEffect(() => {
    const root = document.documentElement;
    const getVar = (name: string, fallback: string) =>
      getComputedStyle(root).getPropertyValue(name).trim() || fallback;
    setColors({
      data: getVar("--color-chart-1", "#0f172a"),
      back: getVar("--color-chart-2", "#64748b"),
      filtered: getVar("--color-chart-3", "#94a3b8"),
      tick: getVar("--color-foreground", "#0f172a"),
      grid: getVar("--color-border", "rgba(0,0,0,0.08)"),
    });
  }, []);

  // Intro 애니메이션 (옵션)
  useEffect(() => {
    if (disableIntro || variant === "embedded") {
      setShowIntro(false);
      return;
    }
    const text = "Nakashima Lab.";
    let index = 0;
    const id = setInterval(() => {
      setIntroText(text.slice(0, index));
      index += 1;
      if (index > text.length) {
        clearInterval(id);
        setTimeout(() => setFadeIntro(true), 400);
      }
    }, 100);
    return () => clearInterval(id);
  }, [disableIntro]);

  useEffect(() => {
    if (fadeIntro) {
      const timer = setTimeout(() => setShowIntro(false), 900);
      return () => clearTimeout(timer);
    }
  }, [fadeIntro]);

  useEffect(() => {
    const ctx = chartRef.current?.getContext("2d");
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: "line",
        data: {
          labels: Array.from({ length: PIXEL }, (_, i) => i),
          datasets: [
            {
              label: "Data",
              data: [],
              borderColor: colors.data,
              backgroundColor: "transparent",
              fill: false,
              pointRadius: 0,
              pointHoverRadius: 0,
              tension: 0.15,
            },
            {
              label: "Background",
              data: [],
              borderColor: colors.back,
              backgroundColor: "transparent",
              fill: false,
              pointRadius: 0,
              pointHoverRadius: 0,
              borderDash: [4, 4],
              tension: 0.15,
            },
            {
              label: "Filtered",
              data: [],
              borderColor: colors.filtered,
              backgroundColor: "transparent",
              fill: false,
              pointRadius: 0,
              pointHoverRadius: 0,
              tension: 0.15,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "bottom", labels: { color: "#000000" } },
          },
          scales: {
            x: { ticks: { color: colors.tick }, grid: { color: colors.grid } },
            y: {
              beginAtZero: true,
              max: 255,
              ticks: { color: colors.tick },
              grid: { color: colors.grid },
            },
          },
        },
      });
    }

    return () => {
      chartInstance.current?.destroy();
    };
  }, []);

  // reflect telemetry updates
  useEffect(() => {
    if (!telemetry || !chartInstance.current) return;
    setPeakIndex(telemetry.peak_index);
    chartInstance.current.data.datasets[0].data = telemetry.data_values;
    chartInstance.current.data.datasets[1].data = telemetry.back_values;
    chartInstance.current.data.datasets[2].data = telemetry.filtered;
    chartInstance.current.update("none");
  }, [telemetry]);

  const handleBackground = () => actions.updateBackground();

  const renderLegendChip = (color: string, label: string) => (
    <span
      className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border"
      style={{ borderColor: "var(--color-border)" }}
    >
      <span
        className="w-2.5 h-2.5 rounded-full"
        style={{ background: color }}
      />
      <span className="text-xs" style={{ color: "var(--color-foreground)" }}>
        {label}
      </span>
    </span>
  );

  const content = (
    <>
      {showIntro && (
        <div
          className={`fixed inset-0 flex items-center justify-center bg-white z-50 transition-opacity duration-500 ${
            fadeIntro ? "opacity-0" : "opacity-100"
          }`}
        >
          <h1 className="text-4xl font-bold">{introText}</h1>
        </div>
      )}

      {/* Header / Toolbar */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-2 px-2 py-1 rounded-full border text-xs"
            style={{
              borderColor: "var(--color-border)",
              color: "var(--color-foreground)",
            }}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                status === "Connected"
                  ? "bg-green-500"
                  : status === "Error"
                  ? "bg-red-500"
                  : "bg-yellow-500"
              }`}
            />
            {status}
          </span>
        </div>
      </div>

      {/* Chart area */}
      <div
        className={`relative w-full ${
          heightClass ?? "h-[70vh] sm:h-[60vh]"
        } rounded-lg border`}
        style={{ borderColor: "var(--color-border)" }}
      >
        <canvas ref={chartRef} className="absolute inset-0 w-full h-full" />
      </div>

      {/* Meta */}
      <div
        className="mt-3 flex items-center justify-between text-xs"
        style={{ color: "var(--color-muted)" }}
      >
        <span>ピーク位置: {peakIndex == null ? "–" : peakIndex}</span>
        <span className="hidden sm:inline">更新: WebSocket</span>
      </div>

      {/* Footer Controls */}
      <div className="mt-3 flex justify-end">
        <Button size="sm" onClick={handleBackground}>
          Background
        </Button>
      </div>
    </>
  );

  if (variant === "embedded") {
    return <div className="w-full">{content}</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center px-4">
      <div className={`w-full max-w-4xl card p-4`}>{content}</div>
    </div>
  );
}

const PIXEL = 256;
