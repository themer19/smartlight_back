const Planification = require('../models/planificationModel');
const DeletionLog = require('../models/DeletionLog');

// Créer une planification
exports.creerPlanification = async (req, res) => {
  try {
    const planData = req.body;
    if (!planData.site && !planData.ligne) {
      return res.status(400).json({ message: 'Veuillez sélectionner un site ou une ligne' });
    }
    if (planData.mode === 'Saisonnière' && !planData.saison) {
      return res.status(400).json({ message: 'Veuillez sélectionner une saison pour le mode Saisonnière' });
    }
    const nouvellePlanification = new Planification({
      site: planData.site || null,
      ligne: planData.ligne || null,
      timeSlots: planData.timeSlots,
      frequence: planData.frequence,
      mode: planData.mode,
      statut: planData.statut,
      repetition: planData.repetition,
      saison: planData.saison || '',
      donnees: planData.donnees || {},
    });
    await nouvellePlanification.save();
    const populatedPlan = await Planification.findById(nouvellePlanification._id)
      .populate('site', 'nom')
      .populate('ligne', 'nom_L');
    res.status(201).json(populatedPlan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Lister toutes les planifications
exports.listerPlanifications = async (req, res) => {
  try {
    const { search, frequence, mode, statut, site, ligne } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { 'site.nom': { $regex: search, $options: 'i' } },
        { 'ligne.nom_L': { $regex: search, $options: 'i' } },
      ];
    }
    if (frequence) query.frequence = frequence;
    if (mode) query.mode = mode;
    if (statut) query.statut = statut;
    if (site) query.site = site;
    if (ligne) query.ligne = ligne;
    const planifications = await Planification.find(query)
      .populate('site', 'nom')
      .populate('ligne', 'nom_L');
    res.status(200).json(planifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtenir une planification par ID
exports.getPlanificationParId = async (req, res) => {
  try {
    const planification = await Planification.findById(req.params.id)
      .populate('site', 'nom')
      .populate('ligne', 'nom_L');
    if (!planification) {
      return res.status(404).json({ message: 'Planification non trouvée' });
    }
    res.status(200).json(planification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour une planification
exports.updatePlanification = async (req, res) => {
  try {
    const planData = req.body;
    if (!planData.site && !planData.ligne) {
      return res.status(400).json({ message: 'Veuillez sélectionner un site ou une ligne' });
    }
    if (planData.mode === 'Saisonnière' && !planData.saison) {
      return res.status(400).json({ message: 'Veuillez sélectionner une saison pour le mode Saisonnière' });
    }
    const planification = await Planification.findByIdAndUpdate(
      req.params.id,
      {
        site: planData.site || null,
        ligne: planData.ligne || null,
        timeSlots: planData.timeSlots,
        frequence: planData.frequence,
        mode: planData.mode,
        statut: planData.statut,
        repetition: planData.repetition,
        saison: planData.saison || '',
        donnees: planData.donnees,
      },
      { new: true, runValidators: true }
    ).populate('site', 'nom').populate('ligne', 'nom_L');
    if (!planification) {
      return res.status(404).json({ message: 'Planification non trouvée' });
    }
    res.status(200).json(planification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Supprimer une planification
exports.supprimerPlanification = async (req, res) => {
  try {
    const planification = await Planification.findByIdAndDelete(req.params.id);
    if (!planification) {
      return res.status(404).json({ message: 'Planification non trouvée' });
    }
    const reason = req.body.reason || 'Aucune raison spécifiée';
    await DeletionLog.create({
      planificationId: req.params.id,
      reason,
    });
    res.status(200).json({ message: 'Planification supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Basculer le statut d'une planification
exports.togglePlanificationStatut = async (req, res) => {
  try {
    const planification = await Planification.findById(req.params.id);
    if (!planification) {
      return res.status(404).json({ message: 'Planification non trouvée' });
    }
    planification.statut = planification.statut === 'Activé' ? 'Désactivé' : 'Activé';
    await planification.save();
    const populatedPlan = await Planification.findById(planification._id)
      .populate('site', 'nom')
      .populate('ligne', 'nom_L');
    res.status(200).json(populatedPlan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Exporter les planifications en CSV
exports.exporterPlanificationsCSV = async (req, res) => {
  try {
    const planifications = await Planification.find()
      .populate('site', 'nom')
      .populate('ligne', 'nom_L');
    const csv = [
      'Site,Ligne,Debut,Fin,Intensite,Frequence,Mode,Statut,Repetition,Saison',
      ...planifications.map((plan) => [
        plan.site?.nom || plan.site || '',
        plan.ligne?.nom_L || plan.ligne || '',
        plan.timeSlots.map(slot => slot.startTime.toISOString()).join(';'),
        plan.timeSlots.map(slot => slot.endTime.toISOString()).join(';'),
        plan.timeSlots.map(slot => slot.intensity).join(';'),
        plan.frequence || '',
        plan.mode || '',
        plan.statut || '',
        plan.repetition ? 'Oui' : 'Non',
        plan.saison || '',
      ].join(',')),
    ].join('\n');
    res.header('Content-Type', 'text/csv');
    res.attachment('planifications.csv');
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Importer des planifications à partir d'un CSV
exports.importerPlanificationsCSV = async (req, res) => {
  try {
    const csvData = req.body.csv;
    const planifications = csvData
      .split('\n')
      .slice(1)
      .map((row) => {
        const [site, ligne, startTimes, endTimes, intensities, frequence, mode, statut, repetition, saison] = row.split(',');
        const timeSlots = startTimes.split(';').map((start, i) => ({
          startTime: new Date(start),
          endTime: new Date(endTimes.split(';')[i]),
          intensity: parseInt(intensities.split(';')[i]),
        }));
        return {
          site,
          ligne,
          timeSlots,
          frequence,
          mode,
          statut,
          repetition: repetition === 'Oui',
          saison,
        };
      });
    await Planification.insertMany(planifications);
    res.status(201).json({ message: `${planifications.length} planifications importées avec succès` });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Lister les planifications par ligne
exports.listerPlanificationsParLigne = async (req, res) => {
  try {
    const { ligneId } = req.params;
    const planifications = await Planification.find({ ligne: ligneId })
      .populate('site', 'nom')
      .populate('ligne', 'nom_L');
    res.status(200).json(planifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Compter les planifications par ligne
exports.getPlanificationsCountByLigne = async (req, res) => {
  try {
    const { ligneId } = req.params;
    if (!ligneId) {
      return res.status(400).json({ message: 'Ligne ID est requis' });
    }
    const count = await Planification.countDocuments({ ligne: ligneId });
    res.status(200).json({ ligneId, count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};