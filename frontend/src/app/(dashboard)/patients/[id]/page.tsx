"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useLiveVitals } from "@/hooks/useLiveVitals";
import VitalsChart from "@/components/VitalsChart";
import { Patient, Alert } from "@/types";
import { Activity, Heart, Thermometer, Droplets, Clock } from "lucide-react";

export default function PatientDetailPage() {
  const { id } = useParams();
  const patientId = id as string;

  const { latest, stream } = useLiveVitals(patientId);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    fetch(`/api/patients/${patientId}`).then(r => r.json()).then(setPatient);
    // Alerts would come from another API route
  }, [patientId]);

  if (!patient) return <div>Loading patient profile...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-4xl font-bold">{patient.name}</h1>
          <p className="text-gray-400 mt-2">
            ID: {patientId} | Ward: {patient.ward} | Bed: {patient.bedNumber} | Doctor: {patient.assignedDoctor}
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-2 text-green-400 font-mono">
            <Clock size={16} />
            <span>Last sync: {latest ? new Date(latest.timestamp).toLocaleTimeString() : "--"}</span>
          </div>
        </div>
      </div>

      {/* Current Vitals Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Heart Rate", val: latest?.heartRate, unit: "bpm", icon: Heart, color: "text-red-500" },
          { label: "SpO2", val: latest?.spo2, unit: "%", icon: Activity, color: "text-blue-500" },
          { label: "Blood Pressure", val: latest ? `${latest.systolic}/${latest.diastolic}` : "--", unit: "mmHg", icon: Activity, color: "text-orange-500" },
          { label: "Temperature", val: latest?.temperature, unit: "°F", icon: Thermometer, color: "text-pink-500" },
        ].map((item, idx) => (
          <div key={idx} className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <item.icon className={item.color} size={24} />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{item.label}</span>
            </div>
            <div className="text-3xl font-mono font-bold">
              {item.val ?? "--"} <span className="text-sm font-normal text-gray-500">{item.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Activity className="text-blue-400" /> Live Telemetry (30 Min Rolling)
        </h2>
        <VitalsChart data={stream} />
      </div>
    </div>
  );
}
