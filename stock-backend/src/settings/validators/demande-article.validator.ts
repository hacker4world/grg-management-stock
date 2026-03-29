import Joi = require("joi");

export const CreateDemandeArticleValidator = Joi.object({
  chantierId: Joi.number().integer().positive().required(),
  observation: Joi.string().max(80).optional(),
  items: Joi.array()
    .items(
      Joi.object({
        articleId: Joi.number().integer().positive().required(),
        quantity: Joi.number().integer().min(1).required(),
      }),
    )
    .min(1)
    .required(),
});

export const ConfirmDenyDemandeValidator = Joi.object({
  demandeId: Joi.number().integer().positive().required(),
  action: Joi.string().max(80).valid("confirm", "deny").required(),
});

export const ListDemandeFiltersValidator = Joi.object({
  chantierId: Joi.number().integer().positive().optional(),
  articleId: Joi.number().integer().positive().optional(),
  id: Joi.number().integer().min(0).optional(), // ← ADD THIS
  date: Joi.date().iso().optional(),
  page: Joi.number().integer().min(1).optional().default(1),
});
