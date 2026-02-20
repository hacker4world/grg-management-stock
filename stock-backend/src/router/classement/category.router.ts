import { Router } from "express";
import { requestBodyValidator } from "../../settings/validators/validator";
import {
  createCategorySchema,
  deleteCategorySchema,
  modifyCategorySchema,
} from "../../settings/validators/categories.validator";
import { CategoriesService } from "../../controller/categories.service";
import { authenticate, requireRole } from "../../middleware";
import { Role } from "../../enums/role.enum";

export const categoryRouter = Router();
const categoriesService = new CategoriesService();

categoryRouter.get(
  "/liste",
  authenticate, categoriesService.listeCategories,
);

categoryRouter.post("/creer", categoriesService.ajouterCategorie);
categoryRouter.put(
  "/modifier",
  authenticate,
  requireRole(Role.ADMIN),
  requestBodyValidator.body(modifyCategorySchema),
  categoriesService.modifierCategorie,
);

categoryRouter.delete(
  "/supprimer",
  authenticate,
  requireRole(Role.ADMIN),
  categoriesService.supprimerCategorie,
);
