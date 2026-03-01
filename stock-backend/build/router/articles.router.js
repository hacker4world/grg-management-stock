"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.articlesRouter = void 0;
const express_1 = require("express");
const validator_1 = require("../settings/validators/validator");
const articles_service_1 = require("../controller/articles.service");
const articles_validator_1 = require("../settings/validators/articles.validator");
const middleware_1 = require("../middleware");
const role_enum_1 = require("../enums/role.enum");
exports.articlesRouter = (0, express_1.Router)();
const articlesService = new articles_service_1.ArticleService();
exports.articlesRouter.get("/liste", middleware_1.authenticate, (0, middleware_1.requireRole)(role_enum_1.Role.ADMIN, role_enum_1.Role.MAGAZINIER, role_enum_1.Role.ADMIN1, role_enum_1.Role.ADMIN2, role_enum_1.Role.RESPONSABLE_CHANTIER, role_enum_1.Role.MERCHANT), articlesService.listArticles);
exports.articlesRouter.get("/fournisseur-list", articlesService.listArticleFournisseurs);
exports.articlesRouter.post("/creer", middleware_1.authenticate, (0, middleware_1.requireRole)(role_enum_1.Role.ADMIN, role_enum_1.Role.ADMIN1, role_enum_1.Role.ADMIN2), validator_1.requestBodyValidator.body(articles_validator_1.createArticleSchema), articlesService.createArticle);
exports.articlesRouter.put("/modifier", middleware_1.authenticate, (0, middleware_1.requireRole)(role_enum_1.Role.ADMIN, role_enum_1.Role.ADMIN1, role_enum_1.Role.ADMIN2), validator_1.requestBodyValidator.body(articles_validator_1.updateArticleSchema), articlesService.updateArticle);
exports.articlesRouter.delete("/supprimer", middleware_1.authenticate, (0, middleware_1.requireRole)(role_enum_1.Role.ADMIN, role_enum_1.Role.ADMIN1, role_enum_1.Role.ADMIN2), articlesService.deleteArticle);
//# sourceMappingURL=articles.router.js.map