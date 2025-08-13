import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Bed, AlertTriangle, Users, User } from "lucide-react";

export type RoomStatus = "ベッド上" | "転倒" | "面会中" | "起立";

interface RoomCardProps {
  roomNumber: number;
  status: RoomStatus;
  lastUpdate: string;
  onClick?: () => void;
}

export function RoomCard({ roomNumber, status, lastUpdate, onClick }: RoomCardProps) {
  const getStatusConfig = (status: RoomStatus) => {
    switch (status) {
      case "ベッド上":
        return {
          icon: Bed,
          color: "bg-green-100 text-green-800 border-green-200",
          iconColor: "text-green-600",
          bgColor: "bg-green-50"
        };
      case "転倒":
        return {
          icon: AlertTriangle,
          color: "bg-red-100 text-red-800 border-red-200",
          iconColor: "text-red-600",
          bgColor: "bg-red-50"
        };
      case "面会中":
        return {
          icon: Users,
          color: "bg-blue-100 text-blue-800 border-blue-200",
          iconColor: "text-blue-600",
          bgColor: "bg-blue-50"
        };
      case "起立":
        return {
          icon: User,
          color: "bg-orange-100 text-orange-800 border-orange-200",
          iconColor: "text-orange-600",
          bgColor: "bg-orange-50"
        };
    }
  };

  const config = getStatusConfig(status);
  const IconComponent = config.icon;
  const isAlert = status === "転倒" || status === "起立";

  return (
    <Card 
      className={`p-6 transition-all duration-300 hover:shadow-lg cursor-pointer ${config.bgColor} ${
        isAlert ? "ring-2 ring-red-400 animate-pulse" : ""
      } hover:scale-105`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {roomNumber}号室
        </h3>
        {isAlert && (
          <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
        )}
      </div>
      
      <div className="flex items-center space-x-4 mb-4">
        <div className={`p-4 rounded-full ${config.bgColor}`}>
          <IconComponent className={`w-12 h-12 ${config.iconColor}`} />
        </div>
        <div className="flex-1">
          <Badge className={`${config.color} px-3 py-1 text-sm`}>
            {status}
          </Badge>
        </div>
      </div>
      
      <div className="text-sm text-gray-600">
        <p>最終更新: {lastUpdate}</p>
        <p className="text-xs text-gray-500 mt-1">クリックで詳細情報を表示</p>
      </div>
    </Card>
  );
}