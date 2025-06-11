const mongoose = require('mongoose');

const poteauSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom du poteau est requis'],
    trim: true,
    maxlength: [100, 'Le nom ne peut dépasser 100 caractères'],
  },
  code: {
    type: String,
    required: [true, 'Le code du poteau est requis'],
    unique: true,
    trim: true,
    maxlength: [50, 'Le code ne peut dépasser 50 caractères'],
  },
  site: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Site',
    required: [true, 'Le site associé est requis'],
  },
  ligne: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ligne',
    required: [true, 'La ligne associée est requise'],
  },
  niveauLumiere: {
    type: Number,
    required: [true, 'Le niveau de lumière est requis'],
    min: [0, 'Le niveau de lumière ne peut être négatif'],
    max: [100, 'Le niveau de lumière ne peut dépasser 100'],
  },
  statut: {
    type: String,
    enum: {
      values: ['Actif', 'En maintenance', 'Hors service'],
      message: 'Statut invalide. Valeurs possibles : Actif, En maintenance, Hors service',
    },
    default: 'Actif',
  },
  donnees: {
    type: Map,
    of: String,
    default: {},
  },
  localisation: {
    type: {
      lat: {
        type: Number,
        required: [true, 'La latitude est requise'],
        min: [-90, 'Latitude invalide'],
        max: [90, 'Latitude invalide'],
      },
      lng: {
        type: Number,
        required: [true, 'La longitude est requise'],
        min: [-180, 'Longitude invalide'],
        max: [180, 'Longitude invalide'],
      },
    },
    required: [true, 'La localisation est requise'],
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Poteau', poteauSchema);