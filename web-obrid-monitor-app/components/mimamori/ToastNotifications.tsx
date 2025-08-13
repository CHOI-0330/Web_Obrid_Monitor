"use client";
import { useEffect } from "react";
import { toast } from "sonner";
import { AlertTriangle, User, X } from "lucide-react";

interface ToastNotificationsProps {
  alerts: Array<{ id: string; roomNumber: number; status: "転倒" | "起立"; timestamp: string; }>;
}

export function ToastNotifications({ alerts }: ToastNotificationsProps) {
  useEffect(() => {
    const latestAlert = alerts[0];
    if (latestAlert) {
      const isEmergency = latestAlert.status === "転倒";
      toast(
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-3">
            {isEmergency ? (<AlertTriangle className="h-5 w-5 text-red-600" />) : (<User className="h-5 w-5 text-orange-600" />)}
            <div>
              <div className="font-medium">{isEmergency ? "緊急事態検出！" : "患者の動き検出"}</div>
              <div className="text-sm text-gray-600">{latestAlert.roomNumber}号室で{latestAlert.status}状態を検出</div>
            </div>
          </div>
        </div>,
        {
          id: latestAlert.id,
          duration: 8000,
          position: "top-right",
          dismissible: true,
          closeButton: true,
          style: { background: isEmergency ? "#fef2f2" : "#fff7ed", border: `1px solid ${isEmergency ? "#fca5a5" : "#fed7aa"}`, color: isEmergency ? "#991b1b" : "#9a3412" },
          action: { label: <X className="h-4 w-4" />, onClick: () => toast.dismiss(latestAlert.id) }
        }
      );
    }
  }, [alerts.length]);
  return null;
}
