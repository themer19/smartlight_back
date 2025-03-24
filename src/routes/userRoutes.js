const express = require("express");
const router = express.Router();
const userController = require("../controlles/usersControlles");
const authController = require("../nodemail");
// Routes utilisateur
router.post("/ajoute", userController.ajoute);
router.post("/login", userController.login);
router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);



router.post("/code",authController.EnvoyerCodeEmail);
router.post("/verifecode",authController.VerifierCodeEmail);
module.exports = router;
