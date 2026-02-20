import Joi = require("joi");

export const ajouterChantierValidator = Joi.object({
  nom: Joi.string().min(1).required(),
  adresse: Joi.string().min(1).required(),
  compteId: Joi.number().integer().positive().required(),
});

export const modifierChantierValidator = Joi.object({
  code_chantier: Joi.number().integer().positive().required(), // ← was string
  nom: Joi.string().min(1).required(),
  adresse: Joi.string().min(1).required(),
  compteId: Joi.number().integer().positive().optional(),
});

export const supprimerChantierValidator = Joi.object({
  code_chantier: Joi.number().integer().positive().required(), // ← was string
});

export const affecterChantierValidator = Joi.object({
  code_chantier: Joi.number().integer().positive().required(),
  compte_id: Joi.number().integer().positive().required(),
});
