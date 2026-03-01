"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accepterRefuserCompteValidator = exports.signupValidator = exports.loginValidator = void 0;
const Joi = require("joi");
exports.loginValidator = Joi.object({
    nom_utilisateur: Joi.string().required(),
    motdepasse: Joi.string().required(),
});
exports.signupValidator = Joi.object({
    nom: Joi.string().min(2).required(),
    prenom: Joi.string().min(2).required(),
    nom_utilisateur: Joi.string().min(4).required(),
    motdepasse: Joi.string().min(6).required(),
});
exports.accepterRefuserCompteValidator = Joi.object({
    compte_id: Joi.number().integer().required(),
    role: Joi.string().required(),
});
//# sourceMappingURL=authentification.validator.js.map