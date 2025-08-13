import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";
import Grap from "./Grap";
import {
  AlertTriangle,
  User,
  Bed,
  Users,
  Clock,
  TrendingUp,
} from "lucide-react";
import { RoomStatus } from "./RoomCard";

interface PatientInfo {
  name: string;
  age: number;
  gender: string;
  admissionDate: string;
  condition: string;
  riskLevel: "低" | "中" | "高";
}

interface LogEntry {
  id: string;
  timestamp: string;
  status: RoomStatus;
  duration: string;
  notes?: string;
}

interface RoomDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomNumber: number;
  currentStatus: RoomStatus;
}

export function RoomDetailModal({
  isOpen,
  onClose,
  roomNumber,
  currentStatus,
}: RoomDetailModalProps) {
  // 模擬患者情報
  const patientInfo: PatientInfo = {
    name: `患者 ${roomNumber}`,
    age: 72,
    gender: "女性",
    admissionDate: "2025-08-01",
    condition: "骨折回復期",
    riskLevel: roomNumber === 103 ? "高" : roomNumber === 105 ? "中" : "低",
  };

  // 模擬ログデータ
  const logs: LogEntry[] = [
    {
      id: "1",
      timestamp: "2025-08-05 14:35:23",
      status: "転倒",
      duration: "即座に検出",
      notes: "ベッド付近で検出",
    },
    {
      id: "2",
      timestamp: "2025-08-05 14:30:15",
      status: "起立",
      duration: "5分",
      notes: "トイレ移動",
    },
    {
      id: "3",
      timestamp: "2025-08-05 14:25:00",
      status: "ベッド上",
      duration: "30分",
      notes: "安定状態",
    },
    {
      id: "4",
      timestamp: "2025-08-05 13:55:30",
      status: "面会中",
      duration: "15分",
      notes: "看護師との会話",
    },
    {
      id: "5",
      timestamp: "2025-08-05 13:40:00",
      status: "ベッド上",
      duration: "45分",
      notes: "睡眠中",
    },
  ];

  const getStatusIcon = (status: RoomStatus) => {
    switch (status) {
      case "ベッド上":
        return <Bed className="w-4 h-4" />;
      case "転倒":
        return <AlertTriangle className="w-4 h-4" />;
      case "面会中":
        return <Users className="w-4 h-4" />;
      case "起立":
        return <User className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: RoomStatus) => {
    switch (status) {
      case "ベッド上":
        return "bg-green-100 text-green-800";
      case "転倒":
        return "bg-red-100 text-red-800";
      case "面会中":
        return "bg-blue-100 text-blue-800";
      case "起立":
        return "bg-orange-100 text-orange-800";
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "低":
        return "bg-green-100 text-green-800";
      case "中":
        return "bg-yellow-100 text-yellow-800";
      case "高":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const fallRiskAnalysis = {
    score:
      patientInfo.riskLevel === "高"
        ? 85
        : patientInfo.riskLevel === "中"
        ? 45
        : 20,
    factors:
      patientInfo.riskLevel === "高"
        ? [
            "過去24時間で2回の転倒発生",
            "夜間時間帯の頻繁な移動",
            "薬物服用によるめまいの可能性",
          ]
        : patientInfo.riskLevel === "中"
        ? ["断続的な無断移動", "年齢を考慮すると注意が必要"]
        : ["安定した動きパターン", "規則正しい生活パターンを維持"],
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:w-[90vw] lg:w-[80vw] xl:w-[75vw] max-w-6xl max-h-[88vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>{roomNumber}号室 詳細情報</span>
            <Badge className={getStatusColor(currentStatus)}>
              {getStatusIcon(currentStatus)}
              <span className="ml-1">{currentStatus}</span>
            </Badge>
          </DialogTitle>
          <DialogDescription>
            患者情報、状態ログ、リスク分析、リアルタイム監視データを確認できます
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="h-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">患者情報</TabsTrigger>
            <TabsTrigger value="logs">状態ログ</TabsTrigger>
            <TabsTrigger value="analysis">リスク分析</TabsTrigger>
            <TabsTrigger value="monitoring">リアルタイム監視</TabsTrigger>
          </TabsList>

          <ScrollArea className="mt-4 max-h-[calc(88vh-140px)]">
            <TabsContent value="overview" className="space-y-4">
              <Card className="p-6">
                <h3 className="mb-4">患者基本情報</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">氏名</label>
                    <p className="font-medium">{patientInfo.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">年齢</label>
                    <p className="font-medium">{patientInfo.age}歳</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">性別</label>
                    <p className="font-medium">{patientInfo.gender}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">入院日</label>
                    <p className="font-medium">{patientInfo.admissionDate}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">診断名</label>
                    <p className="font-medium">{patientInfo.condition}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">
                      リスクレベル
                    </label>
                    <Badge className={getRiskLevelColor(patientInfo.riskLevel)}>
                      {patientInfo.riskLevel}
                    </Badge>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="mb-4">現在の状態</h3>
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-full bg-gray-100">
                    {getStatusIcon(currentStatus)}
                  </div>
                  <div>
                    <p className="font-medium">{currentStatus}</p>
                    <p className="text-sm text-gray-600">最終更新: 先ほど</p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="logs" className="space-y-4">
              <Card className="p-6">
                <h3 className="mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  状態変化記録
                </h3>
                <div className="space-y-3">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-shrink-0">
                        {getStatusIcon(log.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge className={getStatusColor(log.status)}>
                            {log.status}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {log.duration}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{log.timestamp}</p>
                        {log.notes && (
                          <p className="text-sm text-gray-700 mt-1">
                            {log.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              <Card className="p-6">
                <h3 className="mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  転倒リスク分析
                </h3>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">リスクスコア</span>
                    <span className="font-medium">
                      {fallRiskAnalysis.score}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
                        fallRiskAnalysis.score >= 70
                          ? "bg-red-500"
                          : fallRiskAnalysis.score >= 40
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${fallRiskAnalysis.score}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <h4 className="mb-3">リスク要因</h4>
                  <ul className="space-y-2">
                    {fallRiskAnalysis.factors.map((factor, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="text-blue-800 mb-2">推奨対応策</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    {patientInfo.riskLevel === "高" ? (
                      <>
                        <li>• 24時間集中監視が必要</li>
                        <li>• ベッド柵の設置確認</li>
                        <li>• 夜間照明の確保</li>
                        <li>• 定期巡回の増加</li>
                      </>
                    ) : patientInfo.riskLevel === "中" ? (
                      <>
                        <li>• 定期的な状態確認</li>
                        <li>• 移動時の注意事項説明</li>
                        <li>• 家族連絡網の確認</li>
                      </>
                    ) : (
                      <>
                        <li>• 現在の状態を維持</li>
                        <li>• 定期的な監視を継続</li>
                      </>
                    )}
                  </ul>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="monitoring" className="space-y-4">
              <Card className="p-3 sm:p-4">
                <Grap
                  heightClass="h-[34vh] sm:h-[38vh] md:h-[42vh]"
                  disableIntro
                  variant="embedded"
                />
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
