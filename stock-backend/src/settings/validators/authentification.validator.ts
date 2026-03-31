import Joi = require("joi");
import { join } from "path";

export const loginValidator = Joi.object({
  nom_utilisateur: Joi.string().min(1).max(80).required(),
  motdepasse: Joi.string().min(8).max(80).required(),
});

export const signupValidator = Joi.object({
  nom: Joi.string().min(2).max(80).required(),
  prenom: Joi.string().min(2).max(80).required(),
  nom_utilisateur: Joi.string().max(80).min(4).required(),
  motdepasse: Joi.string().min(8).max(80).required(),
});

export const accepterRefuserCompteValidator = Joi.object({
  compte_id: Joi.number().integer().required(),
  role: Joi.string().min(1).max(80).valid('admin', 'admin1', 'admin2', 'magazinier', 'responsable-chantier').required(),
});

export const modifierCompteValidator = Joi.object({
  code_compte: Joi.number().integer().required(),
  nom: Joi.string().min(1).max(80).required(),
  prenom: Joi.string().min(2).max(80).required(),
  nomUtilisateur: Joi.string().min(2).max(80).required(),
  role: Joi.string().min(2).max(80).required(),
})
