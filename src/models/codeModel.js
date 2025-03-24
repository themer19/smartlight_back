const mongoose = require("mongoose");
const { Schema } = mongoose;

const codeSchema = new Schema({
  email: { type: String, required: true, unique: true },
  code: { type: String, required: true }, // Code de vérification
  verified: { type: Boolean, default: false }, // Statut de vérification
});

module.exports = mongoose.model("Code", codeSchema);