"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compteRouter = void 0;
const express_1 = require("express");
const validator_1 = require("../settings/validators/validator");
const authentification_validator_1 = require("../settings/validators/authentification.validator");
const authentification_service_1 = require("../controller/authentification.service");
const middleware_1 = require("../middleware");
const role_enum_1 = require("../enums/role.enum");
exports.compteRouter = (0, express_1.Router)();
const authentificationService = new authentification_service_1.AuthentificationService();
// Public routes
exports.compteRouter.post("/signup", validator_1.requestBodyValidator.body(authentification_validator_1.signupValidator), authentificationService.signup);
exports.compteRouter.post("/login", validator_1.requestBodyValidator.body(authentification_validator_1.loginValidator), authentificationService.login);
exports.compteRouter.post("/logout", authentificationService.logout);
exports.compteRouter.post("/refresh", authentificationService.refreshToken);
// Authenticated route
exports.compteRouter.get("/verify", middleware_1.authenticate, authentificationService.verifierCompte);
// Admin-only routes
exports.compteRouter.get("/liste", middleware_1.authenticate, (0, middleware_1.requireRole)(role_enum_1.Role.ADMIN), authentificationService.listeComptes);
exports.compteRouter.get("/requettes", middleware_1.authenticate, (0, middleware_1.requireRole)(role_enum_1.Role.ADMIN), authentificationService.listeComptesNonAccepté);
exports.compteRouter.post("/accepter-compte", middleware_1.authenticate, (0, middleware_1.requireRole)(role_enum_1.Role.ADMIN), validator_1.requestBodyValidator.body(authentification_validator_1.accepterRefuserCompteValidator), authentificationService.accepterCompte);
exports.compteRouter.put("/modifier", middleware_1.authenticate, (0, middleware_1.requireRole)(role_enum_1.Role.ADMIN), authentificationService.updateCompte);
exports.compteRouter.delete("/supprimer", middleware_1.authenticate, (0, middleware_1.requireRole)(role_enum_1.Role.ADMIN), authentificationService.deleteCompte);
//# sourceMappingURL=compte.router.js.map