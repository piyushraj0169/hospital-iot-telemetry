import uuid
import time
from firebase_admin import db, firestore

rtdb = db
def get_fs():
    return firestore.client()

def write_alert(patient_id, vitals, violations, ai_result):
    alert_id = f"alert_{uuid.uuid4().hex[:8]}"
    severity = "critical" if any(v["severity"] == "critical" for v in violations) else "warning"
    ts = int(time.time() * 1000)

    alert = {
        "alertId": alert_id,
        "patientId": patient_id,
        "severity": severity,
        "message": violations[0]["message"],
        "triggeredAt": ts,
        "resolvedAt": None,
        "isResolved": False,
        "vitalsAtTrigger": vitals,
        "aiExplanation": ai_result.get("explanation", ""),
        "recommendations": ai_result.get("recommendations", []),
    }

    # Write to RTDB — immediately visible on dashboard
    rtdb.reference(f"alerts/{patient_id}/active").set(alert)

    # Write to Firestore — permanent history
    fs = get_fs()
    fs.collection("patients").document(patient_id)\
      .collection("alerts").document(alert_id).set(alert)

    print(f"[ALERT] {severity.upper()} for {patient_id}: {alert['message']}")
    return alert

def resolve_alert(patient_id):
    """Called when vitals return to normal — clears RTDB active alert."""
    rtdb.reference(f"alerts/{patient_id}/active").delete()
