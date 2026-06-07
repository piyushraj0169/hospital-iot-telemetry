import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId");

    // Fetch all patients to map names to alerts
    const patientsSnap = await adminDb.collection("patients").get();
    const patientNames: Record<string, string> = {};
    patientsSnap.docs.forEach(doc => {
      patientNames[doc.id] = doc.data().name || doc.id;
    });

    let snapshot;
    if (patientId) {
      snapshot = await adminDb
        .collection("patients")
        .doc(patientId)
        .collection("alerts")
        .get();
    } else {
      snapshot = await adminDb.collectionGroup("alerts").get();
    }

    const alerts = snapshot.docs.map(doc => {
      const data = doc.data();
      const pId = data.patientId || "unknown";
      return {
        ...data,
        patientName: patientNames[pId] || pId,
      };
    });

    // Sort in-memory to avoid Firestore index requirements for collectionGroup orderBy
    alerts.sort((a: any, b: any) => b.triggeredAt - a.triggeredAt);

    return NextResponse.json(alerts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
