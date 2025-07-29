"use client";

import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";

interface TelemetryMessage {
  type: "telemetry";
  peak_index: number | null;
  data_values: number[];
  back_values: number[];
  filtered: number[];
}

export default function Grap() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<string>("Connecting...");
  const [introText, setIntroText] = useState<string>("");
  const [showIntro, setShowIntro] = useState<boolean>(true);
  const [fadeIntro, setFadeIntro] = useState<boolean>(false);

  // 타입스크립트용: telemetry 메시지인지 가드
  function isTelemetryMessage(msg: any): msg is TelemetryMessage {
    return (
      msg &&
      msg.type === "telemetry" &&
      Array.isArray(msg.data_values) &&
      Array.isArray(msg.back_values) &&
      Array.isArray(msg.filtered)
    );
  }

  // Intro 애니메이션
  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (fadeIntro) {
      const timer = setTimeout(() => setShowIntro(false), 900);
      return () => clearTimeout(timer);
    }
  }, [fadeIntro]);

  useEffect(() => {
    // 차트 초기화
    const ctx = chartRef.current?.getContext("2d");
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: "line",
        data: {
          labels: Array.from({ length: PIXEL }, (_, i) => i),
          datasets: [
            {
              label: "Data Values",
              data: [],
              borderColor: "#000000",
              backgroundColor: "transparent",
              fill: false,
              pointRadius: 0,
              pointHoverRadius: 0,
            },
            {
              label: "Back Values",
              data: [],
              borderColor: "#555555",
              backgroundColor: "transparent",
              fill: false,
              pointRadius: 0,
              pointHoverRadius: 0,
            },
            {
              label: "Filtered",
              data: [],
              borderColor: "#AAAAAA",
              backgroundColor: "transparent",
              fill: false,
              pointRadius: 0,
              pointHoverRadius: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
              labels: { color: "#000000" },
            },
          },
          scales: {
            x: {
              ticks: { color: "#000000" },
              grid: { color: "rgba(0,0,0,0.1)" },
            },
            y: {
              beginAtZero: true,
              max: 255,
              ticks: { color: "#000000" },
              grid: { color: "rgba(0,0,0,0.1)" },
            },
          },
        },
      });
    }

    // WebSocket 연결
    ws.current = new WebSocket("ws://localhost:8765");
    ws.current.onopen = () => setStatus("Connected");
    ws.current.onclose = () => setStatus("Disconnected");
    ws.current.onerror = () => setStatus("Error");

    ws.current.onmessage = (event) => {
      let msg: any;
      try {
        msg = JSON.parse(event.data);
      } catch {
        return;
      }
      // telemetry 메시지만 처리
      if (!isTelemetryMessage(msg)) {
        return;
      }
      const telemetry = msg;

      if (chartInstance.current) {
        chartInstance.current.data.datasets[0].data = telemetry.data_values;
        chartInstance.current.data.datasets[1].data = telemetry.back_values;
        chartInstance.current.data.datasets[2].data = telemetry.filtered;
        // 애니메이션 없이 즉시 반영
        chartInstance.current.update("none");
      }
    };

    return () => {
      chartInstance.current?.destroy();
      ws.current?.close();
    };
  }, []);

  const handleBackground = () => {
    ws.current?.send("update_background");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black px-4">
      {showIntro && (
        <div
          className={`fixed inset-0 flex items-center justify-center bg-white z-50 transition-opacity duration-500 ${
            fadeIntro ? "opacity-0" : "opacity-100"
          }`}
        >
          <h1 className="text-4xl font-bold">{introText}</h1>
        </div>
      )}
      <div className="relative w-full max-w-4xl h-[75vh] sm:h-[60vh] mb-6">
        <canvas ref={chartRef} className="absolute inset-0 w-full h-full" />
      </div>
      <button
        onClick={handleBackground}
        className="px-8 py-4 bg-black text-white rounded-full hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-black"
      >
        Background
      </button>
      <p className="mt-4 text-sm text-gray-600">{status}</p>
    </div>
  );
}

// 상수는 컴포넌트 바깥으로
const PIXEL = 256;
