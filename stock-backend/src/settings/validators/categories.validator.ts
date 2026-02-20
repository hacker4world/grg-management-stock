import Joi = require("joi");

export const createCategorySchema = Joi.object({
  nom: Joi.string().min(1).required(),
  sous_famille: Joi.string().required(),
});

export const modifyCategorySchema = Joi.object({
  category_id: Joi.number().required(),
  nom: Joi.string().min(1).required(),
  sous_famille: Joi.string().min(1).required(),
});

export const deleteCategorySchema = Joi.object({
  category_id: Joi.number().integer().required(),
});
