const Site = require('../models/siteModel');

// Créer un site
exports.creerSite = async (req, res) => {
  try {
    const nouveauSite = new Site(req.body);
    await nouveauSite.save();
    res.status(201).json(nouveauSite);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Obtenir tous les sites
exports.listerSites = async (req, res) => {
  try {
    const sites = await Site.find();
    res.status(200).json(sites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtenir un site par ID
exports.getSiteParId = async (req, res) => {
  try {
    const site = await Site.findById(req.params.id);
    if (!site) return res.status(404).json({ message: 'Site non trouvé' });
    res.status(200).json(site);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour un site
exports.updateSite = async (req, res) => {
  try {
    const site = await Site.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!site) return res.status(404).json({ message: 'Site non trouvé' });
    res.status(200).json(site);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Supprimer un site
exports.supprimerSite = async (req, res) => {
  try {
    const site = await Site.findByIdAndDelete(req.params.id);
    if (!site) return res.status(404).json({ message: 'Site non trouvé' });
    res.status(200).json({ message: 'Site supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTotalSitesCount = async (req, res) => {
  try {
    const totalSitesCount = await Site.countDocuments();
    console.log('Nombre total de sites :', totalSitesCount);
    res.status(200).json({
      success: true,
      count: totalSitesCount,
    });
  } catch (error) {
    console.error('Erreur lors du calcul du nombre total de sites :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors du calcul du nombre total de sites',
      error: error.message,
    });
  }
};