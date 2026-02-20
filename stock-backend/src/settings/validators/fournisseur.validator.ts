import Joi = require("joi");

export const ajouterFournisseurValidator = Joi.object({
  nom: Joi.string().min(1).required(),
  adresse: Joi.string().min(1).required(),
  contact: Joi.string().min(1).required(),
});

export const modifierFournisseurValidator = Joi.object({
  code_fournisseur: Joi.number().integer().required(),
  nom: Joi.string().min(1).required(),
  adresse: Joi.string().min(1).required(),
  contact: Joi.string().min(1).required(),
});

export const supprimerFournisseurValidator = Joi.object({
  code_fournisseur: Joi.number().integer().required(),
});