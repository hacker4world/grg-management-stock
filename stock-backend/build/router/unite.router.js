"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uniteService = exports.uniteRouter = void 0;
const express_1 = require("express");
const unite_service_1 = require("../controller/unite.service");
const validator_1 = require("../settings/validators/validator");
const unite_validator_1 = require("../settings/validators/unite.validator");
const middleware_1 = require("../middleware");
const role_enum_1 = require("../enums/role.enum");
exports.uniteRouter = (0, express_1.Router)();
exports.uniteService = new unite_service_1.UniteService();
exports.uniteRouter.get("/liste", exports.uniteService.listeUnites);
exports.uniteRouter.post("/creer", middleware_1.authenticate, (0, middleware_1.requireRole)(role_enum_1.Role.ADMIN, role_enum_1.Role.ADMIN1, role_enum_1.Role.ADMIN2), validator_1.requestBodyValidator.body(unite_validator_1.uniteSchemas.create), exports.uniteService.creerUnite);
exports.uniteRouter.put("/modifier", middleware_1.authenticate, (0, middleware_1.requireRole)(role_enum_1.Role.ADMIN, role_enum_1.Role.ADMIN1, role_enum_1.Role.ADMIN2), validator_1.requestBodyValidator.body(unite_validator_1.uniteSchemas.update), exports.uniteService.modifierUnite);
exports.uniteRouter.delete("/supprimer", middleware_1.authenticate, (0, middleware_1.requireRole)(role_enum_1.Role.ADMIN, role_enum_1.Role.ADMIN1, role_enum_1.Role.ADMIN2), exports.uniteService.supprimerUnite);
//# sourceMappingURL=unite.router.js.map