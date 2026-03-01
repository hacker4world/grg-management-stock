"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryRouter = void 0;
const express_1 = require("express");
const validator_1 = require("../../settings/validators/validator");
const categories_validator_1 = require("../../settings/validators/categories.validator");
const categories_service_1 = require("../../controller/categories.service");
const middleware_1 = require("../../middleware");
const role_enum_1 = require("../../enums/role.enum");
exports.categoryRouter = (0, express_1.Router)();
const categoriesService = new categories_service_1.CategoriesService();
exports.categoryRouter.get("/liste", middleware_1.authenticate, categoriesService.listeCategories);
exports.categoryRouter.post("/creer", categoriesService.ajouterCategorie);
exports.categoryRouter.put("/modifier", middleware_1.authenticate, (0, middleware_1.requireRole)(role_enum_1.Role.ADMIN), validator_1.requestBodyValidator.body(categories_validator_1.modifyCategorySchema), categoriesService.modifierCategorie);
exports.categoryRouter.delete("/supprimer", middleware_1.authenticate, (0, middleware_1.requireRole)(role_enum_1.Role.ADMIN), categoriesService.supprimerCategorie);
//# sourceMappingURL=category.router.js.map