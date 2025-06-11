const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const LigneSchema = new Schema({
    nom_L: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    lengthKm: {
        type: Number,
        required: false,
        min: 0, // Longueur en kilomètres, doit être positive ou nulle
    },
    site: {   
        type: Schema.Types.ObjectId,
        ref: "Site",
        required: true,
    },
    users: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    startPoint: {
    name: {
      type: String,
      
    },
    lat: {
      type: Number,
      
    },
    lng: {
      type: Number,
      
    },
  },
  endPoint: {
    name: {
      type: String,
      
    },
    lat: {
      type: Number,
      
    },
    lng: {
      type: Number,
      
    },
  },
    status: {   
        type: String,
    },
    data: {
        type: Array,
        default: [],
    },
    consomation: {
        type: Array,
        default: [],
    },
    countersdata: {
        type: Array,
        default: [],
    },
    type: {
        type: String,
        default: 'triphase',
    },
    type_conducteur: {
        type: String,
        default: 'cuivre',
    },
    consomationTriphasé: {
        type: Array,
        default: [],
    },
    positiveTriphasé: {
        type: Array,
        default: [],
    },
    reverseTriphasé: {
        type: Array,
        default: [],
    },
    activePowerTriphasé: {
        type: Array,
        default: [],
    },
    voltageCurrentTriphasé: {
        type: Array,
        default: [],
    },
    code: {
        type: String, // Génère un code unique basé sur le timestamp
        unique: true, // Assure l'unicité
    },
    reason: {
    type: String,
    default: '',
  },
  deletedAt: {
    type: Date,
    default: Date.now,
  },
},
{
    timestamps: true
});
const ligne = mongoose.model("ligne", LigneSchema);

module.exports = mongoose.model('ligne', LigneSchema);