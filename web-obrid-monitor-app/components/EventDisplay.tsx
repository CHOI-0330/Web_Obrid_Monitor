"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

interface EventMessage {
  type: "event";
  peak_position: number | null;
  status: 1 | 2 | 3 | 4;
  person: 1 | 2 | null;
  message: string;
}

const statusLabels: Record<EventMessage["status"], string> = {
  1: "ベッド上",
  2: "端座位",
  3: "離床",
  4: "来客中",
};

const personLabels: Record<Exclude<EventMessage["person"], null>, string> = {
  1: "高齢者",
  2: "来客",
};

// 개호 복지사가 직관적으로 이해할 수 있는 SVG 아이콘 컴포넌트 (기본 사이즈 50)
const BedIcon: React.FC<{ size?: number }> = ({ size = 50 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-blue-500"
  >
    <rect
      x="2"
      y="12"
      width="20"
      height="8"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
      fill="#E0F2FF"
    />
    <line
      x1="2"
      y1="16"
      x2="22"
      y2="16"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);

const SittingIcon: React.FC<{ size?: number }> = ({ size = 50 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-green-500"
  >
    <circle
      cx="12"
      cy="6"
      r="3"
      stroke="currentColor"
      strokeWidth="2"
      fill="#E6FFED"
    />
    <path
      d="M6 21V12H18V21"
      stroke="currentColor"
      strokeWidth="2"
      fill="#E6FFED"
    />
    <line
      x1="6"
      y1="21"
      x2="18"
      y2="21"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);

const WalkingIcon: React.FC<{ size?: number }> = ({ size = 50 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-orange-500"
  >
    <circle
      cx="12"
      cy="4"
      r="2"
      stroke="currentColor"
      strokeWidth="2"
      fill="#FFF5E6"
    />
    <path
      d="M12 6V10L9 14V18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M9 14H15L13 18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const VisitorIcon: React.FC<{ size?: number }> = ({ size = 50 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-purple-500"
  >
    <circle
      cx="8"
      cy="8"
      r="3"
      stroke="currentColor"
      strokeWidth="2"
      fill="#F5E6FF"
    />
    <circle
      cx="16"
      cy="8"
      r="3"
      stroke="currentColor"
      strokeWidth="2"
      fill="#F5E6FF"
    />
    <path
      d="M5 18C5 15.7909 6.79086 14 9 14H15C17.2091 14 19 15.7909 19 18V19H5V18Z"
      stroke="currentColor"
      strokeWidth="2"
      fill="#F5E6FF"
    />
  </svg>
);

export const EventDisplay: React.FC = () => {
  const [currentEvent, setCurrentEvent] = useState<EventMessage | null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8765");
    ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data) as EventMessage;
        if (data.type === "event") {
          setCurrentEvent(data);
        }
      } catch {
        // ignore invalid messages
      }
    };
    return () => ws.close();
  }, []);

  const status = currentEvent?.status ?? 1;
  const peakPosition = currentEvent?.peak_position;
  const person = currentEvent?.person;
  const message = currentEvent?.message;

  const renderStatusIcon = (status: EventMessage["status"]) => {
    switch (status) {
      case 1:
        return <BedIcon />; // 침대 위
      case 2:
        return <SittingIcon />; // 의자에 앉은 상태
      case 3:
        return <WalkingIcon />; // 이동 중
      case 4:
        return <VisitorIcon />; // 방문자 있음
      default:
        return null;
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="card p-4 space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted">最新イベント</div>
          <Link href="/grap" className="text-sm text-brand hover:underline">
            詳細
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-muted text-xs">ピーク位置</div>
            <div className="font-medium">
              {peakPosition != null ? peakPosition.toFixed(1) : "–"}
            </div>
          </div>

          <div>
            <div className="text-muted text-xs">状態</div>
            <div className="flex items-center justify-between font-medium">
              <span>{statusLabels[status]}</span>
              {renderStatusIcon(status)}
            </div>
          </div>

          <div>
            <div className="text-muted text-xs">対象者</div>
            <div className="font-medium">
              {person != null ? personLabels[person] : "未検出"}
            </div>
          </div>

          <div>
            <div className="text-muted text-xs">メッセージ</div>
            <div className="font-medium">{message || "–"}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
