"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.depotRouter = void 0;
const express_1 = require("express");
const depot_service_1 = require("../controller/depot.service");
const depot_validator_1 = require("../settings/validators/depot.validator");
const validator_1 = require("../settings/validators/validator");
const middleware_1 = require("../middleware");
const role_enum_1 = require("../enums/role.enum");
exports.depotRouter = (0, express_1.Router)();
const depotService = new depot_service_1.DepotService();
exports.depotRouter.get("/liste", depotService.listeDepots);
exports.depotRouter.post("/ajouter", middleware_1.authenticate, (0, middleware_1.requireRole)(role_enum_1.Role.ADMIN, role_enum_1.Role.ADMIN1, role_enum_1.Role.ADMIN2), validator_1.requestBodyValidator.body(depot_validator_1.depotSchemas.create), depotService.creerDepot);
exports.depotRouter.put("/modifier", middleware_1.authenticate, (0, middleware_1.requireRole)(role_enum_1.Role.ADMIN, role_enum_1.Role.ADMIN1, role_enum_1.Role.ADMIN2), validator_1.requestBodyValidator.body(depot_validator_1.depotSchemas.update), depotService.modifierDepot);
exports.depotRouter.delete("/supprimer", middleware_1.authenticate, (0, middleware_1.requireRole)(role_enum_1.Role.ADMIN, role_enum_1.Role.ADMIN1, role_enum_1.Role.ADMIN2), depotService.supprimerDepot);
//# sourceMappingURL=depot.router.js.map