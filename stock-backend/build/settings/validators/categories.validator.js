"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategorySchema = exports.modifyCategorySchema = exports.createCategorySchema = void 0;
const Joi = require("joi");
exports.createCategorySchema = Joi.object({
    nom: Joi.string().min(1).required(),
    sous_famille: Joi.string().required(),
});
exports.modifyCategorySchema = Joi.object({
    category_id: Joi.number().required(),
    nom: Joi.string().min(1).required(),
    sous_famille: Joi.string().min(1).required(),
});
exports.deleteCategorySchema = Joi.object({
    category_id: Joi.number().integer().required(),
});
//# sourceMappingURL=categories.validator.js.map