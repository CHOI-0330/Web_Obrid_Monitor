import { AlertTriangle, User, X } from "lucide-react";
import { Button } from "./ui/button";

interface AlertNotificationProps { roomNumber: number; status: "転倒" | "起立"; timestamp: string; onDismiss: () => void; }

export function AlertNotification({ roomNumber, status, timestamp, onDismiss }: AlertNotificationProps) {
  const isEmergency = status === "転倒";
  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Best-effort to stop bubbling from custom handlers
    const nativeEvt = (e as unknown as { nativeEvent?: { stopImmediatePropagation?: () => void } }).nativeEvent;
    nativeEvt?.stopImmediatePropagation?.();
    onDismiss();
  };
  const handleAlertClick = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); };
  return (
    <div className={`${isEmergency ? "border-red-500 bg-red-50 text-red-900" : "border-orange-500 bg-orange-50 text-orange-900"} p-4 rounded-lg border mb-4`} onClick={handleAlertClick}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          {isEmergency ? (<AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />) : (<User className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />)}
          <div className="flex-1">
            <div className="mb-1"><h4 className={`font-medium ${isEmergency ? 'text-red-900' : 'text-orange-900'}`}>{isEmergency ? "緊急事態検出！" : "患者の動き検出"}</h4></div>
            <div className={`text-sm ${isEmergency ? 'text-red-800' : 'text-orange-800'}`}>
              <p><strong>{roomNumber}号室</strong>で<strong>{status}</strong>状態が検出されました。</p>
              <p className="mt-1">時刻: {timestamp}</p>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleDismiss} onMouseDown={handleDismiss} className="h-8 w-8 p-0 hover:bg-transparent flex-shrink-0 ml-2" aria-label="通知を閉じる" type="button">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
