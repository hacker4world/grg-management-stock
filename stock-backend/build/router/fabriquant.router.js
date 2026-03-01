"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fabriquantRouter = void 0;
const express_1 = require("express");
const validator_1 = require("../settings/validators/validator");
const fabriquant_validator_1 = require("../settings/validators/fabriquant.validator");
const fabriquant_service_1 = require("../controller/fabriquant.service");
const middleware_1 = require("../middleware");
const role_enum_1 = require("../enums/role.enum");
exports.fabriquantRouter = (0, express_1.Router)();
const fabriquantService = new fabriquant_service_1.FabriquantService();
exports.fabriquantRouter.get("/liste", middleware_1.authenticate, fabriquantService.listeFabriquants);
exports.fabriquantRouter.post("/ajouter", middleware_1.authenticate, (0, middleware_1.requireRole)(role_enum_1.Role.ADMIN, role_enum_1.Role.ADMIN1, role_enum_1.Role.ADMIN2), validator_1.requestBodyValidator.body(fabriquant_validator_1.ajouterFabriquantValidator), fabriquantService.ajouterFabriquant);
exports.fabriquantRouter.put("/modifier", middleware_1.authenticate, (0, middleware_1.requireRole)(role_enum_1.Role.ADMIN, role_enum_1.Role.ADMIN1, role_enum_1.Role.ADMIN2), validator_1.requestBodyValidator.body(fabriquant_validator_1.modifierFabriquantValidator), fabriquantService.modifierFabriquant);
exports.fabriquantRouter.delete("/supprimer", middleware_1.authenticate, (0, middleware_1.requireRole)(role_enum_1.Role.ADMIN, role_enum_1.Role.ADMIN1, role_enum_1.Role.ADMIN2), fabriquantService.supprimerFabriquant);
//# sourceMappingURL=fabriquant.router.js.map