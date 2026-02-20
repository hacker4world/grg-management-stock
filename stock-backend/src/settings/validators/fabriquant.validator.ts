import Joi = require("joi");

export const ajouterFabriquantValidator = Joi.object({
  nom: Joi.string().min(1).required(),
  adresse: Joi.string().min(1).required(),
  contact: Joi.string().min(1).required(),
});

export const modifierFabriquantValidator = Joi.object({
  code_fabriquant: Joi.number().integer().required(),
  nom: Joi.string().min(1).required(),
  adresse: Joi.string().min(1).required(),
  contact: Joi.string().min(1).required(),
});

export const supprimerFabriquantValidator = Joi.object({
  code_fabriquant: Joi.number().integer().required(),
});
