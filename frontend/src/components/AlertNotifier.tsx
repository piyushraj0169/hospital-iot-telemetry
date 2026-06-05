"use client";
import { useEffect, useRef } from "react";
import { ref, onValue } from "firebase/database";
import { rtdb } from "@/lib/firebase";
import { toast } from "sonner";

export function AlertNotifier() {
  const knownAlerts = useRef<Set<string>>(new Set());

  useEffect(() => {
    const alertsRef = ref(rtdb, "alerts");
    const unsub = onValue(alertsRef, (snap) => {
      if (!snap.exists()) return;
      const raw = snap.val();
      for (const patientId of Object.keys(raw)) {
        const active = raw[patientId]?.active;
        if (!active) continue;
        const key = `${patientId}_${active.alertId}`;
        if (!knownAlerts.current.has(key)) {
          knownAlerts.current.add(key);
          if (active.severity === "critical") {
            toast.error(`🚨 CRITICAL: ${patientId} — ${active.message}`, { duration: 10000 });
          } else {
            toast.warning(`⚠️ WARNING: ${patientId} — ${active.message}`);
          }
        }
      }
    });
    return () => unsub();
  }, []);

  return null;
}
