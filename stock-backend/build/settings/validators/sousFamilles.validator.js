"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supprimerSousFamilleSchema = exports.modifierSousFamilleSchema = exports.creerSousFamilleSchema = void 0;
const Joi = require("joi");
exports.creerSousFamilleSchema = Joi.object({
    nom: Joi.string().min(1).required(),
    famille_id: Joi.number().integer().allow(null),
});
exports.modifierSousFamilleSchema = Joi.object({
    sous_famille_id: Joi.number().integer().required(),
    nom: Joi.string().min(1).required(),
    famille_id: Joi.number().integer().allow(null),
});
exports.supprimerSousFamilleSchema = Joi.object({
    sous_famille_id: Joi.number().integer().required(),
});
//# sourceMappingURL=sousFamilles.validator.js.map