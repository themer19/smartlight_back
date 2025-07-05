const express = require('express');
const router = express.Router();
const {
  creerPlanification,
  listerPlanifications,
  getPlanificationParId,
  updatePlanification,
  supprimerPlanification,
  togglePlanificationStatut,
  exporterPlanificationsCSV,
  importerPlanificationsCSV,
  listerPlanificationsParLigne,
  getPlanificationsCountByLigne,
} = require('../controlles/planificationController');

router.post('/', creerPlanification);
router.get('/', listerPlanifications);
router.get('/ligne/:ligneId', listerPlanificationsParLigne);
router.get('/ligne/:ligneId/count', getPlanificationsCountByLigne);
router.get('/:id', getPlanificationParId);
router.put('/:id', updatePlanification);
router.delete('/:id', supprimerPlanification);
router.patch('/:id/toggle', togglePlanificationStatut);
router.get('/export/csv', exporterPlanificationsCSV);
router.post('/import/csv', importerPlanificationsCSV);

module.exports = router;