import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { rtdb } from "@/lib/firebase";
import { VitalReading } from "@/types";

export function useLiveVitals(patientId: string) {
  const [latest, setLatest] = useState<VitalReading | null>(null);
  const [stream, setStream] = useState<VitalReading[]>([]);

  useEffect(() => {
    if (!patientId) return;

    // Listen to latest vital
    const latestRef = ref(rtdb, `vitals/${patientId}/latest`);
    const unsubLatest = onValue(latestRef, (snapshot) => {
      if (snapshot.exists()) {
        setLatest(snapshot.val());
      }
    });

    // Listen to stream (last 30 min)
    const streamRef = ref(rtdb, `vitals/${patientId}/stream`);
    const unsubStream = onValue(streamRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Convert object to sorted array
        const sorted = Object.values(data) as VitalReading[];
        sorted.sort((a, b) => a.timestamp - b.timestamp);
        setStream(sorted.slice(-360)); // Keep last 30 mins
      }
    });

    return () => {
      unsubLatest();
      unsubStream();
    };
  }, [patientId]);

  return { latest, stream };
}
