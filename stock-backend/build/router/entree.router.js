"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.entreeRouter = void 0;
const express_1 = require("express");
const validator_1 = require("../settings/validators/validator");
const entree_validator_1 = require("../settings/validators/entree.validator");
const multer_config_1 = require("../config/multer.config");
const entree_service_1 = require("../controller/entree.service");
const middleware_1 = require("../middleware");
const role_enum_1 = require("../enums/role.enum");
exports.entreeRouter = (0, express_1.Router)();
const service = new entree_service_1.EntreeService();
exports.entreeRouter.get("/liste-confirme", middleware_1.authenticate, (0, middleware_1.requireRole)(role_enum_1.Role.ADMIN, role_enum_1.Role.ADMIN1, role_enum_1.Role.MAGAZINIER), service.listerEntrees);
exports.entreeRouter.get("/liste-pending", middleware_1.authenticate, (0, middleware_1.requireRole)(role_enum_1.Role.ADMIN, role_enum_1.Role.ADMIN1, role_enum_1.Role.MAGAZINIER), service.listerPendingEntrees);
exports.entreeRouter.post("/ajouter", middleware_1.authenticate, (0, middleware_1.requireRole)(role_enum_1.Role.ADMIN, role_enum_1.Role.ADMIN1, role_enum_1.Role.MAGAZINIER), multer_config_1.uploadEntreeDocuments, service.ajouterEntree);
exports.entreeRouter.put("/traiter", middleware_1.authenticate, (0, middleware_1.requireRole)(role_enum_1.Role.ADMIN, role_enum_1.Role.ADMIN1, role_enum_1.Role.MAGAZINIER), validator_1.requestBodyValidator.body(entree_validator_1.confirmerEntreeValidator), service.confirmerOuRefuser.bind(service));
exports.entreeRouter.delete("/supprimer", middleware_1.authenticate, (0, middleware_1.requireRole)(role_enum_1.Role.ADMIN, role_enum_1.Role.ADMIN1, role_enum_1.Role.MAGAZINIER), service.supprimer);
//# sourceMappingURL=entree.router.js.map