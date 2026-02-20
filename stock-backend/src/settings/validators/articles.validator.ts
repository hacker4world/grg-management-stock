import Joi = require("joi");
import {
  CreateArticleDto,
  DeleteArticleDto,
  UpdateArticleDto,
} from "../../dto/articles.dto";

export const createArticleSchema = Joi.object<CreateArticleDto>({
  nom: Joi.string().required(),
  stockMin: Joi.number().integer().positive().required(),
  depotId: Joi.number().integer().positive().required(),
  categorieId: Joi.number().integer().positive().required(),
  uniteId: Joi.number().integer().positive().required(),
});

export const updateArticleSchema = Joi.object<UpdateArticleDto>({
  id: Joi.number().integer().positive().required(),
  nom: Joi.string().required(),
  stockMin: Joi.number().integer().positive().required(),
  depotId: Joi.number().integer().positive().required(),
  categorieId: Joi.number().integer().positive().required(),
  uniteId: Joi.number().integer().positive().required(),
});

export const deleteArticleSchema = Joi.object<DeleteArticleDto>({
  id: Joi.number().integer().positive().required(),
});
