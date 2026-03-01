"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supprimerFabriquantValidator = exports.modifierFabriquantValidator = exports.ajouterFabriquantValidator = void 0;
const Joi = require("joi");
exports.ajouterFabriquantValidator = Joi.object({
    nom: Joi.string().min(1).required(),
    adresse: Joi.string().min(1).required(),
    contact: Joi.string().min(1).required(),
});
exports.modifierFabriquantValidator = Joi.object({
    code_fabriquant: Joi.number().integer().required(),
    nom: Joi.string().min(1).required(),
    adresse: Joi.string().min(1).required(),
    contact: Joi.string().min(1).required(),
});
exports.supprimerFabriquantValidator = Joi.object({
    code_fabriquant: Joi.number().integer().required(),
});
//# sourceMappingURL=fabriquant.validator.js.map