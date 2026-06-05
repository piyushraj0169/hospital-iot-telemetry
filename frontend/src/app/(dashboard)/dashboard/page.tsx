"use client";
import { useEffect, useState } from "react";
import { Patient } from "@/types";
import PatientCard from "@/components/PatientCard";

export default function DashboardPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/patients")
      .then(res => res.json())
      .then(data => {
        setPatients(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading monitor...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Live Monitor</h1>
        <div className="text-sm text-gray-400">Real-time telemetry active</div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {patients.map(patient => (
          <PatientCard key={patient.patientId} patient={patient} />
        ))}
      </div>
    </div>
  );
}
