import Joi = require("joi");

export const depotSchemas = {
  /* POST /api/depot/ajouter */
  create: Joi.object({
    nom: Joi.string().trim().min(1).max(80).required(),
    adresse: Joi.string().trim().max(80).optional().allow("", null),
  }),

  /* PUT /api/depot/modifier */
  update: Joi.object({
    id: Joi.number().integer().positive().required(),
    nom: Joi.string().trim().min(1).max(80).required(),
    adresse: Joi.string().trim().max(80).optional().allow("", null),
  }),

  /* DELETE /api/depot/supprimer */
  remove: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
};
