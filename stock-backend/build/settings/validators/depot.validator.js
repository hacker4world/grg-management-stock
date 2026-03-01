"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.depotSchemas = void 0;
const Joi = require("joi");
exports.depotSchemas = {
    /* POST /api/depot/ajouter */
    create: Joi.object({
        nom: Joi.string().trim().min(1).max(255).required(),
        adresse: Joi.string().trim().max(500).optional().allow("", null),
    }),
    /* PUT /api/depot/modifier */
    update: Joi.object({
        id: Joi.number().integer().positive().required(),
        nom: Joi.string().trim().min(1).max(255).required(),
        adresse: Joi.string().trim().max(500).optional().allow("", null),
    }),
    /* DELETE /api/depot/supprimer */
    remove: Joi.object({
        id: Joi.number().integer().positive().required(),
    }),
};
//# sourceMappingURL=depot.validator.js.map