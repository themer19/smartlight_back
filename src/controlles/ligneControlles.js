const Ligne = require('../models/ligneModel');
const DeletionLog = require('../models/DeletionLog');
// Generate a unique code for a ligne in the format LINE<timestamp>
exports.generateUniqueLigneCode = async (req, res) => {
  const maxRetries = 5;
  let attempts = 0;
  try {
    while (attempts < maxRetries) {
      const code = `LINE${Date.now().toString(16).toUpperCase()}`;
      const existingLigne = await Ligne.findOne({ code });
      if (!existingLigne) {
        if (res) {
          return res.status(200).json({ code });
        }
        return code;
      }
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 1));
    }
    throw new Error('Unable to generate a unique code after maximum retries');
  } catch (error) {
    if (res) {
      return res.status(500).json({ message: error.message });
    }
    throw error;
  }
};

// Créer une ligne
exports.creerLigne = async (req, res) => {
  try {
    const ligneData = req.body;
    console.log(ligneData);
    const nouvelleLigne = new Ligne({
      nom_L: ligneData.name,
      description: ligneData.description,
      lengthKm: ligneData.length,
      site: ligneData.site,
      status: ligneData.status || 'Active',
      code: ligneData.code || `LINE${Date.now().toString(16).toUpperCase()}`,
      type: ligneData.voltage,
      conductorType: ligneData.conductorType,
      consomationTriphasé: ligneData.consomationTriphasé || [],
      startPoint: ligneData.startPoint,
      endPoint: ligneData.endPoint,
    });
    await nouvelleLigne.save();
    res.status(201).json(nouvelleLigne);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Obtenir toutes les lignes
exports.listerLignes = async (req, res) => {
  try {
    const { search, status, site, voltage, conductorType } = req.query;
    const query = {};
    if (search) {
      query.nom_L = { $regex: search, $options: 'i' };
    }
    if (status) query.status = status;
    if (site) query.site = site;
    if (voltage) query.voltage = voltage;
    if (conductorType) query.conductorType = conductorType;
    const lignes = await Ligne.find(query).populate('site');
    res.status(200).json(lignes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtenir une ligne par ID
exports.getLigneParId = async (req, res) => {
  try {
    const ligne = await Ligne.findById(req.params.id).populate('site');
    if (!ligne) return res.status(404).json({ message: 'Ligne non trouvée' });
    res.status(200).json(ligne);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtenir une ligne par code
exports.getLigneParCode = async (req, res) => {
  try {
    const ligne = await Ligne.findOne({ code: req.params.code }).populate('site');
    if (!ligne) return res.status(404).json({ message: 'Ligne non trouvée' });
    res.status(200).json(ligne);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour une ligne
exports.updateLigne = async (req, res) => {
  try {
    const ligneData = req.body;
    const ligne = await Ligne.findByIdAndUpdate(
      req.params.id,
      {
        nom_L: ligneData.nom_L,
        description: ligneData.description,
        lengthKm: ligneData.lengthKm,
        site: ligneData.site,
        lng: ligneData.startPoint?.lng,
        lat: ligneData.startPoint?.lat,
        status: ligneData.status,
        code: ligneData.code,
        type: ligneData.voltage,
        conductorType: ligneData.conductorType,
        consomationTriphasé: ligneData.consomationTriphasé || [],
        startPoint: ligneData.startPoint,
        endPoint: ligneData.endPoint,
      },
      { new: true }
    ).populate('site');
    if (!ligne) return res.status(404).json({ message: 'Ligne non trouvée' });
    res.status(200).json(ligne);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Supprimer une ligne
exports.supprimerLigne = async (req, res) => {
  
  try {
    // Find and delete the line
    const ligne = await Ligne.findByIdAndDelete(req.params.id);
    if (!ligne) {
      return res.status(404).json({ message: 'Ligne non trouvée' });
    }

    // Log deletion with reason
    const reason = req.body.reason || 'Aucune raison spécifiée';
    await DeletionLog.create({
      lineId: req.params.id,
      reason,
    });

    // Return success response
    res.status(200).json({ message: 'Ligne supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la ligne:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression de la ligne' });
  }
};

// Rechercher des lignes proches d'une position
exports.listerLignesProches = async (req, res) => {
  try {
    const { lat, lng, distance } = req.query; // distance en mètres
    const lignes = await Ligne.find({
      $and: [
        {
          lat: { $gte: parseFloat(lat) - 0.01, $lte: parseFloat(lat) + 0.01 },
        },
        {
          lng: { $gte: parseFloat(lng) - 0.01, $lte: parseFloat(lng) + 0.01 },
        },
      ],
    }).populate('site');
    res.status(200).json(lignes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Synchroniser une ligne avec ERP/MES
exports.syncLigneERP = async (req, res) => {
  try {
    const { ligneId, action } = req.body; // action: 'start', 'stop', 'maintenance'
    const ligne = await Ligne.findById(ligneId);
    if (!ligne) return res.status(404).json({ message: 'Ligne non trouvée' });
    ligne.status = action === 'start' ? 'Active' : action === 'stop' ? 'Inactive' : 'Maintenance';
    await ligne.save();
    // Simulation d'envoi à un système ERP/MES
    res.status(200).json({ message: `Ligne ${action} synchronisée avec ERP/MES` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer les données des capteurs pour une ligne
exports.getDonneesCapteurs = async (req, res) => {
  try {
    const ligne = await Ligne.findById(req.params.id);
    if (!ligne) return res.status(404).json({ message: 'Ligne non trouvée' });
    // Simulation de données de capteurs
    const sensorData = {
      consomationTriphasé: [
        { phase: 1, value: Math.random() * 100, timestamp: new Date() },
        { phase: 2, value: Math.random() * 100, timestamp: new Date() },
        { phase: 3, value: Math.random() * 100, timestamp: new Date() },
      ],
    };
    ligne.consomationTriphasé.push(...sensorData.consomationTriphasé);
    await ligne.save();
    res.status(200).json(sensorData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Exporter les lignes en CSV
exports.exporterLignesCSV = async (req, res) => {
  try {
    const lignes = await Ligne.find().populate('site');
    const csv = [
      'Nom,Description,Longueur (km),Site,Statut,Code,Tension,Type Conducteur,Latitude,Longitude',
      ...lignes.map((ligne) => [
        ligne.nom_L,
        ligne.description,
        ligne.lengthKm || '',
        ligne.site?.name || ligne.site || '',
        ligne.status || '',
        ligne.code,
        ligne.voltage || '',
        ligne.conductorType || '',
        ligne.lat || '',
        ligne.lng || '',
      ].join(',')),
    ].join('\n');
    res.header('Content-Type', 'text/csv');
    res.attachment('lignes.csv');
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Importer des lignes à partir d'un CSV
exports.importerLignesCSV = async (req, res) => {
  try {
    const csvData = req.body.csv; // Suppose que le CSV est envoyé dans le corps
    const lignes = csvData
      .split('\n')
      .slice(1) // Ignore l'en-tête
      .map((row) => {
        const [nom_L, description, lengthKm, site, status, code, voltage, conductorType, lat, lng] = row.split(',');
        return {
          nom_L,
          description,
          lengthKm: parseFloat(lengthKm) || null,
          site,
          status,
          code,
          voltage,
          conductorType,
          lat: parseFloat(lat),
          lng: parseFloat(lng),
        };
      });
    await Ligne.insertMany(lignes);
    res.status(201).json({ message: `${lignes.length} lignes importées avec succès` });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Dupliquer une ligne
exports.dupliquerLigne = async (req, res) => {
  try {
    const ligne = await Ligne.findById(req.params.id);
    if (!ligne) return res.status(404).json({ message: 'Ligne non trouvée' });
    const nouvelleLigne = new Ligne({
      ...ligne.toObject(),
      _id: undefined, // Nouvelle ID
      nom_L: `${ligne.nom_L}_copie`,
      code: await exports.generateUniqueLigneCode(), // Nouveau code unique
    });
    await nouvelleLigne.save();
    res.status(201).json(nouvelleLigne);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Obtenir l'historique des données triphasées
exports.getHistoriqueTriphase = async (req, res) => {
  try {
    const ligne = await Ligne.findById(req.params.id);
    if (!ligne) return res.status(404).json({ message: 'Ligne non trouvée' });
    res.status(200).json({
      consomationTriphasé: ligne.consomationTriphasé,
      positiveTriphasé: ligne.positiveTriphasé,
      reverseTriphasé: ligne.reverseTriphasé,
      activePowerTriphasé: ligne.activePowerTriphasé,
      voltageCurrentTriphasé: ligne.voltageCurrentTriphasé,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};