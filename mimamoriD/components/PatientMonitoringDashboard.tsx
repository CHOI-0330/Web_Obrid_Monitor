"use client";
import { useState, useEffect, useRef } from "react";
import { RoomCard, RoomStatus } from "./RoomCard";
import { AlertSection } from "./AlertSection";
import { ToastNotifications } from "./ToastNotifications";
import { RoomDetailModal } from "./RoomDetailModal";
import { Toaster } from "./ui/sonner";
import { useTelemetry } from "../presenter/useTelemetry";

interface RoomData {
  id: number;
  roomNumber: number;
  status: RoomStatus;
  lastUpdate: string;
}

interface AlertData {
  id: string;
  roomNumber: number;
  status: "転倒" | "起立";
  timestamp: string;
}

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
  const { eventMessage } = useTelemetry();

  // presenter에서 받은 eventMessage를 반영
  useEffect(() => {
    if (!eventMessage) return;
    const roomIndex = 0; // 単一センサーを101号室に割当て
    const mapped = mapEventToRoomStatus(eventMessage.status as number);
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    setRooms((prev) => {
      const next = [...prev];
      const prevStatus = next[roomIndex].status;
      next[roomIndex] = { ...next[roomIndex], status: mapped, lastUpdate: timestamp };
      if ((mapped === "起立" || mapped === "転倒") && prevStatus !== mapped) {
        setAlerts((prevAlerts) => [
          { id: Date.now().toString(), roomNumber: next[roomIndex].roomNumber, status: mapped === "転倒" ? "転倒" : "起立", timestamp },
          ...prevAlerts,
        ]);
      }
      return next;
    });
  }, [eventMessage]);

  const dismissAlert = (alertId: string) => {
    console.log('Dashboard dismissing alert:', alertId); // デバッグ用
    setAlerts(prevAlerts => {
      const newAlerts = prevAlerts.filter(alert => alert.id !== alertId);
      console.log('Alerts after dismiss:', newAlerts); // デバッグ用
      return newAlerts;
    });
  };

  const handleRoomClick = (roomNumber: number) => {
    setSelectedRoom(roomNumber);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedRoom(null);
  };

  const selectedRoomData = selectedRoom ? rooms.find(room => room.roomNumber === selectedRoom) : null;

  return (
    <div className="min-h-screen bg-gray-50 p-6" onClick={(e) => e.stopPropagation()}>
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl mb-2 text-gray-900">患者監視システム</h1>
          <p className="text-gray-600">リアルタイム患者状態検出および通知システム</p>
        </div>

        {/* 通知セクション */}
        <AlertSection alerts={alerts} onDismiss={dismissAlert} />

        {/* 病室状況グリッド */}
        <div className="mb-8">
          <h2 className="text-xl mb-4 text-gray-900">病室状況</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map(room => (
              <RoomCard
                key={room.id}
                roomNumber={room.roomNumber}
                status={room.status}
                lastUpdate={room.lastUpdate}
                onClick={() => handleRoomClick(room.roomNumber)}
              />
            ))}
          </div>
        </div>

        {/* 状態凡例 */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg mb-4 text-gray-900">状態凡例</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">ベッド上 - 安全</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-700">面会中 - 正常</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-gray-700">起立 - 注意</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-700">転倒 - 緊急</span>
            </div>
          </div>
        </div>
      </div>

      {/* トースト通知 */}
      <ToastNotifications alerts={alerts} />
      <Toaster 
        position="top-right" 
        closeButton={true}
        richColors={true}
      />

      {/* 詳細情報モーダル */}
      {selectedRoomData && (
        <RoomDetailModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          roomNumber={selectedRoomData.roomNumber}
          currentStatus={selectedRoomData.status}
        />
      )}
    </div>
  );
}

function tsNow(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function mapEventToRoomStatus(status: number): RoomStatus {
  // サーバーのステータス: 1 ベッド上, 2 端座位, 3 離床, 4 訪問客
  if (status === 1) return "ベッド上";
  if (status === 4) return "面会中";
  if (status === 2 || status === 3) return "起立"; // 注意扱い
  return "ベッド上";
}
