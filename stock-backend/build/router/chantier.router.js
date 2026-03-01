"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chantierRouter = void 0;
const express_1 = require("express");
const validator_1 = require("../settings/validators/validator");
const chantier_validator_1 = require("../settings/validators/chantier.validator");
const chantier_service_1 = require("../controller/chantier.service");
const middleware_1 = require("../middleware");
const role_enum_1 = require("../enums/role.enum");
exports.chantierRouter = (0, express_1.Router)();
const chantierService = new chantier_service_1.ChantierService();
exports.chantierRouter.get("/liste", chantierService.listeChantiers);
exports.chantierRouter.get("/mes-chantiers", middleware_1.authenticate, (0, middleware_1.requireRole)(role_enum_1.Role.RESPONSABLE_CHANTIER, role_enum_1.Role.MERCHANT), chantierService.getMesChantiers);
exports.chantierRouter.post("/ajouter", middleware_1.authenticate, (0, middleware_1.requireRole)(role_enum_1.Role.ADMIN, role_enum_1.Role.ADMIN1, role_enum_1.Role.ADMIN2), validator_1.requestBodyValidator.body(chantier_validator_1.ajouterChantierValidator), chantierService.creerChantier);
exports.chantierRouter.put("/affecter", middleware_1.authenticate, (0, middleware_1.requireRole)(role_enum_1.Role.ADMIN, role_enum_1.Role.ADMIN1, role_enum_1.Role.ADMIN2), validator_1.requestBodyValidator.body(chantier_validator_1.affecterChantierValidator), chantierService.affecterChantier);
exports.chantierRouter.put("/modifier", middleware_1.authenticate, (0, middleware_1.requireRole)(role_enum_1.Role.ADMIN, role_enum_1.Role.ADMIN1, role_enum_1.Role.ADMIN2), validator_1.requestBodyValidator.body(chantier_validator_1.modifierChantierValidator), chantierService.modifierChantier);
exports.chantierRouter.delete("/supprimer", middleware_1.authenticate, (0, middleware_1.requireRole)(role_enum_1.Role.ADMIN, role_enum_1.Role.ADMIN1, role_enum_1.Role.ADMIN2), chantierService.supprimerChantier);
exports.chantierRouter.get("/summary/:chantierId", middleware_1.authenticate, (0, middleware_1.requireRole)(role_enum_1.Role.ADMIN, role_enum_1.Role.ADMIN1, role_enum_1.Role.ADMIN2), chantierService.getChantierSummary);
// Stock per chantier: articles available (delivered - returned)
exports.chantierRouter.get("/stock/:chantierId", middleware_1.authenticate, (0, middleware_1.requireRole)(role_enum_1.Role.ADMIN, role_enum_1.Role.ADMIN1, role_enum_1.Role.ADMIN2, role_enum_1.Role.RESPONSABLE_CHANTIER, role_enum_1.Role.MERCHANT), chantierService.getChantierStock);
//# sourceMappingURL=chantier.router.js.map