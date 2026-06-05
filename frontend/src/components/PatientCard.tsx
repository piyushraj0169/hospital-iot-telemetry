"use client";
import { useLiveVitals } from "@/hooks/useLiveVitals";
import { Patient } from "@/types";
import { Activity, Heart, Thermometer, Droplets } from "lucide-react";
import Link from "next/link";

export default function PatientCard({ patient }: { patient: Patient }) {
  const { latest } = useLiveVitals(patient.patientId);

  return (
    <Link href={`/patients/${patient.patientId}`}>
      <div className="group relative overflow-hidden rounded-xl bg-gray-800 p-5 transition-all hover:bg-gray-750 hover:shadow-xl border border-gray-700">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">{patient.name}</h3>
            <p className="text-xs text-gray-400">{patient.ward} • Bed {patient.bedNumber}</p>
          </div>
          <div className={`h-3 w-3 rounded-full ${latest ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <Heart size={18} className="text-red-500" />
            <div>
              <p className="text-[10px] uppercase text-gray-500">Heart Rate</p>
              <p className="font-mono text-lg">{latest?.heartRate ?? "--"} <span className="text-[10px]">bpm</span></p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Activity size={18} className="text-blue-500" />
            <div>
              <p className="text-[10px] uppercase text-gray-500">SpO2</p>
              <p className="font-mono text-lg">{latest?.spo2 ?? "--"} <span className="text-[10px]">%</span></p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Thermometer size={18} className="text-orange-500" />
            <div>
              <p className="text-[10px] uppercase text-gray-500">Temp</p>
              <p className="font-mono text-lg">{latest?.temperature ?? "--"} <span className="text-[10px]">°F</span></p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Droplets size={18} className="text-purple-500" />
            <div>
              <p className="text-[10px] uppercase text-gray-500">Respiration</p>
              <p className="font-mono text-lg">{latest?.respiratoryRate ?? "--"}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
