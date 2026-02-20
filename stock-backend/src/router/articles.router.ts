import { Router } from "express";
import { requestBodyValidator } from "../settings/validators/validator";
import { ArticleService } from "../controller/articles.service";
import {
  createArticleSchema,
  updateArticleSchema,
} from "../settings/validators/articles.validator";
import { authenticate, requireRole } from "../middleware";
import { Role } from "../enums/role.enum";

export const articlesRouter = Router();

const articlesService = new ArticleService();

articlesRouter.get(
  "/liste",
  authenticate,
  requireRole(Role.ADMIN, Role.MAGAZINIER, Role.ADMIN1, Role.ADMIN2, Role.RESPONSABLE_CHANTIER, Role.MERCHANT),
  articlesService.listArticles,
);

articlesRouter.get(
  "/fournisseur-list",
  articlesService.listArticleFournisseurs,
);

articlesRouter.post(
  "/creer",
  authenticate,
  requireRole(Role.ADMIN, Role.ADMIN1, Role.ADMIN2),
  requestBodyValidator.body(createArticleSchema),
  articlesService.createArticle,
);

articlesRouter.put(
  "/modifier",
  authenticate,
  requireRole(Role.ADMIN, Role.ADMIN1, Role.ADMIN2),
  requestBodyValidator.body(updateArticleSchema),
  articlesService.updateArticle,
);

articlesRouter.delete(
  "/supprimer",
  authenticate,
  requireRole(Role.ADMIN, Role.ADMIN1, Role.ADMIN2),
  articlesService.deleteArticle,
);
