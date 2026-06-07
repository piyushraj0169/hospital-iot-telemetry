"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useLiveVitals } from "@/hooks/useLiveVitals";
import VitalsChart from "@/components/VitalsChart";
import { Patient, Alert } from "@/types";
import { 
  Activity, 
  Heart, 
  Thermometer, 
  Clock, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp, 
  ShieldAlert
} from "lucide-react";

export default function PatientDetailPage() {
  const { id } = useParams();
  const patientId = id as string;

  const { latest, stream } = useLiveVitals(patientId);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolvingAll, setResolvingAll] = useState(false);

  const fetchAlerts = () => {
    setLoadingAlerts(true);
    fetch(`/api/alerts?patientId=${patientId}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAlerts(data);
        }
      })
      .catch(err => console.error("Error fetching alerts:", err))
      .finally(() => setLoadingAlerts(false));
  };

  useEffect(() => {
    fetch(`/api/patients/${patientId}`).then(r => r.json()).then(setPatient);
    fetchAlerts();
  }, [patientId]);

  const toggleExpand = (id: string) => {
    setExpandedAlertId(expandedAlertId === id ? null : id);
  };

  const handleResolveSingle = async (alertId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setResolvingId(alertId);
      const res = await fetch("/api/alerts/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId, patientId })
      });
      if (res.ok) {
        await fetchAlerts();
      }
    } catch (err) {
      console.error("Error resolving alert:", err);
    } finally {
      setResolvingId(null);
    }
  };

  const handleResolveAll = async () => {
    if (!confirm("Are you sure you want to resolve all active alerts for this patient?")) return;
    try {
      setResolvingAll(true);
      const res = await fetch("/api/alerts/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true, patientId })
      });
      if (res.ok) {
        await fetchAlerts();
      }
    } catch (err) {
      console.error("Error resolving all patient alerts:", err);
    } finally {
      setResolvingAll(false);
    }
  };

  if (!patient) return <div className="flex min-h-[50vh] items-center justify-center text-gray-400 font-mono">Loading patient profile...</div>;

  const hasActiveAlerts = alerts.some(alert => !alert.isResolved);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-4xl font-bold">{patient.name}</h1>
          <p className="text-gray-400 mt-2">
            ID: {patientId} | Ward: {patient.ward} | Bed: {patient.bedNumber} | Attending: {patient.assignedDoctor}
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-2 text-green-400 font-mono text-sm">
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
          <div key={idx} className="bg-gray-880 p-6 rounded-2xl border border-gray-700 shadow-lg">
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

      {/* Alerts Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-gray-850 pb-3">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShieldAlert className="text-red-400" /> Patient Alert History
          </h2>
          <div className="flex items-center gap-3">
            {hasActiveAlerts && (
              <button 
                onClick={handleResolveAll}
                disabled={resolvingAll}
                className="text-xs font-semibold text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors cursor-pointer bg-transparent border border-red-500/20 px-3 py-1.5 rounded-lg hover:bg-red-500/5"
              >
                Resolve All Active
              </button>
            )}
            <button 
              onClick={fetchAlerts}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors cursor-pointer bg-transparent border-0"
            >
              Refresh Logs
            </button>
          </div>
        </div>

        {loadingAlerts && alerts.length === 0 ? (
          <div className="py-10 text-center text-xs text-gray-500 font-mono">Loading history...</div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-10 bg-gray-950/20 rounded-2xl border border-dashed border-gray-800">
            <p className="text-gray-500 text-sm">No active or historical alerts logged for this patient.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => {
              const isExpanded = expandedAlertId === alert.alertId;
              return (
                <div 
                  key={alert.alertId}
                  className={`bg-gray-950/30 rounded-xl border transition-all duration-205 overflow-hidden ${
                    isExpanded ? "border-gray-700 bg-gray-950/50 shadow-md" : "border-gray-850 hover:border-gray-800"
                  }`}
                >
                  <div 
                    onClick={() => toggleExpand(alert.alertId)}
                    className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="flex items-start md:items-center gap-3">
                      <div className={`px-2.5 py-1 rounded-lg font-mono font-bold text-[10px] uppercase ${
                        alert.isResolved 
                          ? "bg-gray-850 border border-gray-800 text-gray-500" 
                          : alert.severity === "critical"
                            ? "bg-red-500/10 border border-red-500/20 text-red-400"
                            : "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                      }`}>
                        {alert.severity}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-200">{alert.message}</p>
                        <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                          Triggered: {new Date(alert.triggeredAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-2 md:pt-0 border-gray-900">
                      {alert.isResolved ? (
                        <span className="text-[11px] text-green-500 font-medium flex items-center gap-1 bg-green-500/5 px-2 py-0.5 rounded border border-green-500/10">
                          <CheckCircle size={10} /> Resolved
                        </span>
                      ) : (
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <span className="text-[11px] text-red-400 font-medium flex items-center gap-1 bg-red-400/5 px-2 py-0.5 rounded border border-red-400/10 animate-pulse">
                            <Activity size={10} /> Active
                          </span>
                          <button
                            onClick={(e) => handleResolveSingle(alert.alertId, e)}
                            disabled={resolvingId === alert.alertId}
                            className="px-2.5 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer border-0"
                          >
                            {resolvingId === alert.alertId ? "Resolving..." : "Resolve"}
                          </button>
                        </div>
                      )}
                      <div className="text-gray-500">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-5 pt-1 border-t border-gray-900 bg-gray-950/20 space-y-4 text-xs">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* Snapshot */}
                        <div>
                          <h4 className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-2">Vitals at Trigger</h4>
                          <div className="grid grid-cols-4 gap-2">
                            {alert.vitalsAtTrigger ? (
                              [
                                { label: "HR", val: alert.vitalsAtTrigger.heartRate, unit: "bpm" },
                                { label: "SpO2", val: alert.vitalsAtTrigger.spo2, unit: "%" },
                                { label: "BP", val: `${alert.vitalsAtTrigger.systolic}/${alert.vitalsAtTrigger.diastolic}`, unit: "mmHg" },
                                { label: "Temp", val: alert.vitalsAtTrigger.temperature, unit: "°F" }
                              ].map((v, i) => (
                                <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-2 text-center">
                                  <span className="block text-[8px] font-bold text-gray-500 uppercase">{v.label}</span>
                                  <span className="block font-mono font-bold text-white mt-0.5">{v.val}</span>
                                  <span className="block text-[8px] text-gray-600">{v.unit}</span>
                                </div>
                              ))
                            ) : (
                              <div className="col-span-4 py-2 text-center text-gray-655">Unavailable</div>
                            )}
                          </div>

                          {alert.isResolved && alert.resolvedAt && (
                            <div className="bg-green-500/5 border border-green-500/10 rounded-lg p-3 mt-3 flex items-start gap-2">
                              <CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <span className="block font-bold text-green-400">Resolved Alert Details</span>
                                <span className="block text-[10px] text-gray-500 font-mono mt-0.5">
                                  Closed: {new Date(alert.resolvedAt).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Recommendations */}
                        <div>
                          <h4 className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-2">Clinical Recommendations</h4>
                          <div className="bg-gray-900 border border-gray-850 rounded-lg p-3 space-y-2">
                            {alert.recommendations && alert.recommendations.length > 0 ? (
                              alert.recommendations.map((rec, i) => (
                                <p key={i} className="text-gray-300 leading-normal flex gap-2">
                                  <span className="text-blue-400 font-bold">•</span>
                                  <span>{rec}</span>
                                </p>
                              ))
                            ) : (
                              <p className="text-gray-500 italic">No recommendations</p>
                            )}
                          </div>
                        </div>

                      </div>

                      {/* Explanation */}
                      {alert.aiExplanation && (
                        <div className="border-t border-gray-900 pt-3">
                          <h4 className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">AI Clinical Explanation</h4>
                          <div className="bg-gray-900/50 p-3 rounded-lg text-gray-400 leading-relaxed italic font-sans">
                            "{alert.aiExplanation}"
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
