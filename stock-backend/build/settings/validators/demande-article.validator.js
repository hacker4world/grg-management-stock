"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListDemandeFiltersValidator = exports.ConfirmDenyDemandeValidator = exports.CreateDemandeArticleValidator = void 0;
const Joi = require("joi");
exports.CreateDemandeArticleValidator = Joi.object({
    chantierId: Joi.number().integer().positive().required(),
    observation: Joi.string().optional(),
    items: Joi.array()
        .items(Joi.object({
        articleId: Joi.number().integer().positive().required(),
        quantity: Joi.number().integer().min(1).required(),
    }))
        .min(1)
        .required(),
});
exports.ConfirmDenyDemandeValidator = Joi.object({
    demandeId: Joi.number().integer().positive().required(),
    action: Joi.string().valid("confirm", "deny").required(),
});
exports.ListDemandeFiltersValidator = Joi.object({
    chantierId: Joi.number().integer().positive().optional(),
    articleId: Joi.number().integer().positive().optional(),
    id: Joi.number().integer().min(0).optional(), // ← ADD THIS
    date: Joi.date().iso().optional(),
    page: Joi.number().integer().min(1).optional().default(1),
});
//# sourceMappingURL=demande-article.validator.js.map