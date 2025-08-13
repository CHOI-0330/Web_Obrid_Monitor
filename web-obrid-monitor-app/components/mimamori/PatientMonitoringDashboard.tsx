"use client";
import { useState, useEffect, useRef } from "react";
import { RoomCard, RoomStatus } from "./RoomCard";
import { AlertSection } from "./AlertSection";
import { ToastNotifications } from "./ToastNotifications";
import { RoomDetailModal } from "./RoomDetailModal";
import { Toaster } from "./ui/sonner";

interface RoomData { id: number; roomNumber: number; status: RoomStatus; lastUpdate: string; }
interface AlertData { id: string; roomNumber: number; status: "転倒" | "起立"; timestamp: string; }

export function PatientMonitoringDashboard() {
  const [rooms, setRooms] = useState<RoomData[]>([
    { id: 1, roomNumber: 101, status: "ベッド上", lastUpdate: tsNow() },
    { id: 2, roomNumber: 102, status: "ベッド上", lastUpdate: tsNow() },
    { id: 3, roomNumber: 103, status: "ベッド上", lastUpdate: tsNow() },
    { id: 4, roomNumber: 104, status: "ベッド上", lastUpdate: tsNow() },
    { id: 5, roomNumber: 105, status: "ベッド上", lastUpdate: tsNow() },
    { id: 6, roomNumber: 106, status: "ベッド上", lastUpdate: tsNow() },
  ]);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // WebSocket 연결: 서버가 MQTT.js(HTTP 수신)에서 브로드캐스트하는 이벤트/텔레메트리 수신
    const ws = new WebSocket("ws://localhost:8765");
    wsRef.current = ws;
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data as string) as any;
        if (msg && msg.type === "event") {
          const roomIndex = 0; // 단일 센서를 101호실에 매핑
          const mapped = mapEventToRoomStatus(msg.status as number, msg.person as number | null);
          const now = new Date();
          const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

          setRooms((prev) => {
            const next = [...prev];
            const prevStatus = next[roomIndex].status;
            next[roomIndex] = {
              ...next[roomIndex],
              status: mapped,
              lastUpdate: timestamp,
            };
            // 경고성 상태 변화시 알림 저장
            if ((mapped === "起立" || mapped === "転倒") && prevStatus !== mapped) {
              setAlerts((prevAlerts) => [
                { id: Date.now().toString(), roomNumber: next[roomIndex].roomNumber, status: mapped === "転倒" ? "転倒" : "起立", timestamp },
                ...prevAlerts,
              ]);
            }
            return next;
          });
        }
      } catch {
        // ignore non-JSON
      }
    };
    return () => ws.close();
  }, []);

  const dismissAlert = (alertId: string) => setAlerts(prev => prev.filter(a => a.id !== alertId));
  const handleRoomClick = (roomNumber: number) => { setSelectedRoom(roomNumber); setIsModalOpen(true); };
  const handleModalClose = () => { setIsModalOpen(false); setSelectedRoom(null); };
  const selectedRoomData = selectedRoom ? rooms.find(room => room.roomNumber === selectedRoom) : null;

  return (
    <div className="min-h-screen bg-gray-50 p-6" onClick={(e) => e.stopPropagation()}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl mb-2 text-gray-900">患者監視システム</h1>
          <p className="text-gray-600">リアルタイム患者状態検出および通知システム</p>
        </div>
        <AlertSection alerts={alerts} onDismiss={dismissAlert} />
        <div className="mb-8">
          <h2 className="text-xl mb-4 text-gray-900">病室状況</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map(room => (
              <RoomCard key={room.id} roomNumber={room.roomNumber} status={room.status} lastUpdate={room.lastUpdate} onClick={() => handleRoomClick(room.roomNumber)} />
            ))}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg mb-4 text-gray-900">状態凡例</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2"><div className="w-4 h-4 bg-green-500 rounded-full"></div><span className="text-sm text-gray-700">ベッド上 - 安全</span></div>
            <div className="flex items-center space-x-2"><div className="w-4 h-4 bg-blue-500 rounded-full"></div><span className="text-sm text-gray-700">面会中 - 正常</span></div>
            <div className="flex items-center space-x-2"><div className="w-4 h-4 bg-orange-500 rounded-full"></div><span className="text-sm text-gray-700">起立 - 注意</span></div>
            <div className="flex items-center space-x-2"><div className="w-4 h-4 bg-red-500 rounded-full"></div><span className="text-sm text-gray-700">転倒 - 緊急</span></div>
          </div>
        </div>
      </div>
      <ToastNotifications alerts={alerts} />
      <Toaster position="top-right" closeButton={true} richColors={true} />
      {selectedRoomData && (
        <RoomDetailModal isOpen={isModalOpen} onClose={handleModalClose} roomNumber={selectedRoomData.roomNumber} currentStatus={selectedRoomData.status} />
      )}
    </div>
  );
}

function tsNow(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function mapEventToRoomStatus(status: number, person: number | null): RoomStatus {
  // 서버 상태: 1 ベッド上, 2 端座位, 3 離床, 4 訪問客
  if (status === 1) return "ベッド上";
  if (status === 4) return "面会中";
  // 端座位/離床은 대시보드에서 주의 상태인 "起立"으로 매핑
  if (status === 2 || status === 3) return "起立";
  return "ベッド上";
}
