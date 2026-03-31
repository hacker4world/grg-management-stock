import Joi = require("joi");

export const createCategorySchema = Joi.object({
  nom: Joi.string().min(1).max(80).required(),
  sous_famille: Joi.number().integer().required(),
});

export const modifyCategorySchema = Joi.object({
  category_id: Joi.number().integer().required(),
  nom: Joi.string().min(1).max(80).required(),
  sous_famille: Joi.string().min(1).max(80).required(),
});

export const deleteCategorySchema = Joi.object({
  category_id: Joi.number().integer().required(),
});
