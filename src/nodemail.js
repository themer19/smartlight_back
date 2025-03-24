const nodemailer = require("nodemailer");
const Code=require("./models/codeModel");
const User = require("./models/usersModel");


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
        subject: "Confirmation Email",
        text: `Your verification code is: ${verificationCode}`,
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
