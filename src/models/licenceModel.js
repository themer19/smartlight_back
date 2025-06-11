const mongoose = require('mongoose');

const licenceSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  utilisateurId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  statut: {
    type: String,
    enum: ['Active', 'Inactive', 'Deleted'],
    default: 'Active'
  },
  type: {
    type: String,
    enum: ['Public', 'Privé', 'Résidentiel'], // ajoute 'Résidentiel' si tu l'utilises
    default: 'Public'
  },
  cleLicence: { type: String, required: true, unique: true },
  dateExpiration: { type: Date, required: true },
  identifiantUnique: { type: String, required: true, unique: true },
  lampadairesMax: { type: Number, required: true },
  zone: { type: String, required: true,default: 'Non spécifiée' },
  dateCreation: { type: Date, default: Date.now },
  
deleted: {
    type: Boolean,
    default: false,
    select: false // Masqué par défaut dans les requêtes
  },
  deletionInfo: {
    reason: { type: String }, // Raison de la suppression
    deletedBy: { // Qui a effectué la suppression
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    deletedAt: { type: Date } // Quand la suppression a été effectuée
  }
}, { 
  timestamps: true // Ajoute automatiquement createdAt et updatedAt
});

licenceSchema.pre(/^find/, function(next) {
  if (!this.getOptions().includeDeleted) {
    this.where({ deleted: { $ne: true } });
  }
  next();
});

// Méthodes
licenceSchema.methods.softDelete = async function(userId, reason) {
  this.deleted = true;
  this.statut = 'Deleted';
  this.deletionInfo = { reason, deletedBy: userId, deletedAt: new Date() };
  return this.save();
};

licenceSchema.methods.restore = async function() {
  this.deleted = false;
  this.statut = 'Active';
  this.deletionInfo = undefined;
  return this.save();
};

module.exports = mongoose.model('Licence', licenceSchema);
