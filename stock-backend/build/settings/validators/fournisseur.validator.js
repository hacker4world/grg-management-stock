"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supprimerFournisseurValidator = exports.modifierFournisseurValidator = exports.ajouterFournisseurValidator = void 0;
const Joi = require("joi");
exports.ajouterFournisseurValidator = Joi.object({
    nom: Joi.string().min(1).required(),
    adresse: Joi.string().min(1).required(),
    contact: Joi.string().min(1).required(),
});
exports.modifierFournisseurValidator = Joi.object({
    code_fournisseur: Joi.number().integer().required(),
    nom: Joi.string().min(1).required(),
    adresse: Joi.string().min(1).required(),
    contact: Joi.string().min(1).required(),
});
exports.supprimerFournisseurValidator = Joi.object({
    code_fournisseur: Joi.number().integer().required(),
});
//# sourceMappingURL=fournisseur.validator.js.map