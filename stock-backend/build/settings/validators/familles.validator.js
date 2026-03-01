"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supprimerFamilleSchema = exports.modifierFamilleSchema = exports.createFamilleSchema = void 0;
const Joi = require("joi");
exports.createFamilleSchema = Joi.object({
    nom: Joi.string().min(1).required(),
});
exports.modifierFamilleSchema = Joi.object({
    famille_id: Joi.number().integer().required(),
    nom: Joi.string().min(1).required(),
});
exports.supprimerFamilleSchema = Joi.object({
    famille_id: Joi.number().integer().required(),
});
//# sourceMappingURL=familles.validator.js.map