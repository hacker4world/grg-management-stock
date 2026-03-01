"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.demandeArticlesRouter = void 0;
const express_1 = require("express");
const demandeArticles_service_1 = require("../controller/demandeArticles.service");
const middleware_1 = require("../middleware");
const role_enum_1 = require("../enums/role.enum");
exports.demandeArticlesRouter = (0, express_1.Router)();
const demandeArticlesService = new demandeArticles_service_1.DemandeArticleService();
exports.demandeArticlesRouter.get("/liste", middleware_1.authenticate, (0, middleware_1.requireRole)(role_enum_1.Role.ADMIN, role_enum_1.Role.ADMIN1, role_enum_1.Role.ADMIN2, role_enum_1.Role.RESPONSABLE_CHANTIER), demandeArticlesService.listDemandes);
exports.demandeArticlesRouter.post("/ajouter", middleware_1.authenticate, (0, middleware_1.requireRole)(role_enum_1.Role.ADMIN, role_enum_1.Role.ADMIN1, role_enum_1.Role.ADMIN2, role_enum_1.Role.RESPONSABLE_CHANTIER, role_enum_1.Role.MERCHANT), demandeArticlesService.createDemande);
exports.demandeArticlesRouter.post("/traiter", middleware_1.authenticate, (0, middleware_1.requireRole)(role_enum_1.Role.ADMIN, role_enum_1.Role.ADMIN1, role_enum_1.Role.ADMIN2), demandeArticlesService.confirmOrDeny);
//# sourceMappingURL=demandeArticle.router.js.map