const nodemailer = require("nodemailer");
const Code=require("./models/codeModel");
const User = require("./models/usersModel");
require('dotenv').config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "fned.themer7@gmail.com", 
      pass: "prju bohb ftqf zhhc", 
    },
  });

  const generateVerificationCode = () => {
    let code = "";
    const characters = "0123456789"; // Seulement des chiffres
    for (let i = 0; i < 5; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  };
  exports.EnvoyerCodeEmail = async (req, res) => {
    try {
      const { email } = req.body; 
      const verificationCode = generateVerificationCode(); 
      const user = await User.findOne({ email });
      if (!user) {
      transporter.sendMail({
        from: "fned.themer7@gmail.com",
        to: email,
        subject: "vérification Email",
        html: `
      <div style="text-align: center;">
        <p>Pour confirmer votre identité, veuillez utiliser le code de vérification suivant :  <strong>${verificationCode}</strong></p>
      </div>
    `,
      });
      const code = new Code({
        email: email,
        code: verificationCode,
      });
      await code.save();
      res.status(200).json({ message: "Email envoyé avec succès" });
    }
    else 
    {
      console.error("cette email deja utilise ");
      res.status(400).json({ message: "Cet email est déjà utilisé." });
    }
  } catch (error) {
      console.error("Erreur lors de l'envoi de l'email :", error);
      res.status(500).json({ message: "Erreur lors de l'envoi de l'email" });
    }
  };

  exports.renvoyercode = async (req, res) => {
    try {
      const { email } = req.body; 
  
      console.log(email);
      const code = await Code.findOne({ email });
      console.log(code);
      if (!code) {
        return res.status(404).json({ message: "Utilisateur non trouvé." });
      }
  
      const verificationCode = generateVerificationCode();
      code.code = verificationCode; 
      transporter.sendMail({
        from: "fned.themer7@gmail.com",
        to: email,
        subject: "Confirmation Email",
        text: `Your verification code is: ${verificationCode}`,
      });
      await code.save();
  
      res.status(200).json({ message: "code mis à jour avec succès"});
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
      res.status(500).json({ message: "Erreur serveur lors de la mise à jour." });
    }
  };
  
  exports.VerifierCodeEmail = async (req, res) => {
    try {
        const { email, verificationCode } = req.body; // On récupère l'email et le code depuis le corps de la requête

        // Trouver le code de vérification correspondant à l'email
        const codeEntry = await Code.findOne({ email });

        // Vérifiez si l'entrée de code existe et si le code correspond
        if (codeEntry && codeEntry.code === verificationCode) {
            // Si le code est correct, vous pouvez faire quelque chose ici, comme marquer l'email comme vérifié
            await User.updateOne({ email }, { verified: true }); // Par exemple, marquer l'utilisateur comme vérifié

            res.status(200).json({ valid: true, message: "Code de vérification valide." });
        } else {
            res.status(400).json({ valid: false,message: "Code de vérification invalide." });
        }
    } catch (error) {
        console.error("Erreur lors de la vérification du code :", error);
        res.status(500).json({ message: "Erreur lors de la vérification du code." });
    }
};

exports.VerifierEmail = async (req, res) => {
  const { email } = req.body; 
  
  try {
    const user = await User.findOne({ email }); 
    if (user) {
      return res.status(200).json({ exists: true });
    }
    return res.status(200).json({ exists: false });
  } catch (error) {
    console.error("Erreur lors de la vérification de l'email :", error);
    return res.status(500).json({ message: "Erreur serveur lors de la vérification." });
  }
};

exports.ForgotPassword = async (req, res) => {
  try {
      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
          return res.status(404).json({ message: "Utilisateur non trouvé." });
      }

      // Génération du token valable 1 heure
      const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "15m" }); // Utilisez la clé secrète du fichier .env

      // Envoi de l'email avec le lien de réinitialisation
      const resetLink = `http://localhost:5173/MotpasseM/${token}`;
      await transporter.sendMail({
          from: process.env.EMAIL_USER, // Utilisez la variable d'environnement
          to: email,
          subject: "Réinitialisation du mot de passe",
          text: `Cliquez sur le lien suivant pour réinitialiser votre mot de passe : ${resetLink}\n\nCe lien expire dans 15 minutes.`,
      });

      res.status(200).json({ message: "Email de réinitialisation envoyé." });
  } catch (error) {
      console.error("Erreur lors de la demande de réinitialisation :", error);
      res.status(500).json({ message: "Erreur serveur." });
  }
};

// Étape 2 : Vérification du token et mise à jour du mot de passe
exports.ResetPassword = async (req, res) => {
  try {
      const {token, newPassword} = req.body;
      console.log(token);
      console.log(newPassword);
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Utilisez la clé secrète du fichier .env
      const email = decoded.email;
      // Hachage du nouveau mot de passe
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Mise à jour dans la base de données
      await User.updateOne({ email }, { motDePasse: hashedPassword });

      res.status(200).json({ message: "Mot de passe mis à jour avec succès." });
  } catch (error) {
      console.error("Erreur lors de la réinitialisation du mot de passe :", error);
      console.log("fffffff")
      res.status(400).json({ message: "Lien invalide ou expiré." });
  }
};

exports.EnvoyerInfoLicence = async (req, res) => {
  try {
    const { email, licenceType, nomClient } = req.body;

    // Envoyer l'email avec les infos de licence
    await transporter.sendMail({
      from: `"Service Clients" <fned.themer7@gmail.com>`,
      to: email,
      subject: `🎟️ Votre Licence ${licenceType} - Confirmation`,
      html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0;">Votre Licence est Prête !</h1>
        </div>
        
        <div style="padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px;">Bonjour ${nomClient || 'Cher Client'},</p>
          
          <p style="font-size: 16px;">Nous vous confirmons l'activation de votre licence avec les détails suivants :</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #6a11cb;">
            <h3 style="margin-top: 0; color: #2c3e50;">📋 Détails de la Licence</h3>
            <p style="margin-bottom: 5px;"><strong>Type :</strong> ${licenceType || 'Non spécifié'}</p>
            <p style="margin-bottom: 5px;"><strong>Statut :</strong> <span style="color: #28a745; font-weight: 500;">Active</span></p>
            <p style="margin-bottom: 0;"><strong>Date d'activation :</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
          </div>
          
          <p style="font-size: 16px;">Pour toute question concernant votre licence, notre équipe est à votre disposition.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="mailto:support@votresite.com" style="background: #6a11cb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: 500; display: inline-block;">
              Contacter le Support
            </a>
          </div>
          
          <p style="font-size: 14px; color: #7f8c8d; border-top: 1px solid #eee; padding-top: 15px; margin-bottom: 0;">
            Cordialement,<br>
            <strong>L'Équipe de VotreApplication</strong>
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <img src="https://votresite.com/logo.png" alt="Logo" width="120" style="opacity: 0.8;">
        </div>
      </div>
      `,
    });

    res.status(200).json({ 
      success: true,
      message: "Email de confirmation envoyé avec succès",
      data: {
        licenceType,
        sentAt: new Date()
      }
    });

  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({ 
      success: false,
      message: "Erreur lors de l'envoi de l'email de confirmation",
      error: error.message 
    });
  }
};