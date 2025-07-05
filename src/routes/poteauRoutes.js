const express = require('express');
const router = express.Router();
const {
  generateUniquePoteauCode,
  creerPoteau,
  listerPoteaux,
  getPoteauParId,
  getPoteauParCode,
  updatePoteau,
  supprimerPoteau,
  listerPoteauxProches,
  syncPoteauERP,
  getDonneesCapteurs,
  exporterPoteauxCSV,
  importerPoteauxCSV,
  dupliquerPoteau,
  getPoteauxForMap,
  getPoteauxCountByLigne
} = require('../controlles/poteauControlles');

router.get('/generate-code', generateUniquePoteauCode);
router.post('/', creerPoteau);
router.get('/', listerPoteaux);
router.get('/ligne/:ligneId/count', getPoteauxCountByLigne);
router.get('/map', getPoteauxForMap);
router.get('/:id', getPoteauParId);
router.get('/code/:code', getPoteauParCode);
router.put('/:id', updatePoteau);
router.delete('/:id', supprimerPoteau);
router.get('/proches', listerPoteauxProches);
router.post('/sync-erp', syncPoteauERP);
router.get('/:id/capteurs', getDonneesCapteurs);
router.get('/export/csv', exporterPoteauxCSV);
router.post('/import/csv', importerPoteauxCSV);
router.post('/:id/duplicate', dupliquerPoteau);

module.exports = router;