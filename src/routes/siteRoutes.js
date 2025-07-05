const express = require('express');
const router = express.Router();
const siteController = require('../controlles/siteControlles');

// Créer un site
router.post('/site', siteController.creerSite);

// Obtenir tous les sites
router.get('/allsite', siteController.listerSites);

router.get('/allsite', siteController.listerSites);
router.get('/total-sites-count',siteController.getTotalSitesCount);
// Obtenir un site par ID
router.get('/site/:id', siteController.getSiteParId);

// Mettre à jour un site
router.put('/sitemise/:id', siteController.updateSite);

// Supprimer un site
router.delete('/sitedel/:id', siteController.supprimerSite);

module.exports = router;
