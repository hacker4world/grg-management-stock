"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retourRouter = void 0;
const express_1 = require("express");
const validator_1 = require("../settings/validators/validator");
const retour_service_1 = require("../controller/retour.service");
const retour_validator_1 = require("../settings/validators/retour.validator");
const middleware_1 = require("../middleware");
const role_enum_1 = require("../enums/role.enum");
exports.retourRouter = (0, express_1.Router)();
const service = new retour_service_1.RetourService();
exports.retourRouter.post("/ajouter", middleware_1.authenticate, (0, middleware_1.requireRole)(role_enum_1.Role.ADMIN, role_enum_1.Role.ADMIN1, role_enum_1.Role.ADMIN2, role_enum_1.Role.RESPONSABLE_CHANTIER, role_enum_1.Role.MERCHANT), validator_1.requestBodyValidator.body(retour_validator_1.createRetourValidator), service.createRetour);
exports.retourRouter.get("/liste", validator_1.requestBodyValidator.query(retour_validator_1.listRetoursValidator), service.listRetours);
exports.retourRouter.put("/traiter", middleware_1.authenticate, (0, middleware_1.requireRole)(role_enum_1.Role.ADMIN, role_enum_1.Role.ADMIN1, role_enum_1.Role.ADMIN2), validator_1.requestBodyValidator.body(retour_validator_1.approveDenyRetourValidator), service.approveDenyRetour);
//# sourceMappingURL=retour.router.js.map