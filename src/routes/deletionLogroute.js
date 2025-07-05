const express = require('express');
const router = express.Router();
const deletionLogController = require('../controlles/deletionLogController');

router.get('/logs', deletionLogController.getAllLogs);

router.post('/logs', deletionLogController.createLog);

router.get('/logs/:id', deletionLogController.getLogById);

module.exports = router;