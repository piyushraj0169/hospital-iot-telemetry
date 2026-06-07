"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Alert } from "@/types";
import { 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Clock, 
  Activity, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Filter, 
  User, 
  ArrowRight,
  Heart,
  Thermometer,
  ShieldAlert
} from "lucide-react";

interface ExtendedAlert extends Alert {
  patientName?: string;
}

export default function AlertCenterPage() {
  const [alerts, setAlerts] = useState<ExtendedAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState<"all" | "critical" | "warning">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "resolved">("all");
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolvingAll, setResolvingAll] = useState(false);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/alerts");
      const data = await res.json();
      if (Array.isArray(data)) {
        setAlerts(data);
      }
    } catch (err) {
      console.error("Error fetching alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedAlertId(expandedAlertId === id ? null : id);
  };

  const handleResolveSingle = async (alertId: string, patientId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid expanding/collapsing details
    try {
      setResolvingId(alertId);
      const res = await fetch("/api/alerts/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId, patientId })
      });
      if (res.ok) {
        // Optimistically update or refetch
        await fetchAlerts();
      }
    } catch (err) {
      console.error("Error resolving alert:", err);
    } finally {
      setResolvingId(null);
    }
  };

  const handleResolveAll = async () => {
    if (!confirm("Are you sure you want to resolve all active alerts?")) return;
    try {
      setResolvingAll(true);
      const res = await fetch("/api/alerts/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true })
      });
      if (res.ok) {
        await fetchAlerts();
      }
    } catch (err) {
      console.error("Error resolving all alerts:", err);
    } finally {
      setResolvingAll(false);
    }
  };

  // Filter logic
  const filteredAlerts = alerts.filter(alert => {
    const nameMatch = alert.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      alert.patientId.toLowerCase().includes(searchTerm.toLowerCase());
    const messageMatch = alert.message.toLowerCase().includes(searchTerm.toLowerCase());
    const textMatch = nameMatch || messageMatch;

    const severityMatch = severityFilter === "all" || alert.severity === severityFilter;
    const statusMatch = statusFilter === "all" || 
                        (statusFilter === "resolved" && alert.isResolved) || 
                        (statusFilter === "active" && !alert.isResolved);

    return textMatch && severityMatch && statusMatch;
  });

  const hasActiveAlerts = alerts.some(alert => !alert.isResolved);

  const getSeverityStyle = (severity: string, isResolved: boolean) => {
    if (isResolved) return "bg-gray-800/60 border border-gray-700 text-gray-400";
    return severity === "critical"
      ? "bg-red-500/10 border border-red-500/30 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.15)]"
      : "bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.15)]";
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white uppercase italic flex items-center gap-3">
            <ShieldAlert className="text-red-500" size={36} />
            Alert Center
          </h1>
          <p className="text-gray-400 mt-1 flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
            Historical & active clinical violations
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {hasActiveAlerts && (
            <button 
              onClick={handleResolveAll}
              disabled={resolvingAll || loading}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white px-4 py-2.5 rounded-xl border border-red-700 hover:border-red-600 transition-all font-semibold text-sm disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle size={16} className={resolvingAll ? "animate-pulse" : ""} />
              {resolvingAll ? "Resolving..." : "Resolve All"}
            </button>
          )}

          <button 
            onClick={fetchAlerts}
            disabled={loading}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-750 active:bg-gray-700 text-white px-4 py-2.5 rounded-xl border border-gray-700 hover:border-gray-650 transition-all font-medium text-sm disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-gray-950/40 p-4 rounded-2xl border border-gray-800/80 flex flex-col lg:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, ID or symptom..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 w-full transition-all focus:ring-1 focus:ring-blue-500/20"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          {/* Severity Filters */}
          <div className="flex items-center bg-gray-900 rounded-xl border border-gray-800 p-1">
            <span className="text-[10px] font-bold text-gray-500 px-3 uppercase tracking-wider">Severity</span>
            {(["all", "critical", "warning"] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  severityFilter === sev 
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" 
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          {/* Status Filters */}
          <div className="flex items-center bg-gray-900 rounded-xl border border-gray-800 p-1">
            <span className="text-[10px] font-bold text-gray-500 px-3 uppercase tracking-wider">Status</span>
            {(["all", "active", "resolved"] as const).map((stat) => (
              <button
                key={stat}
                onClick={() => setStatusFilter(stat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  statusFilter === stat 
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" 
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {stat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts List */}
      {loading && alerts.length === 0 ? (
        <div className="flex h-60 items-center justify-center">
          <div className="text-center space-y-3">
            <Activity className="animate-spin text-blue-500 mx-auto" size={32} />
            <p className="text-gray-400 font-mono text-xs tracking-widest uppercase">Fetching alert logs...</p>
          </div>
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="text-center py-20 bg-gray-950/20 rounded-3xl border border-dashed border-gray-800">
          <p className="text-gray-500 font-medium text-lg">No alerts match your filter criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => {
            const isExpanded = expandedAlertId === alert.alertId;
            return (
              <div 
                key={alert.alertId}
                className={`bg-gray-950/30 rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isExpanded ? "border-gray-700 bg-gray-950/60 shadow-xl" : "border-gray-800 hover:border-gray-700"
                }`}
              >
                {/* Header Row */}
                <div 
                  onClick={() => toggleExpand(alert.alertId)}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-gray-900/10 transition-colors"
                >
                  <div className="flex items-start md:items-center gap-4 flex-1">
                    {/* Severity Indicator Badge */}
                    <div className={`px-3 py-1.5 rounded-xl font-bold font-mono text-xs uppercase ${getSeverityStyle(alert.severity, alert.isResolved)}`}>
                      {alert.severity}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <Link 
                          href={`/patients/${alert.patientId}`} 
                          onClick={(e) => e.stopPropagation()}
                          className="font-bold text-white hover:text-blue-400 transition-colors flex items-center gap-1.5 text-base"
                        >
                          <User size={16} className="text-gray-400" />
                          {alert.patientName}
                        </Link>
                        <span className="text-gray-600 text-sm">•</span>
                        <span className="text-xs text-gray-500 font-mono">ID: {alert.patientId}</span>
                      </div>
                      <p className="text-gray-300 font-medium text-sm">{alert.message}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-gray-900">
                    <div className="flex items-center gap-4 text-xs font-semibold text-gray-500 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {new Date(alert.triggeredAt).toLocaleDateString()} {new Date(alert.triggeredAt).toLocaleTimeString()}
                      </span>

                      {alert.isResolved ? (
                        <span className="text-green-500 flex items-center gap-1 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-lg">
                          <CheckCircle size={12} /> Resolved
                        </span>
                      ) : (
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <span className="text-red-400 flex items-center gap-1 bg-red-400/10 border border-red-400/20 px-2 py-0.5 rounded-lg animate-pulse">
                            <Activity size={12} /> Active
                          </span>
                          <button
                            onClick={(e) => handleResolveSingle(alert.alertId, alert.patientId, e)}
                            disabled={resolvingId === alert.alertId}
                            className="px-2.5 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer border-0"
                          >
                            {resolvingId === alert.alertId ? "Resolving..." : "Resolve"}
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="text-gray-500 hover:text-white transition-colors">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details Panel */}
                {isExpanded && (
                  <div className="px-5 pb-6 pt-2 border-t border-gray-900 bg-gray-950/40 space-y-5 animate-in slide-in-from-top-4 duration-300">
                    {/* Vitals & Action Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Vitals Snapshot */}
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                          <Heart size={12} className="text-red-500" />
                          Vitals Snapshot at Trigger
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {alert.vitalsAtTrigger ? (
                            [
                              { label: "Heart Rate", val: alert.vitalsAtTrigger.heartRate, unit: "bpm" },
                              { label: "SpO2", val: alert.vitalsAtTrigger.spo2, unit: "%" },
                              { label: "Blood Pressure", val: `${alert.vitalsAtTrigger.systolic}/${alert.vitalsAtTrigger.diastolic}`, unit: "mmHg" },
                              { label: "Temperature", val: alert.vitalsAtTrigger.temperature, unit: "°F" }
                            ].map((v, i) => (
                              <div key={i} className="bg-gray-900/80 border border-gray-800 rounded-xl p-3 text-center">
                                <span className="block text-[8px] font-bold text-gray-500 uppercase tracking-tighter mb-1">{v.label}</span>
                                <span className="block font-mono text-sm font-bold text-white">{v.val}</span>
                                <span className="block text-[9px] text-gray-600">{v.unit}</span>
                              </div>
                            ))
                          ) : (
                            <div className="col-span-4 bg-gray-900/40 rounded-xl p-3 text-center text-xs text-gray-600">
                              Snapshot data unavailable
                            </div>
                          )}
                        </div>

                        {/* Resolution Info */}
                        {alert.isResolved && alert.resolvedAt && (
                          <div className="bg-green-500/5 border border-green-500/10 rounded-xl p-4 flex items-start gap-3 mt-3">
                            <CheckCircle size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                            <div className="space-y-0.5">
                              <span className="block text-xs font-bold text-green-400">Resolution Logged</span>
                              <span className="block text-[11px] text-gray-500 font-mono">
                                Resolved on {new Date(alert.resolvedAt).toLocaleDateString()} at {new Date(alert.resolvedAt).toLocaleTimeString()}
                              </span>
                              <span className="block text-[11px] text-gray-500">
                                Duration Active: {Math.round((alert.resolvedAt - alert.triggeredAt) / 1000)} seconds
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Clinical Recommendations */}
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                          <Activity size={12} className="text-blue-500" />
                          AI Suggested Recommendations
                        </h4>
                        <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 space-y-2.5">
                          {alert.recommendations && alert.recommendations.length > 0 ? (
                            alert.recommendations.map((rec, i) => (
                              <div key={i} className="flex gap-2.5 items-start text-xs text-gray-300">
                                <span className="h-5 w-5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                                  {i + 1}
                                </span>
                                <p className="leading-relaxed mt-0.5">{rec}</p>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-gray-600 italic">No recommendations provided.</p>
                          )}
                        </div>
                      </div>

                    </div>

                    {/* AI Clinical Summary */}
                    {alert.aiExplanation && (
                      <div className="border-t border-gray-900 pt-4 space-y-2">
                        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                          <Thermometer size={12} className="text-purple-500" />
                          AI Clinical Explanation & Analysis
                        </h4>
                        <div className="bg-gray-900/30 border border-gray-950 p-4 rounded-xl">
                          <p className="text-xs text-gray-400 leading-relaxed italic">
                            "{alert.aiExplanation}"
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Actions row */}
                    <div className="flex justify-end pt-2">
                      <Link 
                        href={`/patients/${alert.patientId}`}
                        className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors group"
                      >
                        Go to Patient Profile 
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
