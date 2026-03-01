"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteArticleSchema = exports.updateArticleSchema = exports.createArticleSchema = void 0;
const Joi = require("joi");
exports.createArticleSchema = Joi.object({
    nom: Joi.string().required(),
    stockMin: Joi.number().integer().positive().required(),
    depotId: Joi.number().integer().positive().required(),
    categorieId: Joi.number().integer().positive().required(),
    uniteId: Joi.number().integer().positive().required(),
});
exports.updateArticleSchema = Joi.object({
    id: Joi.number().integer().positive().required(),
    nom: Joi.string().required(),
    stockMin: Joi.number().integer().positive().required(),
    depotId: Joi.number().integer().positive().required(),
    categorieId: Joi.number().integer().positive().required(),
    uniteId: Joi.number().integer().positive().required(),
});
exports.deleteArticleSchema = Joi.object({
    id: Joi.number().integer().positive().required(),
});
//# sourceMappingURL=articles.validator.js.map