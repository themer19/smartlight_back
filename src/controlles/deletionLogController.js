const DeletionLog = require('../models/DeletionLog');

// Récupérer tous les logs
exports.getAllLogs = async (req, res) => {
  try {
    console.log('Tentative de récupération des logs...');
    console.log('État de la connexion Mongoose:', require('mongoose').connection.readyState); // 0 = déconnecté, 1 = connecté
    const logs = await DeletionLog.find(); // Temporairement sans populate pour tester
    console.log('Logs récupérés:', logs);
    res.status(200).json(logs);
  } catch (error) {
    console.error('Erreur dans getAllLogs:', error.stack || error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message || 'Erreur inconnue' });
  }
};

// Créer un nouveau log
exports.createLog = async (req, res) => {
  try {
    const { siteId, lineId, poteauId, reason } = req.body;
    const newLog = new DeletionLog({ siteId, lineId, poteauId, reason });
    const savedLog = await newLog.save();
    res.status(201).json(savedLog);
  } catch (error) {
    res.status(400).json({ message: 'Données invalides', error: error.message });
  }
};

// Récupérer un log par ID
exports.getLogById = async (req, res) => {
  try {
    const log = await DeletionLog.findById(req.params.id); // Temporairement sans populate
    if (!log) return res.status(404).json({ message: 'Log non trouvé' });
    res.status(200).json(log);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};