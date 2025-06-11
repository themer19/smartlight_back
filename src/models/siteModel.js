const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const siteSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
    trim: true
  },
  localisation: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    }
  },
  status: {
    type: String,
  },
  description: {        
    type: String,
    default: '',         
  },
  data: {
    capteurs: {
      type: Number,
      default: 0  
    },
    consommation: {
      type: String,
      default: ''  
    },
    température: {
      type: String,
      default: ''  
    }
  },
  dateInstallation: {
    type: Date,
    required: true
  },
  derniereMiseAJour: {
    type: Date,
    default: Date.now
  },
  ligne: [{
    type: Schema.Types.ObjectId,
    ref: "ligne",
    default : [],
}],
users: {
  type: Schema.Types.ObjectId,
  ref: "User",
},

});
const Site = mongoose.model("Site", siteSchema);

module.exports = mongoose.model('Site', siteSchema);
