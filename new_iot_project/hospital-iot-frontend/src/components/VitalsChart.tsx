"use client";
import { VitalReading } from "@/types";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const VITAL_CONFIGS = [
  { key: "heartRate", label: "Heart Rate", color: "#ef4444", domain: [40, 160] },
  { key: "spo2", label: "SpO2", color: "#3b82f6", domain: [80, 100] },
  { key: "systolic", label: "Systolic BP", color: "#f59e0b", domain: [60, 200] },
  { key: "temperature", label: "Temp (°F)", color: "#ec4899", domain: [94, 106] },
];

export default function VitalsChart({ data }: { data: VitalReading[] }) {
  const formattedData = data.map((d) => ({
    ...d,
    time: format(new Date(d.timestamp), "HH:mm:ss"),
  }));

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {VITAL_CONFIGS.map((config) => (
        <div key={config.key} className="rounded-xl bg-gray-800 p-4 border border-gray-700">
          <h4 className="mb-2 text-sm font-medium text-gray-400">{config.label}</h4>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formattedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="#9ca3af" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  domain={config.domain} 
                  stroke="#9ca3af" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", fontSize: "12px" }}
                  itemStyle={{ color: config.color }}
                />
                <Line
                  type="monotone"
                  dataKey={config.key}
                  stroke={config.color}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ))}
    </div>
  );
}
