import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(req: NextRequest) {
  try {
    const snapshot = await adminDb.collection("patients").get();
    const patients = snapshot.docs.map(doc => ({
      patientId: doc.id,
      ...doc.data()
    }));
    return NextResponse.json(patients);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { patientId, ...data } = body;
    await adminDb.collection("patients").doc(patientId).set({
      ...data,
      status: 'active',
      isSimulated: false,
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
