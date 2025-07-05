const mongoose = require('mongoose');

const deletionLogSchema = new mongoose.Schema({
  siteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Site',
    
  },
  lineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ligne',
    
  },
  poteauId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Poteau',
  },
  reason: {
    type: String,
    default: '',
  },
  deletedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('DeletionLog', deletionLogSchema);