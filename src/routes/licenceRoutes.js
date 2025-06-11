const express = require('express');
const router = express.Router();
const licenceController = require('../controlles/licenceControlles');

router.post('/', licenceController.createLicence);
router.get('/', licenceController.getAllLicences);
router.get('/key', licenceController.generateLicenceKeys);
router.get('/:id', licenceController.getLicenceById);
router.put('/:id', licenceController.updateLicence);
router.get('/user/:userId', licenceController.getLicencesByUser);
router.post('/by-ids', licenceController.getLicencesByIds);

router.put('/:id/renew', licenceController.renewLicence);
router.put('/:id/suspend', licenceController.suspendLicence);
router.put('/:id/reactivate', licenceController.reactivateLicence);
router.patch('/:id/regenerate-key', licenceController.regenerateLicenceKey);
router.delete('/:id', licenceController.softDeleteLicence); // Soft delete
router.get('/deleted/list', licenceController.getDeletedLicences); // Liste supprimés
router.patch('/:id/restore', licenceController.restoreLicence); // Restauration

module.exports = router;
