import sys
import json
import pandas as pd
import joblib
from datetime import datetime

# Charger le modèle
model = joblib.load('C:\\Users\\thamer\\Desktop\\Smart_City\\Back\\src\\python\\model_temperature.pkl')

# Charger les données historiques
moyennes_histo = pd.read_csv('C:\\Users\\thamer\\Desktop\\Smart_City\\Back\\src\\python\\moyennes_histo.csv')

def conseiller_smart_city(temp, humidite):
    if humidite > 0.7:
        return "🌧 Risque de pluie, allumer la lumière forte extérieure."
    elif temp < 5:
        return "❄️ Froid, prévoir chauffage et éclairage renforcé."
    elif temp > 30:
        return "🔥 Chaleur élevée, activer climatisation et éclairage adapté."
    else:
        return "✅ Conditions normales, éclairage standard."

def predire_et_conseiller(date_str):
    try:
        date = pd.to_datetime(date_str)
        month, day = date.month, date.day

        moy = moyennes_histo[(moyennes_histo['Month'] == month) & (moyennes_histo['Day'] == day)]
        if moy.empty:
            return {"error": "Date hors plage historique."}

        features_input = {
            'Year': date.year,
            'Month': month,
            'Day': day,
            'Apparent Temperature (C)': float(moy['Apparent Temperature (C)'].iloc[0]),
            'Humidity': float(moy['Humidity'].iloc[0]),
            'Wind Speed (km/h)': float(moy['Wind Speed (km/h)'].iloc[0]),
            'Wind Bearing (degrees)': float(moy['Wind Bearing (degrees)'].iloc[0]),
            'Visibility (km)': float(moy['Visibility (km)'].iloc[0]),
            'Pressure (millibars)': float(moy['Pressure (millibars)'].iloc[0]),
        }

        df_input = pd.DataFrame([features_input])
        temp_pred = model.predict(df_input)[0]
        conseil = conseiller_smart_city(temp_pred, features_input['Humidity'])

        return {
            "date": str(date.date()),
            "temperature": round(temp_pred, 2),
            "conseil": conseil
        }
    except Exception as e:
        return {"error": str(e)}

if __name__ == '__main__':
    date_str = sys.argv[1]
    result = predire_et_conseiller(date_str)
    print(json.dumps(result))