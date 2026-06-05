import json
import random
import time
import os
from datetime import datetime
from pathlib import Path
import firebase_admin
from firebase_admin import credentials, db, firestore
from dotenv import load_dotenv

load_dotenv()

def init_firebase():
    try:
        firebase_admin.get_app()
    except ValueError:
        config_path = Path('firebase_config.json')
        if not config_path.exists():
            return None, None
        cred = credentials.Certificate(str(config_path))
        db_url = os.getenv('FIREBASE_DB_URL')
        firebase_admin.initialize_app(cred, {'databaseURL': db_url})
    return db, firestore.client()

def load_thresholds():
    try:
        with open('data/thresholds.json', 'r') as f:
            return json.load(f)
    except:
        return {}

last_vitals = {}
patient_states = {}

def generate_vitals(patient_id, thresholds):
    global last_vitals, patient_states
    if patient_id not in patient_states:
        patient_states[patient_id] = {'is_abnormal': False, 'abnormal_vital': None, 'trend_direction': 1}
    if random.random() >= 0.95:
        patient_states[patient_id]['is_abnormal'] = not patient_states[patient_id]['is_abnormal']
        if patient_states[patient_id]['is_abnormal']:
            patient_states[patient_id]['abnormal_vital'] = random.choice(['heartRate', 'spo2', 'systolic', 'respiratoryRate'])
            patient_states[patient_id]['trend_direction'] = 1 if random.random() > 0.5 else -1
            if patient_states[patient_id]['abnormal_vital'] == 'spo2': patient_states[patient_id]['trend_direction'] = -1

    if patient_id not in last_vitals:
        last_vitals[patient_id] = {
            'heartRate': random.randint(60, 100),
            'spo2': random.randint(95, 100),
            'systolic': random.randint(110, 130),
            'diastolic': random.randint(70, 85),
            'temperature': round(random.uniform(97.5, 99.0), 1),
            'respiratoryRate': random.randint(12, 20)
        }
        return last_vitals[patient_id].copy()

    v = last_vitals[patient_id].copy()
    for k in v:
        if k == 'temperature': v[k] = round(v[k] + random.uniform(-0.1, 0.1), 1)
        else: v[k] += random.randint(-1, 1)

    if patient_states[patient_id]['is_abnormal']:
        target = patient_states[patient_id]['abnormal_vital']
        v[target] += random.randint(1, 3) * patient_states[patient_id]['trend_direction']

    v['spo2'] = max(60, min(v['spo2'], 100))
    last_vitals[patient_id] = v
    return v

def main():
    print('Starting Simulator...')
    rtdb, fs = init_firebase()
    if not rtdb: return
    while True:
        try:
            patients = fs.collection('patients').where('isSimulated', '==', True).stream()
            for p in patients:
                vitals = generate_vitals(p.id, {})
                ts = int(time.time() * 1000)
                vitals['timestamp'] = ts
                rtdb.reference(f'vitals/{p.id}/latest').set(vitals)
                rtdb.reference(f'vitals/{p.id}/stream/{ts}').set(vitals)
                print(f'Updated {p.id}')
            time.sleep(5)
        except KeyboardInterrupt: break
        except Exception as e: print(f'Error: {e}'); time.sleep(5)

if __name__ == '__main__':
    main()
