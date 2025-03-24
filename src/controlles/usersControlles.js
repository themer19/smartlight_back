const User = require("../models/usersModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = "G#7fP9$s3Z1v!8QxXw&2T"; 



// Inscription d'un utilisateur
exports.ajoute = async (req, res) => {
  try {
    const { nom,prenom, email, motDePasse, cin, dateDeNaissance, genre, numéroDeTéléphone, adresse, ville, pays, codePostal } = req.body;

    // Vérifier si l'utilisateur existe déjà
    
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~"
    const characters2 = "0123456789"
    let token="";
    let token2="";
    for (let i = 0; i < 25; i++) {
    token += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(motDePasse, salt);
    const newUser = new User({
      nom,
      prenom,
      email,
      motDePasse: hashedPassword,
      cin,
      dateDeNaissance,
      genre,
      numéroDeTéléphone,
      adresse,
      ville,
      pays,
      codePostal,
      verificationCode: token,
      valideCode:token2,
    });
    console.log(newUser)
    await newUser.save();
    res.status(201).json({ message: "Utilisateur créé avec succès !" });
  }  catch (error) {
    console.error("Erreur détaillée :", error); // Loguer l'erreur pour débogage
    res.status(500).json({ message: "Erreur serveur", error }); // Inclure l'erreur dans la réponse si nécessaire
}
 
};

// Connexion d'un utilisateur
exports.login = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email incorrect." });
    }

    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!isMatch) {
      return res.status(400).json({ message: "mot de passe incorrect." });
    }
    if (user && isMatch && !user.estActif) {
      return res.status(400).json({ message: "compte no active" });
    }
    // Générer un token JWT
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: 86400 });

    res.status(200).json({ message: "Connexion réussie", token, user });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// Récupérer un utilisateur par ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// Mettre à jour un utilisateur
exports.updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }
    res.status(200).json({ message: "Utilisateur mis à jour", updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// Supprimer un utilisateur
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Utilisateur supprimé avec succès." });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};
