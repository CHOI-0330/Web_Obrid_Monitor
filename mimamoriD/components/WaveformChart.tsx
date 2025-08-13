import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";

interface WaveformChartProps {
  roomNumber: number;
}

export function WaveformChart({ roomNumber }: WaveformChartProps) {
  const [data, setData] = useState<Array<{time: number, value: number}>>([]);

  useEffect(() => {
    // 256個のデータポイントで初期データを生成
    const initialData = Array.from({ length: 256 }, (_, i) => ({
      time: i,
      value: Math.sin(i * 0.05) * 30 + Math.random() * 10 + 50
    }));
    setData(initialData);

    // リアルタイム更新
    const interval = setInterval(() => {
      setData(prevData => {
        const newData = [...prevData.slice(1)];
        const newPoint = {
          time: prevData[prevData.length - 1]?.time + 1 || 256,
          value: Math.sin(Date.now() * 0.001) * 30 + Math.random() * 10 + 50
        };
        return [...newData, newPoint];
      });
    }, 100); // より高速な更新

    return () => clearInterval(interval);
  }, [roomNumber]);

  return (
    <div className="w-full h-64 bg-gray-900 rounded-lg p-4">
      <div className="mb-2">
        <h4 className="text-green-400 text-sm">リアルタイムセンサー波形</h4>
        <p className="text-gray-400 text-xs">動き検出信号（256サンプル）</p>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 10, fill: '#9CA3AF' }}
            axisLine={{ stroke: '#374151' }}
            domain={['dataMin', 'dataMax']}
            type="number"
            scale="linear"
            tickCount={9} // 0, 32, 64, 96, 128, 160, 192, 224, 256の9つの目盛り
          />
          <YAxis 
            tick={{ fontSize: 10, fill: '#9CA3AF' }}
            axisLine={{ stroke: '#374151' }}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#10B981" 
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}