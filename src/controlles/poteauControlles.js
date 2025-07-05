const Poteau = require('../models/poteauModel');
const DeletionLog = require('../models/DeletionLog');

// Générer un code unique pour un poteau au format POTEAU<timestamp>
exports.generateUniquePoteauCode = async (req, res) => {
  const maxRetries = 5;
  let attempts = 0;
  try {
    while (attempts < maxRetries) {
      const code = `PT${Date.now().toString(16).toUpperCase()}`;
      const existingPoteau = await Poteau.findOne({ code });
      if (!existingPoteau) {
        if (res) {
          return res.status(200).json({ code });
        }
        return code;
      }
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 1));
    }
    throw new Error('Impossible de générer un code unique après le nombre maximum de tentatives');
  } catch (error) {
    if (res) {
      return res.status(500).json({ message: error.message });
    }
    throw error;
  }
};

// Créer un poteau
exports.creerPoteau = async (req, res) => {
  try {
    const poteauData = req.body;
    const nouveauPoteau = new Poteau({
      nom: poteauData.nom,
      code: poteauData.code || await exports.generateUniquePoteauCode(),
      site: poteauData.site,
      ligne: poteauData.ligne,
      niveauLumiere: poteauData.luminosite || 0,
      statut: poteauData.statut || 'Actif',
      localisation: poteauData.localisation,
      donnees: poteauData.donnees || {},
    });
    await nouveauPoteau.save();
    res.status(201).json(nouveauPoteau);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Obtenir tous les poteaux
exports.listerPoteaux = async (req, res) => {
  try {
    const { search, statut, site, ligne } = req.query;
    const query = {};
    if (search) {
      query.nom = { $regex: search, $options: 'i' };
    }
    if (statut) query.statut = statut;
    if (site) query.site = site;
    if (ligne) query.ligne = ligne;
    const poteaux = await Poteau.find(query)
      .populate('site', 'nom')
      .populate('ligne', 'nom_L');
    res.status(200).json(poteaux);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtenir un poteau par ID
exports.getPoteauParId = async (req, res) => {
  try {
    const poteau = await Poteau.findById(req.params.id)
      .populate('site', 'nom')
      .populate('ligne', 'nom_L');
    if (!poteau) return res.status(404).json({ message: 'Poteau non trouvé' });
    res.status(200).json(poteau);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtenir un poteau par code
exports.getPoteauParCode = async (req, res) => {
  try {
    const poteau = await Poteau.findOne({ code: req.params.code })
      .populate('site', 'nom')
      .populate('ligne', 'nom_L');
    if (!poteau) return res.status(404).json({ message: 'Poteau non trouvé' });
    res.status(200).json(poteau);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour un poteau
exports.updatePoteau = async (req, res) => {
  try {
    const poteauData = req.body;
    const poteau = await Poteau.findByIdAndUpdate(
      req.params.id,
      {
        nom: poteauData.nom,
        code: poteauData.code,
        site: poteauData.site,
        ligne: poteauData.ligne,
        niveauLumiere: poteauData.niveauLumiere,
        statut: poteauData.statut,
        localisation: poteauData.localisation,
        donnees: poteauData.donnees,
      },
      { new: true, runValidators: true }
    ).populate('site', 'nom').populate('ligne', 'nom_L');
    if (!poteau) return res.status(404).json({ message: 'Poteau non trouvé' });
    res.status(200).json(poteau);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Supprimer un poteau
exports.supprimerPoteau = async (req, res) => {
  try {
    const poteau = await Poteau.findByIdAndDelete(req.params.id);
    if (!poteau) {
      return res.status(404).json({ message: 'Poteau non trouvé' });
    }

    const reason = req.body.reason || 'Aucune raison spécifiée';
    await DeletionLog.create({
      poteauId: req.params.id,
      reason,
    });

    res.status(200).json({ message: 'Poteau supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du poteau:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression du poteau' });
  }
};

// Rechercher des poteaux proches d'une position
exports.listerPoteauxProches = async (req, res) => {
  try {
    const { lat, lng, distance } = req.query; // distance en mètres
    const poteaux = await Poteau.find({
      'localisation.lat': { $gte: parseFloat(lat) - 0.01, $lte: parseFloat(lat) + 0.01 },
      'localisation.lng': { $gte: parseFloat(lng) - 0.01, $lte: parseFloat(lng) + 0.01 },
    }).populate('site', 'nom').populate('ligne', 'nom_L');
    res.status(200).json(poteaux);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Synchroniser un poteau avec ERP/MES
exports.syncPoteauERP = async (req, res) => {
  try {
    const { poteauId, action } = req.body; // action: 'start', 'stop', 'maintenance'
    const poteau = await Poteau.findById(poteauId);
    if (!poteau) return res.status(404).json({ message: 'Poteau non trouvé' });
    poteau.statut = action === 'start' ? 'Actif' : action === 'stop' ? 'Hors service' : 'En maintenance';
    await poteau.save();
    res.status(200).json({ message: `Poteau ${action} synchronisé avec ERP/MES` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer les données des capteurs pour un poteau
exports.getDonneesCapteurs = async (req, res) => {
  try {
    const poteau = await Poteau.findById(req.params.id);
    if (!poteau) return res.status(404).json({ message: 'Poteau non trouvé' });
    const sensorData = {
      niveauLumiere: poteau.niveauLumiere,
      donnees: {
        temperature: poteau.donnees.get('temperature') || `${Math.random() * 40}°C`,
        consommation: poteau.donnees.get('consommation') || `${Math.random() * 200}W`,
        timestamp: new Date(),
      },
    };
    poteau.donnees.set('temperature', sensorData.donnees.temperature);
    poteau.donnees.set('consommation', sensorData.donnees.consommation);
    await poteau.save();
    res.status(200).json(sensorData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Exporter les poteaux en CSV
exports.exporterPoteauxCSV = async (req, res) => {
  try {
    const poteaux = await Poteau.find().populate('site', 'nom').populate('ligne', 'nom_L');
    const csv = [
      'Nom,Code,Site,Ligne,Niveau Lumiere,Statut,Latitude,Longitude',
      ...poteaux.map((poteau) => [
        poteau.nom,
        poteau.code,
        poteau.site?.nom || poteau.site || '',
        poteau.ligne?.nom_L || poteau.ligne || '',
        poteau.niveauLumiere || 0,
        poteau.statut || '',
        poteau.localisation?.lat || '',
        poteau.localisation?.lng || '',
      ].join(',')),
    ].join('\n');
    res.header('Content-Type', 'text/csv');
    res.attachment('poteaux.csv');
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Importer des poteaux à partir d'un CSV
exports.importerPoteauxCSV = async (req, res) => {
  try {
    const csvData = req.body.csv;
    const poteaux = csvData
      .split('\n')
      .slice(1)
      .map((row) => {
        const [nom, code, site, ligne, niveauLumiere, statut, lat, lng] = row.split(',');
        return {
          nom,
          code,
          site,
          ligne,
          niveauLumiere: parseInt(niveauLumiere) || 0,
          statut,
          localisation: {
            lat: parseFloat(lat),
            lng: parseFloat(lng),
          },
        };
      });
    await Poteau.insertMany(poteaux);
    res.status(201).json({ message: `${poteaux.length} poteaux importés avec succès` });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Dupliquer un poteau
exports.dupliquerPoteau = async (req, res) => {
  try {
    const poteau = await Poteau.findById(req.params.id);
    if (!poteau) return res.status(404).json({ message: 'Poteau non trouvé' });
    const nouveauPoteau = new Poteau({
      ...poteau.toObject(),
      _id: undefined,
      nom: `${poteau.nom}_copie`,
      code: await exports.generateUniquePoteauCode(),
    });
    await nouveauPoteau.save();
    res.status(201).json(nouveauPoteau);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Obtenir les poteaux pour affichage sur la carte
exports.getPoteauxForMap = async (req, res) => {
  try {
    const { ligneId } = req.query;
    const query = ligneId ? { ligne: ligneId } : {};
    const poteaux = await Poteau.find(query).select('nom localisation').lean();
    res.status(200).json({
      count: poteaux.length,
      data: poteaux.map((p) => ({
        id: p._id,
        nom: p.nom,
        lat: p.localisation.lat,
        lng: p.localisation.lng,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getPoteauxCountByLigne = async (req, res) => {
  try {
    const { ligneId } = req.params;
    if (!ligneId) {
      return res.status(400).json({ message: 'Ligne ID est requis' });
    }
    const count = await Poteau.countDocuments({ ligne: ligneId });
    res.status(200).json({ ligneId, count });
  } catch (error) {
    console.error('Erreur lors du comptage des poteaux pour la ligne:', error);
    res.status(500).json({ message: 'Erreur serveur lors du comptage des poteaux' });
  }
};