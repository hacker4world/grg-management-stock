"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.affecterChantierValidator = exports.supprimerChantierValidator = exports.modifierChantierValidator = exports.ajouterChantierValidator = void 0;
const Joi = require("joi");
exports.ajouterChantierValidator = Joi.object({
    nom: Joi.string().min(1).required(),
    adresse: Joi.string().min(1).required(),
    compteId: Joi.number().integer().positive().required(),
});
exports.modifierChantierValidator = Joi.object({
    code_chantier: Joi.number().integer().positive().required(), // ← was string
    nom: Joi.string().min(1).required(),
    adresse: Joi.string().min(1).required(),
    compteId: Joi.number().integer().positive().optional(),
});
exports.supprimerChantierValidator = Joi.object({
    code_chantier: Joi.number().integer().positive().required(), // ← was string
});
exports.affecterChantierValidator = Joi.object({
    code_chantier: Joi.number().integer().positive().required(),
    compte_id: Joi.number().integer().positive().required(),
});
//# sourceMappingURL=chantier.validator.js.map