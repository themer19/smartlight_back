const mongoose = require("mongoose");
const { Schema } = mongoose;
const userSchema = new Schema({
  nom: {
    type: String, 
    required: true
  },
  prenom: {
    type: String, 
    required: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, // Convertit l'email en minuscules
    validate: {
      validator: function(v) {
        return /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(v); // Regex pour valider l'email (insensible à la casse)
      },
      message: props => `${props.value} n'est pas un email valide!`
    }
  },
  motDePasse: { 
    type: String, 
    required: true, 
    minlength: 8, // Longueur minimale de 8 caractères (ajustable selon vos besoins)
    validate: {
      validator: function(v) {
        // Vérifie si le mot de passe contient au moins une lettre minuscule,
        // une lettre majuscule, un chiffre et un symbole
        return /[a-z]/.test(v) && 
               /[A-Z]/.test(v) && 
               /\d/.test(v) && 
               /[!@#$%^&*(),.?":{}|<>]/.test(v); // Ajoutez les symboles que vous souhaitez autoriser
      },
      message: props => `${props.value} doit contenir au moins une lettre minuscule, une lettre majuscule, un chiffre et un symbole!`
    }
  },
  role: { 
    type: String, 
    required: true, 
    default: 'utilisateur'
  },
  cin: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: function(v) {
        return /^\d{8}$/.test(v); // Vérifie si le cin contient exactement 8 chiffres
      },
      message: props => `${props.value} doit contenir exactement 8 chiffres!`
    }
  },
  dateDeNaissance: { type: Date, required: true },
  genre: { type: String, required: true },
  numéroDeTéléphone: { type: String, required: true },
  adresse: { type: String, required: true,default: "Charguia 2"},
  ville: { type: String, required: true,default: "Tunis" },
  pays: { type: String, required: true,default: "Tunis" },
  codePostal: { type: String, required: true,default: "0000" },
  crééLe: { type: Date, default: Date.now },
  misÀJourLe: { type: Date, default: Date.now },
  dernierConnexion: { type: Date },
  photoDeProfil: { type: String },
  biographie: { type: String },
  estActif: { type: Boolean, default: false },
  verificationCode: { type: String, select: false }, 
  valideCode: { type: String, select: false }, 
  forgetPasswordCode: { type: String, select: false },
  license: [{
    type: Schema.Types.ObjectId,
    ref: "license",
    default: [],
}], 
});

// Middleware pour vérifier si l'email existe déjà
userSchema.pre('save', async function (next) {
  const existingUser = await mongoose.model("User").findOne({ email: this.email });
  if (existingUser) {
    const error = new Error('Cet email est déjà utilisé. Veuillez en choisir un autre.');
    next(error);
  } else {
    this.misÀJourLe = Date.now(); // Met à jour la date de mise à jour
    next();
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
