"use client";
import { useEffect, useState } from "react";
import { Patient } from "@/types";
import PatientCard from "@/components/PatientCard";
import { Search, Filter, Activity, Play, Square, Settings } from "lucide-react";
import { toast } from "sonner";

export default function DashboardPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [systemStatus, setSystemStatus] = useState({ simulator: false, agent: false });

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/system/status");
      const data = await res.json();
      setSystemStatus(data);
    } catch (e) {}
  };

  useEffect(() => {
    fetch("/api/patients")
      .then(res => res.json())
      .then(data => {
        setPatients(data);
        setLoading(false);
      });
    
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const toggleSystem = async (target: "simulator" | "agent", action: "start" | "stop") => {
    const res = await fetch("/api/system/control", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target, action }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success(data.message);
      fetchStatus();
    } else {
      toast.error("Control error: " + data.error);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.ward.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="text-center space-y-4">
        <Activity className="animate-spin text-blue-500 mx-auto" size={48} />
        <p className="text-gray-400 font-mono text-sm tracking-widest uppercase">Initializing Telemetry Station...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Dashboard Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">Central Monitor</h1>
          <p className="text-gray-400 mt-1 flex items-center gap-2 text-sm">
            <span className={`h-2 w-2 rounded-full ${systemStatus.simulator ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            {systemStatus.simulator ? 'Active Telemetry' : 'Simulator Offline'} • {patients.length} patients connected
          </p>
        </div>

        {/* System Controls */}
        <div className="flex flex-wrap items-center gap-3 bg-gray-800/40 p-2 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 px-3 border-r border-gray-700/50 mr-1">
                <Settings size={16} className="text-gray-500" />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">System Control</span>
            </div>
            
            <button 
                onClick={() => toggleSystem("simulator", systemStatus.simulator ? "stop" : "start")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    systemStatus.simulator 
                    ? "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20" 
                    : "bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/20"
                }`}
            >
                {systemStatus.simulator ? <><Square size={14} fill="currentColor" /> Stop Simulator</> : <><Play size={14} fill="currentColor" /> Activate Simulator</>}
            </button>

            <button 
                onClick={() => toggleSystem("agent", systemStatus.agent ? "stop" : "start")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    systemStatus.agent 
                    ? "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 border border-purple-500/20" 
                    : "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border border-blue-500/20"
                }`}
            >
                {systemStatus.agent ? <><Square size={14} fill="currentColor" /> Stop AI Agent</> : <><Play size={14} fill="currentColor" /> Activate AI Agent</>}
            </button>
        </div>

        <div className="flex items-center gap-3 ml-auto lg:ml-0">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                    type="text" 
                    placeholder="Search patients..."
                    className="bg-gray-800 border border-gray-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 w-64 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button className="bg-gray-800 p-2.5 rounded-xl border border-gray-700 hover:bg-gray-700 transition-colors text-gray-400">
                <Filter size={18} />
            </button>
        </div>
      </div>

      {/* Grid of Patient Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {filteredPatients.map(patient => (
          <PatientCard key={patient.patientId} patient={patient} />
        ))}
      </div>

      {filteredPatients.length === 0 && (
          <div className="text-center py-20 bg-gray-800/20 rounded-3xl border border-dashed border-gray-700">
              <p className="text-gray-500 font-medium text-lg">No patients found matching your search.</p>
          </div>
      )}
    </div>
  );
}
