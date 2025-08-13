"use client";
import { useState } from "react";
import { AlertNotification } from "./AlertNotification";
import { Button } from "./ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";

interface AlertData { id: string; roomNumber: number; status: "転倒" | "起立"; timestamp: string; }
interface AlertSectionProps { alerts: AlertData[]; onDismiss: (alertId: string) => void; }

export function AlertSection({ alerts, onDismiss }: AlertSectionProps) {
  const [showAll, setShowAll] = useState(false);
  if (alerts.length === 0) return null;
  const visibleAlerts = showAll ? alerts : alerts.slice(0, 2);
  const hiddenCount = alerts.length - 2;
  const handleToggleShowAll = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); setShowAll(!showAll); };
  const handleDismissAlert = (alertId: string) => onDismiss(alertId);

  return (
    <div className="mb-8" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl text-gray-900">アクティブ通知 ({alerts.length})</h2>
        {hiddenCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleToggleShowAll} className="flex items-center space-x-1" type="button">
            <span>{showAll ? "折りたたむ" : `他${hiddenCount}件を表示`}</span>
            {showAll ? (<ChevronUp className="h-4 w-4" />) : (<ChevronDown className="h-4 w-4" />)}
          </Button>
        )}
      </div>
      {showAll ? (
        <ScrollArea className="max-h-96">
          <div className="space-y-3 pr-4">
            {alerts.map(alert => (
              <div key={alert.id} onClick={(e) => e.stopPropagation()}>
                <AlertNotification roomNumber={alert.roomNumber} status={alert.status} timestamp={alert.timestamp} onDismiss={() => handleDismissAlert(alert.id)} />
              </div>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="space-y-3">
          {visibleAlerts.map(alert => (
            <div key={alert.id} onClick={(e) => e.stopPropagation()}>
              <AlertNotification roomNumber={alert.roomNumber} status={alert.status} timestamp={alert.timestamp} onDismiss={() => handleDismissAlert(alert.id)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
