const express = require('express');
const router = express.Router();
const ligneController = require('../controlles/ligneControlles');

router.get('/generate-code', ligneController.generateUniqueLigneCode);
router.post('/', ligneController.creerLigne);
router.get('/', ligneController.listerLignes);
router.get('/:id', ligneController.getLigneParId);
router.get('/code/:code', ligneController.getLigneParCode);
router.put('/:id', ligneController.updateLigne);
router.delete('/:id', ligneController.supprimerLigne);
router.get('/proches', ligneController.listerLignesProches);
router.post('/sync-erp', ligneController.syncLigneERP);
router.get('/:id/capteurs', ligneController.getDonneesCapteurs);
router.get('/export/csv', ligneController.exporterLignesCSV);
router.post('/import/csv', ligneController.importerLignesCSV);
router.post('/:id/dupliquer', ligneController.dupliquerLigne);
router.get('/:id/historique-triphase', ligneController.getHistoriqueTriphase);
module.exports = router;