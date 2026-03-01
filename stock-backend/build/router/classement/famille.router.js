"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.familleRouter = void 0;
const express_1 = require("express");
const validator_1 = require("../../settings/validators/validator");
const familles_validator_1 = require("../../settings/validators/familles.validator");
const famille_service_1 = require("../../controller/famille.service");
const middleware_1 = require("../../middleware");
const role_enum_1 = require("../../enums/role.enum");
exports.familleRouter = (0, express_1.Router)();
const famillesService = new famille_service_1.FamilleService();
exports.familleRouter.get("/liste", famillesService.listeFamilles);
exports.familleRouter.get("/tous", famillesService.listAll);
exports.familleRouter.get("/recherche", famillesService.rechercherFamilles);
exports.familleRouter.post("/creer", middleware_1.authenticate, (0, middleware_1.requireRole)(role_enum_1.Role.ADMIN, role_enum_1.Role.ADMIN1, role_enum_1.Role.ADMIN2), validator_1.requestBodyValidator.body(familles_validator_1.createFamilleSchema), famillesService.creerFamille);
exports.familleRouter.put("/modifier", middleware_1.authenticate, (0, middleware_1.requireRole)(role_enum_1.Role.ADMIN, role_enum_1.Role.ADMIN1, role_enum_1.Role.ADMIN2), validator_1.requestBodyValidator.body(familles_validator_1.modifierFamilleSchema), famillesService.modifierFamille);
exports.familleRouter.delete("/supprimer", middleware_1.authenticate, (0, middleware_1.requireRole)(role_enum_1.Role.ADMIN, role_enum_1.Role.ADMIN1, role_enum_1.Role.ADMIN2), famillesService.supprimerFamille);
//# sourceMappingURL=famille.router.js.map