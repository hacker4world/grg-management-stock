import Joi = require("joi");

export const createFamilleSchema = Joi.object({
  nom: Joi.string().min(1).required(),
});

export const modifierFamilleSchema = Joi.object({
  famille_id: Joi.number().integer().required(),
  nom: Joi.string().min(1).required(),
});

export const supprimerFamilleSchema = Joi.object({
  famille_id: Joi.number().integer().required(),
});
