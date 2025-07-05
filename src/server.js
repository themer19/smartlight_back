const express = require("express");
const { startConnections } = require("./config/db"); 
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const cookieParser = require("cookie-parser");
require("dotenv").config();
const { PythonShell } = require('python-shell');
const bodyParser = require("body-parser");
const app = express();
const userRoutes = require("./routes/userRoutes");
const siteRoutes = require("./routes/siteRoutes");
const bcrypt = require("bcryptjs");
const licenceRoutes = require('./routes/licenceRoutes');
const ligneRoutes = require('./routes/ligneRoutes');
const poteauRoutes = require('./routes/poteauRoutes');
const planification = require('./routes/planificationRoutes');
const dele = require('./routes/deletionLogroute')


console.log("Démarrage du serveur...");

app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
startConnections();

app.get('/', (req, res) => {
  res.json({ message: 'hello' });
});

app.use("/api/users", userRoutes);
app.use("/api/site", siteRoutes);
app.use('/api/licences', licenceRoutes);
app.use('/api/ligne', ligneRoutes);
app.use('/api/poteau', poteauRoutes);
app.use('/api/planifications',planification);
app.use('/api/dele',dele);
app.post('/api/predict', (req, res) => {
  const { date } = req.body;

  console.log('Received request with date:', date);

  if (!date) {
    return res.status(400).json({ error: 'La date est requise.' });
  }

  const options = {
    mode: 'text',
    pythonPath: 'C:\\Users\\thamer\\Desktop\\Smart_City\\Back\\venv\\Scripts\\python.exe',
    pythonOptions: ['-u'],
    scriptPath: 'C:\\Users\\thamer\\Desktop\\Smart_City\\Back\\src\\python',
    args: [date],
  };

  console.log('PythonShell options:', options);

  // Create a new PythonShell instance
  const shell = new PythonShell('predict.py', options);

  let output = '';

  // Capture output
  shell.on('message', (message) => {
    output += message;
  });

  // Handle errors
  shell.on('stderr', (stderr) => {
    console.error('PythonShell stderr:', stderr);
  });

  // Handle completion
  shell.on('close', () => {
    if (!res.headersSent) {
      try {
        const result = JSON.parse(output);
        console.log('PythonShell results:', result);
        res.json(result);
      } catch (parseErr) {
        console.error('Erreur de parsing:', parseErr);
        res.status(500).json({ error: 'Erreur de traitement des données.', details: parseErr.message });
      }
    }
  });

  // Handle PythonShell errors
  shell.on('error', (err) => {
    console.error('Erreur Python:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Erreur lors de l\'exécution du modèle.', details: err.message });
    }
  });

  // Timeout after 10 seconds
  setTimeout(() => {
    if (!res.headersSent) {
      console.error('PythonShell timeout: No response after 10 seconds');
      shell.terminate();
      res.status(503).json({ error: 'Timeout lors de l\'exécution du modèle.' });
    }
  }, 10000);
});

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur le port ${PORT}`);

  // Démarrage du producteur Kafka
 try {
    require('./kafka/producer**');
    console.log("✅ Producteur Kafka lancé");
  } catch (err) {
    console.error("❌ Erreur lors du lancement du producteur Kafka:", err.message);
  }
  try {
    require('./kafka/consumer**');
    console.log("✅ Consommateur Kafka lancé");
  } catch (err) {
    console.error("❌ Erreur lors du lancement du consommateur Kafka:", err.message);
  }
});
