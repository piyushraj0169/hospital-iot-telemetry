import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminRtdb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { alertId, patientId, all } = body;
    const now = Date.now();

    if (all) {
      let snapshot;
      if (patientId) {
        // Fetch all alerts for this specific patient
        snapshot = await adminDb
          .collection("patients")
          .doc(patientId)
          .collection("alerts")
          .get();
      } else {
        // Fetch all alerts across all patients
        snapshot = await adminDb.collectionGroup("alerts").get();
      }

      const batch = adminDb.batch();
      const deleteRtdbPromises: Promise<any>[] = [];
      let count = 0;

      for (const doc of snapshot.docs) {
        const data = doc.data();
        // Check if alert is not resolved (handles false, undefined, null)
        if (!data.isResolved) {
          batch.update(doc.ref, {
            isResolved: true,
            resolvedAt: now,
          });
          count++;

          const pId = data.patientId;
          if (pId) {
            deleteRtdbPromises.push(
              adminRtdb.ref(`alerts/${pId}/active`).remove()
            );
          }
        }
      }

      // Only commit if there are actual updates to perform, otherwise batch.commit() errors
      if (count > 0) {
        await batch.commit();
        await Promise.all(deleteRtdbPromises);
      }

      return NextResponse.json({ success: true, count });
    } else {
      if (!alertId || !patientId) {
        return NextResponse.json({ error: "Missing alertId or patientId" }, { status: 400 });
      }

      // Update in Firestore
      await adminDb
        .collection("patients")
        .doc(patientId)
        .collection("alerts")
        .doc(alertId)
        .update({
          isResolved: true,
          resolvedAt: now,
        });

      // Clear from RTDB if it matches the active alert
      const activeRef = adminRtdb.ref(`alerts/${patientId}/active`);
      const snapshot = await activeRef.once("value");
      if (snapshot.exists()) {
        const activeAlert = snapshot.val();
        if (activeAlert.alertId === alertId) {
          await activeRef.remove();
        }
      }

      return NextResponse.json({ success: true });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
