import Joi = require("joi");
import { join } from "path";

export const loginValidator = Joi.object({
  nom_utilisateur: Joi.string().required(),
  motdepasse: Joi.string().required(),
});

export const signupValidator = Joi.object({
  nom: Joi.string().min(2).required(),
  prenom: Joi.string().min(2).required(),
  nom_utilisateur: Joi.string().min(4).required(),
  motdepasse: Joi.string().min(6).required(),
});

export const accepterRefuserCompteValidator = Joi.object({
  compte_id: Joi.number().integer().required(),
  role: Joi.string().required(),
});
