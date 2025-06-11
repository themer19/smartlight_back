const express = require("express");
const router = express.Router();
const userController = require("../controlles/usersControlles");
const authController = require("../nodemail");
// Routes utilisateur
router.post("/ajoute", userController.ajoute);
router.post("/login", userController.login);
router.get("/alluser", userController.getAllUsers);

router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);
router.post("/VerifierExistence",userController.VerifierExistence);

router.post("/ForgotPassword",authController.ForgotPassword);
router.post("/ResetPassword",authController.ResetPassword);
router.post("/VerifierEmail",authController.VerifierEmail);
router.post("/renvoyercode",authController.renvoyercode);
router.post("/code",authController.EnvoyerCodeEmail);
router.post("/verifecode",authController.VerifierCodeEmail);
router.post('/envoyer-info-licence',authController.EnvoyerInfoLicence);
module.exports = router;
