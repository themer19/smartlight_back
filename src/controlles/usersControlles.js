const User = require("../models/usersModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = "G#7fP9$s3Z1v!8QxXw&2T"; 




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


exports.login = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

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
      return res.status(400).json({ message: "Votre compte n'est pas activé. Vous recevrez un e-mail dès qu'il sera activé." });
    }
    // Générer un token JWT
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: 86400 });

    res.status(200).json({ message: "Connexion réussie", token, user });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
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
    res.status(500).json({ message: "Erreur serveur", error });
  }
};


exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Utilisateur supprimé avec succès." });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

exports.VerifierExistence = async (req, res) => {
  const { cin, email, numeroDeTelephone } = req.body;
  console.log(email);

  console.log(numeroDeTelephone);
  try {
    // Initialisation d'un tableau pour stocker les résultats
    const results = {
      cinExists: false,
      emailExists: false,
      numeroDeTelephoneExists: false,
    };

    // Vérifiez l'existence de l'utilisateur par CIN
    if (cin) {
      const userByCin = await User.findOne({ cin });
      results.cinExists = !!userByCin; // true si l'utilisateur existe
    }

    // Vérifiez l'existence de l'utilisateur par email
    if (email) {
      const userByEmail = await User.findOne({ email });
      results.emailExists = !!userByEmail; // true si l'utilisateur existe
    }

    // Vérifiez l'existence de l'utilisateur par numéro de téléphone
    if (numeroDeTelephone) {
      const userByTelephone = await User.findOne({ numéroDeTéléphone: numeroDeTelephone });
      results.numeroDeTelephoneExists = !!userByTelephone; // true si l'utilisateur existe
    }

    return res.status(200).json(results); // Retournez tous les résultats
  } catch (error) {
    console.error("Erreur lors de la vérification :", error);
    return res.status(500).json({ message: "Erreur serveur lors de la vérification." });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    // Récupérer tous les utilisateurs de la base de données
    const users = await User.find();
    
    // Si aucun utilisateur n'est trouvé, renvoyer un message approprié
    if (users.length === 0) {
      return res.status(404).json({ message: "Aucun utilisateur trouvé." });
    }

    // Renvoyer la liste des utilisateurs en réponse
    res.status(200).json(users);
  } catch (error) {
    // En cas d'erreur, renvoyer un message d'erreur
    res.status(500).json({ message: "Erreur serveur", error });
  }
};