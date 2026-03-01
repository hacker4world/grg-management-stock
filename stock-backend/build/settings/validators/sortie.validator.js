"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSortieValidator = exports.confirmDenySortieValidator = exports.listSortiesValidator = exports.createSortieValidator = void 0;
// validators/sortie.validator.ts
const Joi = require("joi");
const articleLine = Joi.object({
    articleId: Joi.number().integer().positive().required(),
    stockSortie: Joi.number().positive().required(),
});
// ============ SORTIE INTERNE DEPOT VALIDATOR ============
const createSortieInterneDepotValidator = Joi.object({
    articles: Joi.array().items(articleLine).min(1).required(),
    observation: Joi.string().optional().allow(""),
    compteId: Joi.number().integer().positive().required(),
    typeSortie: Joi.string().valid("interne_depot").required(),
    depotId: Joi.number().integer().positive().required(),
    nomTransporteur: Joi.string().min(1).required(),
    matriculeTransporteur: Joi.string().min(1).required(),
});
// ============ SORTIE INTERNE CHANTIER VALIDATOR ============
const createSortieInterneChantierValidator = Joi.object({
    articles: Joi.array().items(articleLine).min(1).required(),
    observation: Joi.string().optional().allow(""),
    compteId: Joi.number().integer().positive().required(),
    typeSortie: Joi.string().valid("interne_chantier").required(),
    chantierId: Joi.number().integer().positive().required(),
    nomTransporteur: Joi.string().min(1).required(),
    matriculeTransporteur: Joi.string().min(1).required(),
});
// ============ SORTIE EXTERNE AVEC TRANSPORTEUR VALIDATOR ============
const createSortieExterneAvecTransporteurValidator = Joi.object({
    articles: Joi.array().items(articleLine).min(1).required(),
    observation: Joi.string().optional().allow(""),
    compteId: Joi.number().integer().positive().required(),
    typeSortie: Joi.string().valid("externe").required(),
    sousTypeSortieExterne: Joi.string().valid("avec_transporteur").required(),
    nomEntreprise: Joi.string().min(1).required(),
    adresseEntreprise: Joi.string().min(1).required(),
    matriculeFiscalEntreprise: Joi.string().min(1).required(),
    nomClient: Joi.string().min(1).required(),
    nomTransporteur: Joi.string().min(1).required(),
    matriculeTransporteur: Joi.string().min(1).required(),
});
// ============ SORTIE EXTERNE SANS TRANSPORTEUR VALIDATOR ============
const createSortieExterneSansTransporteurValidator = Joi.object({
    articles: Joi.array().items(articleLine).min(1).required(),
    observation: Joi.string().optional().allow(""),
    compteId: Joi.number().integer().positive().required(),
    typeSortie: Joi.string().valid("externe").required(),
    sousTypeSortieExterne: Joi.string().valid("sans_transporteur").required(),
    nomEntreprise: Joi.string().min(1).required(),
    adresseEntreprise: Joi.string().min(1).required(),
    matriculeFiscalEntreprise: Joi.string().min(1).required(),
    nomClient: Joi.string().min(1).required(),
});
// ============ DYNAMIC VALIDATOR SELECTOR ============
const createSortieValidator = (data) => {
    const typeSortie = data.typeSortie;
    if (typeSortie === "interne_depot") {
        return createSortieInterneDepotValidator.validate(data);
    }
    else if (typeSortie === "interne_chantier") {
        return createSortieInterneChantierValidator.validate(data);
    }
    else if (typeSortie === "externe") {
        const sousType = data.sousTypeSortieExterne;
        if (sousType === "avec_transporteur") {
            return createSortieExterneAvecTransporteurValidator.validate(data);
        }
        else if (sousType === "sans_transporteur") {
            return createSortieExterneSansTransporteurValidator.validate(data);
        }
    }
    return {
        error: {
            message: "Invalid typeSortie or sousTypeSortieExterne combination",
        },
    };
};
exports.createSortieValidator = createSortieValidator;
exports.listSortiesValidator = Joi.object({
    page: Joi.number().integer().min(1).optional(),
    articleId: Joi.number().integer().positive().optional(),
    chantierId: Joi.number().integer().positive().optional(),
    depotId: Joi.number().integer().positive().optional(),
    date: Joi.string().optional(),
    stockSortie: Joi.number().positive().optional(),
    compteId: Joi.number().integer().positive().optional(),
    id: Joi.number().integer().optional(),
    typeSortie: Joi.string()
        .valid("interne_depot", "interne_chantier", "externe")
        .optional(),
});
exports.confirmDenySortieValidator = Joi.object({
    sortieId: Joi.number().integer().positive().required(),
    action: Joi.string().valid("confirm", "deny").required(),
});
exports.deleteSortieValidator = Joi.object({
    id: Joi.number().integer().positive().required(),
});
//# sourceMappingURL=sortie.validator.js.map