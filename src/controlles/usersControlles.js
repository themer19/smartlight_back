const User = require("../models/usersModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require('dotenv').config(); // Add dotenv for environment variables

const JWT_SECRET = process.env.JWT_SECRET || "G#7fP9$s3Z1v!8QxXw&2T"; // Use environment variable

exports.ajoute = async (req, res) => {
  try {
    const { nom, prenom, email, motDePasse, cin, dateDeNaissance, genre, numéroDeTéléphone, adresse, ville, pays, codePostal } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#$%&'()*+,-./:;<=>?@[]^_`{|}~";
    const characters2 = "0123456789";
    let token = "";
    let token2 = "";
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
      valideCode: token2,
    });
    console.log(newUser);
    await newUser.save();
    res.status(201).json({ message: "Utilisateur créé avec succès !" });
  } catch (error) {
    console.error("Erreur détaillée :", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    // Validation des entrées
    if (!email || !motDePasse) {
      return res.status(400).json({ message: "L'email et le mot de passe sont requis." });
    }

    // Recherche de l'utilisateur
    const user = await User.findOne({ email }).select('+motDePasse'); // Inclure le mot de passe hashé
    if (!user) {
      return res.status(401).json({ message: "Identifiants incorrects." }); // 401 Unauthorized
    }

    // Vérification du mot de passe
    const isMatch = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!isMatch) {
      return res.status(401).json({ message: "Identifiants incorrects." });
    }

    // Vérification du statut actif
    if (!user.estActif) {
      return res.status(403).json({ 
        message: "Compte non activé. Vous recevrez un email lors de l'activation.",
        code: "ACCOUNT_NOT_ACTIVATED"
      }); // 403 Forbidden
    }

    // Génération du token JWT
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role,
        email: user.email // Ajout d'informations supplémentaires si nécessaire
      }, 
      process.env.JWT_SECRET, 
      { 
        expiresIn: '1d',
        issuer: 'your-app-name' // Bonne pratique
      }
    );

    // Réponse sécurisée
    res.status(200).json({
      success: true,
      message: "Connexion réussie",
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        nom: user.nom, // Adaptez selon votre schéma
        prenom: user.prenom
        // Ne jamais envoyer le mot de passe même hashé
      }
    });

  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    res.status(500).json({ 
      success: false,
      message: "Erreur serveur",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.validateToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ message: "Aucun token fourni." });
    }

    // Vérifier le token
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Utilisateur non trouvé." });
    }

    res.status(200).json({ message: "Token valide", user });
  } catch (error) {
    console.error("Erreur lors de la validation du token :", error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token expiré." });
    }
    res.status(401).json({ message: "Token invalide." });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur :", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }
    res.status(200).json({ message: "Utilisateur mis à jour", updatedUser });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur :", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Utilisateur supprimé avec succès." });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur :", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

exports.VerifierExistence = async (req, res) => {
  const { cin, email, numeroDeTelephone } = req.body;
  console.log(email);
  console.log(numeroDeTelephone);
  try {
    const results = {
      cinExists: false,
      emailExists: false,
      numeroDeTelephoneExists: false,
    };

    if (cin) {
      const userByCin = await User.findOne({ cin });
      results.cinExists = !!userByCin;
    }

    if (email) {
      const userByEmail = await User.findOne({ email });
      results.emailExists = !!userByEmail;
    }

    if (numeroDeTelephone) {
      const userByTelephone = await User.findOne({ numéroDeTéléphone: numeroDeTelephone });
      results.numeroDeTelephoneExists = !!userByTelephone;
    }

    return res.status(200).json(results);
  } catch (error) {
    console.error("Erreur lors de la vérification :", error);
    return res.status(500).json({ message: "Erreur serveur lors de la vérification." });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    if (users.length === 0) {
      return res.status(404).json({ message: "Aucun utilisateur trouvé." });
    }
    res.status(200).json(users);
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs :", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};


exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, email } = req.body;
    const userId = req.params.id;

    // Validate input
    if (!currentPassword || !newPassword || !email) {
      return res.status(400).json({
        message: 'Les champs email, mot de passe actuel et nouveau mot de passe sont requis.',
      });
    }

    // Validate new password strength
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(newPassword)) {
      return res.status(400).json({
        message: 'Le nouveau mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.',
      });
    }

    // Find user by ID and email
    const user = await User.findOne({ _id: userId, email }).select('+motDePasse');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé ou email incorrect.' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.motDePasse);
    if (!isMatch) {
      return res.status(401).json({ message: 'Mot de passe actuel incorrect.' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Update password using updateOne to avoid schema validation
    await User.updateOne(
      { _id: userId },
      { $set: { motDePasse: hashedNewPassword } }
    );

    res.status(200).json({ message: 'Mot de passe mis à jour avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du mot de passe :', error);
    res.status(500).json({
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

exports.getActiveUsersCount = async (req, res) => {
  try {
    const activeUsersCount = await User.countDocuments({ estActif: true });
    console.log('Nombre d\'utilisateurs actifs :', activeUsersCount);
    res.status(200).json({
      success: true,
      count: activeUsersCount,
    });
  } catch (err) {
    console.error('Erreur lors du calcul des utilisateurs actifs :', err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors du calcul des utilisateurs actifs',
      error: err.message,
    });
  }
};