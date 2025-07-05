import pandas as pd

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
daily_df['Month'] = daily_df['Date'].dt.month
daily_df['Day'] = daily_df['Date'].dt.day

moyennes_histo = daily_df.groupby(['Month', 'Day']).agg({
    'Apparent Temperature (C)': 'mean',
    'Humidity': 'mean',
    'Wind Speed (km/h)': 'mean',
    'Wind Bearing (degrees)': 'mean',
    'Visibility (km)': 'mean',
    'Pressure (millibars)': 'mean'
}).reset_index()

moyennes_histo.to_csv('C:\\Users\\thamer\\Desktop\\Smart_City\\Back\\src\\python\\moyennes_histo.csv', index=False)
print("moyennes_histo.csv saved")