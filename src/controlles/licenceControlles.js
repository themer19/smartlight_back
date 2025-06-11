const Licence = require('../models/licenceModel');
const User = require('../models/usersModel');
const crypto = require('crypto');
const mongoose = require('mongoose');


exports.createLicence = async (req, res) => {
  try {
    // Log des données reçues
    console.log('Données reçues pour la création de la licence :', req.body);

    // Vérifier que utilisateurId est présent et valide
    if (!req.body.utilisateurId) {
      console.error('utilisateurId manquant dans req.body');
      return res.status(400).json({ message: 'utilisateurId est requis' });
    }
    if (!mongoose.Types.ObjectId.isValid(req.body.utilisateurId)) {
      console.error('utilisateurId invalide :', req.body.utilisateurId);
      return res.status(400).json({ message: 'utilisateurId invalide' });
    }

    // Vérifier que responsable est présent et valide
    const validRoles = ['Admin', 'Technicien', 'Superviseur'];
    if (!req.body.responsable || !validRoles.includes(req.body.responsable)) {
      console.error('responsable manquant ou invalide :', req.body.responsable);
      return res.status(400).json({ message: `responsable doit être l'un des suivants : ${validRoles.join(', ')}` });
    }
    console.log('Valeur de responsable reçue :', req.body.responsable);

    // Créer la licence
    const licence = new Licence(req.body);
    await licence.save();
    console.log('Licence créée avec succès :', licence);

    // Mettre à jour l'utilisateur
    const userUpdate = await User.findByIdAndUpdate(
      licence.utilisateurId,
      {
        $addToSet: { license: licence._id },
        $set: {
          estActif: true,
          role: req.body.responsable, // Utiliser req.body.responsable au lieu de licence.responsable
        },
      },
      { new: true, runValidators: true } // Retourner le document mis à jour et valider
    );

    if (!userUpdate) {
      console.error('Utilisateur non trouvé pour mise à jour :', licence.utilisateurId);
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    console.log('Utilisateur mis à jour :', userUpdate);
    console.log('Nouveau rôle de l\'utilisateur :', userUpdate.role);

    res.status(201).json(licence);
  } catch (err) {
    console.error('Erreur lors de la création de la licence :', err);
    if (err.name === 'ValidationError') {
      console.error('Détails de l\'erreur de validation :', err.errors);
      return res.status(400).json({ message: 'Erreur de validation', details: err.errors });
    }
    res.status(400).json({ message: err.message });
  }
};

exports.getAllLicences = async (req, res) => {
  try {
    const licences = await Licence.find().populate('utilisateurId');
    res.json(licences);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getLicenceById = async (req, res) => {
  try {
    const licence = await Licence.findById(req.params.id).populate('utilisateurId');
    if (!licence) return res.status(404).json({ message: 'Licence non trouvée' });
    res.json(licence);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateLicence = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, type, zone } = req.body;

    if (!nom || !type || !zone) {
      return res.status(400).json({ message: 'Tous les champs obligatoires doivent être fournis' });
    }

    const licence = await Licence.findByIdAndUpdate(
      id,
      { nom, type, zone },
      { new: true, runValidators: true }
    );

    if (!licence) {
      return res.status(404).json({ message: 'Licence non trouvée' });
    }

    res.json({
      message: 'Licence modifiée avec succès',
      licence,
    });
  } catch (err) {
    console.error('Erreur lors de la modification de la licence:', err);
    res.status(500).json({
      message: 'Erreur lors de la modification de la licence',
      error: err.message,
    });
  }
};

exports.deleteLicence = async (req, res) => {
  try {
    const licence = await Licence.findByIdAndDelete(req.params.id);
    if (!licence) return res.status(404).json({ message: 'Licence non trouvée' });
    
    await User.findByIdAndUpdate(licence.responsable, {
      $pull: { license: licence._id }
    });

    res.json({ message: 'Licence supprimée avec succès' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getLicencesByUser = async (req, res) => {
  try {
    const licences = await Licence.find({ responsable: req.params.userId });
    res.json(licences);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate('license');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

function generateKeyWithDashes() {
  const raw = crypto.randomBytes(8).toString('hex'); // 16 caractères hex
  return raw.match(/.{1,4}/g).join('-');
}

function generateIdentifier() {
  return crypto.randomBytes(8).toString('hex'); // 16 caractères hex
}

exports.generateLicenceKeys = async (req, res) => {
  try {
    let cleLicence, identifiantUnique, existing;

    do {
      cleLicence = generateKeyWithDashes();
      identifiantUnique = generateIdentifier();

      existing = await Licence.findOne({
        $or: [{ cleLicence }, { identifiantUnique }]
      });
    } while (existing);

    res.json({ cleLicence, identifiantUnique });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getLicencesByIds = async (req, res) => {
  try {
    const { ids } = req.body; // Attendre un tableau d'IDs dans le body
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Un tableau d\'IDs valide est requis' });
    }

    // Vérifier que tous les IDs sont valides
    const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length !== ids.length) {
      return res.status(400).json({ message: 'Un ou plusieurs IDs sont invalides' });
    }

    // Récupérer les licences
    const licences = await Licence.find({ _id: { $in: validIds } });
    res.status(200).json(licences);
  } catch (err) {
    console.error('Erreur lors de la récupération des licences :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.renewLicence = async (req, res) => {
  try {
    const { id } = req.params;
    const { dateExpiration, lampadairesMax } = req.body;

    // Validate inputs
    if (!dateExpiration) {
      return res.status(400).json({ message: "La date d'expiration est requise" });
    }

    if (!lampadairesMax || isNaN(lampadairesMax) || lampadairesMax <= 0) {
      return res.status(400).json({ message: "Le nombre maximum de lampadaires doit être un entier positif" });
    }

    // Validate date format
    const parsedDate = new Date(dateExpiration);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: "Format de date d'expiration invalide" });
    }

    // Update licence
    const licence = await Licence.findByIdAndUpdate(
      id,
      {
        dateExpiration: parsedDate,
        lampadairesMax,
        statut: 'Active',
      },
      { new: true, runValidators: true }
    );

    if (!licence) {
      return res.status(404).json({ message: "Licence non trouvée" });
    }

    res.json({
      message: "Licence renouvelée avec succès",
      licence,
    });
  } catch (err) {
    console.error("Erreur lors du renouvellement de la licence:", err);
    res.status(500).json({
      message: "Erreur lors du renouvellement de la licence",
      error: err.message,
    });
  }
};
exports.suspendLicence = async (req, res) => {
  try {
    const { id } = req.params;

    const licence = await Licence.findByIdAndUpdate(
      id,
      { statut: 'Suspendue' },
      { new: true }
    );

    if (!licence) {
      return res.status(404).json({ message: 'Licence non trouvée' });
    }

    res.json({
      message: 'Licence suspendue avec succès',
      licence
    });
  } catch (err) {
    console.error('Erreur lors de la suspension de la licence:', err);
    res.status(500).json({ 
      message: 'Erreur lors de la suspension de la licence',
      error: err.message 
    });
  }
};
exports.regenerateLicenceKey = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Generate a unique key
    let cleLicence, existing;
    do {
      cleLicence = generateKeyWithDashes();
      existing = await Licence.findOne({ cleLicence });
    } while (existing);

    // Update licence
    const licence = await Licence.findByIdAndUpdate(
      id,
      { cleLicence },
      { new: true, runValidators: true }
    );

    if (!licence) {
      return res.status(404).json({ message: 'Licence non trouvée' });
    }

    res.json({
      message: 'Clé de licence régénérée avec succès',
      newKey: cleLicence,
    });
  } catch (err) {
    console.error('Erreur lors de la régénération de la clé de licence:', err);
    res.status(500).json({
      message: 'Erreur lors de la régénération de la clé de licence',
      error: err.message,
    });
  }
};
exports.softDeleteLicence = async (req, res) => {
  try {
    // 1. Trouver la licence avec populate
    const licence = await Licence.findById(req.params.id)
      .populate('utilisateurId', 'license');
    
    if (!licence) {
      return res.status(404).json({ message: 'Licence non trouvée' });
    }

    // 2. Soft delete la licence
    await Licence.findByIdAndUpdate(
      req.params.id,
      {
        deleted: true,
        statut: 'Inactive',
        deletionInfo: {
          reason: req.body.reason,
          deletedAt: new Date()
        }
      }
    );

    // 3. Mise à jour atomique de l'utilisateur
    const userUpdate = await User.findByIdAndUpdate(
      licence.utilisateurId._id,
      { 
        $pull: { 
          license: mongoose.Types.ObjectId(req.params.id) 
        } 
      },
      { new: true }
    );

    // Vérification de la mise à jour
    if (!userUpdate) {
      throw new Error('Échec de la mise à jour utilisateur');
    }

    res.json({ 
      message: 'Licence supprimée et retirée de l\'utilisateur',
      userLicenseCount: userUpdate.license.length // Vérifiez le compte
    });

  } catch (err) {
    console.error('Erreur détaillée:', err);
    res.status(500).json({ 
      message: 'Échec de la suppression',
      error: err.message,
      stack: err.stack // Pour le débogage
    });
  }
};
exports.restoreLicence = async (req, res) => {
  try {
    // Trouver la licence (y compris les supprimées)
    const licence = await Licence.findOne({ _id: req.params.id, deleted: true })
      .setOptions({ includeDeleted: true });
    
    if (!licence) {
      return res.status(404).json({ 
        message: 'Licence supprimée non trouvée ou déjà restaurée' 
      });
    }

    // Restaurer la licence
    licence.deleted = false;
    licence.statut = 'Active';
    licence.deletionInfo = undefined;
    
    await licence.save({ validateBeforeSave: false });

    // Réajouter la licence à l'utilisateur
    await User.findByIdAndUpdate(
      licence.utilisateurId,
      { $addToSet: { licenses: licence._id } },
      { new: true }
    );

    res.json({ 
      message: 'Licence restaurée avec succès',
      licence: {
        id: licence._id,
        nom: licence.nom,
        statut: licence.statut,
        deleted: licence.deleted
      }
    });
  } catch (err) {
    console.error('Erreur restoreLicence:', err);
    res.status(500).json({ 
      message: 'Erreur lors de la restauration',
      error: err.message 
    });
  }
};
exports.getDeletedLicences = async (req, res) => {
  try {
    const licences = await Licence.find({ deleted: true })
      .setOptions({ includeDeleted: true })
      .populate('utilisateurId deletionInfo.deletedBy');

    res.json(licences);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.reactivateLicence = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    // Validate note if provided
    if (note && (typeof note !== 'string' || note.trim() === '')) {
      return res.status(400).json({ message: 'La note doit être une chaîne de caractères non vide' });
    }

    // Update licence
    const updateData = { statut: 'Active' };
    if (note) updateData.note = note.trim();

    const licence = await Licence.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!licence) {
      return res.status(404).json({ message: 'Licence non trouvée' });
    }

    res.json({
      message: 'Licence réactivée avec succès',
      licence,
    });
  } catch (err) {
    console.error('Erreur lors de la réactivation de la licence:', err);
    res.status(500).json({
      message: 'Erreur lors de la réactivation de la licence',
      error: err.message,
    });
  }
};