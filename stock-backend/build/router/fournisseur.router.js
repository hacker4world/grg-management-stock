"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fournisseurRouter = void 0;
const express_1 = require("express");
const validator_1 = require("../settings/validators/validator");
const fournisseur_validator_1 = require("../settings/validators/fournisseur.validator");
const fournisseur_service_1 = require("../controller/fournisseur.service");
const middleware_1 = require("../middleware");
const role_enum_1 = require("../enums/role.enum");
exports.fournisseurRouter = (0, express_1.Router)();
const fournisseurService = new fournisseur_service_1.FournisseurService();
exports.fournisseurRouter.get("/liste", fournisseurService.listeFournisseurs);
exports.fournisseurRouter.post("/ajouter", middleware_1.authenticate, (0, middleware_1.requireRole)(role_enum_1.Role.ADMIN, role_enum_1.Role.ADMIN1, role_enum_1.Role.ADMIN2), validator_1.requestBodyValidator.body(fournisseur_validator_1.ajouterFournisseurValidator), fournisseurService.creerFournisseur);
exports.fournisseurRouter.put("/modifier", middleware_1.authenticate, (0, middleware_1.requireRole)(role_enum_1.Role.ADMIN, role_enum_1.Role.ADMIN1, role_enum_1.Role.ADMIN2), validator_1.requestBodyValidator.body(fournisseur_validator_1.modifierFournisseurValidator), fournisseurService.modifierFournisseur);
exports.fournisseurRouter.delete("/supprimer", middleware_1.authenticate, (0, middleware_1.requireRole)(role_enum_1.Role.ADMIN, role_enum_1.Role.ADMIN1, role_enum_1.Role.ADMIN2), fournisseurService.supprimerFournisseur);
//# sourceMappingURL=fournisseur.router.js.map