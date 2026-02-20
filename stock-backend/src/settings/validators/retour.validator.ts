import Joi = require("joi");

const itemSchema = Joi.object({
  articleId: Joi.number().integer().positive().required(),
  quantite: Joi.number().integer().positive().required(),
  reason: Joi.string().min(1).required(),
});

export const createRetourValidator = Joi.object({
  chantierId: Joi.number().integer().positive().required(),
  items: Joi.array().items(itemSchema).min(1).required(),
  observation: Joi.string().optional(),
});

export const listRetoursValidator = Joi.object({
  chantierId: Joi.number().integer().positive().optional(),
  articleId: Joi.number().integer().positive().optional(),
  id: Joi.number().integer().min(0).optional(), // ← ADD THIS
  page: Joi.number().integer().min(1).optional(),
  date: Joi.string().optional(),
  status: Joi.string().optional(),
});


export const approveDenyRetourValidator = Joi.object({
  retourId: Joi.number().integer().positive().required(),
  action: Joi.valid("approve", "deny").required(),
});
