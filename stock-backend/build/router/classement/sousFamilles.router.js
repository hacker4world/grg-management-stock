"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sousFamillesRouter = void 0;
const express_1 = require("express");
const validator_1 = require("../../settings/validators/validator");
const sousFamilles_validator_1 = require("../../settings/validators/sousFamilles.validator");
const sous_familles_service_1 = require("../../controller/sous-familles.service");
const middleware_1 = require("../../middleware");
const role_enum_1 = require("../../enums/role.enum");
exports.sousFamillesRouter = (0, express_1.Router)();
const sousFamilleService = new sous_familles_service_1.SousFamillesService();
exports.sousFamillesRouter.get("/liste", middleware_1.authenticate, sousFamilleService.listeSousFamilles);
exports.sousFamillesRouter.get("/filtrer", middleware_1.authenticate, sousFamilleService.filtrerSousFamilles);
exports.sousFamillesRouter.post("/creer", middleware_1.authenticate, (0, middleware_1.requireRole)(role_enum_1.Role.ADMIN), validator_1.requestBodyValidator.body(sousFamilles_validator_1.creerSousFamilleSchema), sousFamilleService.creerSousFamille);
exports.sousFamillesRouter.put("/modifier", middleware_1.authenticate, (0, middleware_1.requireRole)(role_enum_1.Role.ADMIN), validator_1.requestBodyValidator.body(sousFamilles_validator_1.modifierSousFamilleSchema), sousFamilleService.modifierSousFamille);
exports.sousFamillesRouter.delete("/supprimer", middleware_1.authenticate, (0, middleware_1.requireRole)(role_enum_1.Role.ADMIN), sousFamilleService.supprimerSousFamille);
//# sourceMappingURL=sousFamilles.router.js.map