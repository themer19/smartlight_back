
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import joblib

# Load dataset (update path)
df = pd.read_csv("C:\\Users\\thamer\\Desktop\\Smart_City\\Back\\src\\python\\weatherHistory.csv")  # Update path

# Prepare data
df['Formatted Date'] = pd.to_datetime(df['Formatted Date'], utc=True)
df['Date'] = df['Formatted Date'].dt.date
daily_df = df.groupby('Date').agg({
    'Temperature (C)': 'mean',
    'Apparent Temperature (C)': 'mean',
    'Humidity': 'mean',
    'Wind Speed (km/h)': 'mean',
    'Wind Bearing (degrees)': 'mean',
    'Visibility (km)': 'mean',
    'Pressure (millibars)': 'mean'
}).reset_index()

daily_df['Date'] = pd.to_datetime(daily_df['Date'])
daily_df['Year'] = daily_df['Date'].dt.year
daily_df['Month'] = daily_df['Date'].dt.month
daily_df['Day'] = daily_df['Date'].dt.day

# Split train/test
split_index = int(len(daily_df) * 0.8)
train_df = daily_df.iloc[:split_index]
test_df = daily_df.iloc[split_index:]

features = [
    'Year', 'Month', 'Day',
    'Apparent Temperature (C)', 'Humidity',
    'Wind Speed (km/h)', 'Wind Bearing (degrees)',
    'Visibility (km)', 'Pressure (millibars)'
]

X_train = train_df[features]
y_train = train_df['Temperature (C)']

# Train model
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Save model
joblib.dump(model, 'C:\\Users\\thamer\\Desktop\\Smart_City\\Back\\src\\python\\model_temperature.pkl')
print("Model saved to model_temperature.pkl")