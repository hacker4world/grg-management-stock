import Joi = require("joi");
import { join } from "path";

export const loginValidator = Joi.object({
  nom_utilisateur: Joi.string().max(80).required(),
  motdepasse: Joi.string().max(80).required(),
});

export const signupValidator = Joi.object({
  nom: Joi.string().min(2).max(80).required(),
  prenom: Joi.string().min(2).max(80).required(),
  nom_utilisateur: Joi.string().max(80).min(4).required(),
  motdepasse: Joi.string().min(6).max(80).required(),
});

export const accepterRefuserCompteValidator = Joi.object({
  compte_id: Joi.number().integer().required(),
  role: Joi.string().max(80).required(),
});
