import json
with open('data/thresholds.json') as f:
    T = json.load(f)

def check_vitals(vitals):
    violations = []
    def check(vital, value, warn_min=None, warn_max=None, crit_min=None, crit_max=None):
        if value is None: return
        if crit_min and value < crit_min:
            violations.append({'vital': vital, 'value': value, 'severity': 'critical', 'message': f'{vital} critically low: {value}'})
        elif crit_max and value > crit_max:
            violations.append({'vital': vital, 'value': value, 'severity': 'critical', 'message': f'{vital} critically high: {value}'})
        elif warn_min and value < warn_min:
            violations.append({'vital': vital, 'value': value, 'severity': 'warning', 'message': f'{vital} low: {value}'})
        elif warn_max and value > warn_max:
            violations.append({'vital': vital, 'value': value, 'severity': 'warning', 'message': f'{vital} high: {value}'})

    # Adjusting to actual JSON keys: normal_min, normal_max, warning_min, warning_max
    # Mapping warning_min/max to our 'critical' checks for immediate alerts in this demo
    
    check('Heart Rate', vitals.get('heartRate'), 
          T['heart_rate']['normal_min'], T['heart_rate']['normal_max'], 
          T['heart_rate']['warning_min'], T['heart_rate']['warning_max'])
          
    check('SpO2', vitals.get('spo2'), 
          T['oxygen_level']['normal_min'], None, 
          T['oxygen_level']['warning_min'], None)
          
    check('Systolic BP', vitals.get('systolic'), 
          T['blood_pressure_sys']['normal_min'], T['blood_pressure_sys']['normal_max'], 
          T['blood_pressure_sys']['warning_min'], T['blood_pressure_sys']['warning_max'])
          
    check('Temperature', vitals.get('temperature'), 
          T['temperature']['normal_min'], T['temperature']['normal_max'], 
          T['temperature']['warning_min'], T['temperature']['warning_max'])
          
    check('Respiratory Rate', vitals.get('respiratoryRate'), 
          T['respiratory_rate']['normal_min'], T['respiratory_rate']['normal_max'], 
          T['respiratory_rate']['warning_min'], T['respiratory_rate']['warning_max'])
          
    return violations
