const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  startTime: {
    type: Date,
    required: [true, 'L\'heure de début est requise'],
  },
  endTime: {
    type: Date,
    required: [true, 'L\'heure de fin est requise'],
  },
  intensity: {
    type: Number,
    required: [true, 'L\'intensité est requise'],
    min: [10, 'L\'intensité doit être au moins 10%'],
    max: [100, 'L\'intensité ne peut dépasser 100%'],
  },
});

const planificationSchema = new mongoose.Schema({
  site: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Site',
  },
  ligne: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ligne',
  },
  timeSlots: {
    type: [timeSlotSchema],
    required: [true, 'Au moins une plage horaire est requise'],
    validate: {
      validator: function (slots) {
        return slots.length > 0;
      },
      message: 'Au moins une plage horaire est requise',
    },
  },
  frequence: {
    type: String,
    enum: {
      values: ['Quotidien', 'Hebdomadaire', 'Ponctuel'],
      message: 'Fréquence invalide. Valeurs possibles : Quotidien, Hebdomadaire, Ponctuel',
    },
    required: [true, 'La fréquence est requise'],
    default: 'Quotidien',
  },
  mode: {
    type: String,
    enum: {
      values: ['Manuel', 'Automatique', 'Saisonnière', 'Astronomique'],
      message: 'Mode invalide. Valeurs possibles : Manuel, Automatique, Saisonnière, Astronomique',
    },
    required: [true, 'Le mode est requis'],
    default: 'Manuel',
  },
  statut: {
    type: String,
    enum: {
      values: ['Activé', 'Désactivé'],
      message: 'Statut invalide. Valeurs possibles : Activé, Désactivé',
    },
    default: 'Activé',
  },
  repetition: {
    type: Boolean,
    default: false,
  },
  saison: {
    type: String,
    enum: {
      values: ['Hiver', 'Printemps', 'Été', 'Automne', ''],
      message: 'Saison invalide. Valeurs possibles : Hiver, Printemps, Été, Automne',
    },
    default: '',
  },
  donnees: {
    type: Map,
    of: String,
    default: {},
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Planification', planificationSchema);