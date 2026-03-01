"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uniteSchemas = void 0;
const Joi = require("joi");
exports.uniteSchemas = {
    /* POST /api/unite/creer */
    create: Joi.object({
        nom: Joi.string().trim().min(1).max(255).required(),
    }),
    /* PUT /api/unite/modifier */
    update: Joi.object({
        id: Joi.number().integer().positive().required(),
        nom: Joi.string().trim().min(1).max(255).required(),
    }),
    /* DELETE /api/unite/supprimer */
    remove: Joi.object({
        id: Joi.number().integer().positive().required(),
    }),
};
//# sourceMappingURL=unite.validator.js.map