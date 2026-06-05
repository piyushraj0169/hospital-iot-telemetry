import * as admin from "firebase-admin";

if (!admin.apps.length) {
  const serviceAccount = require("../../firebase_config.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  });
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export const adminRtdb = admin.database();
