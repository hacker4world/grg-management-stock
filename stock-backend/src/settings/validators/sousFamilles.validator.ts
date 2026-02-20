import Joi = require("joi");

export const creerSousFamilleSchema = Joi.object({
  nom: Joi.string().min(1).required(),
  famille_id: Joi.number().integer().allow(null),
});

export const modifierSousFamilleSchema = Joi.object({
  sous_famille_id: Joi.number().integer().required(),
  nom: Joi.string().min(1).required(),
  famille_id: Joi.number().integer().allow(null),
});

export const supprimerSousFamilleSchema = Joi.object({
  sous_famille_id: Joi.number().integer().required(),
});
