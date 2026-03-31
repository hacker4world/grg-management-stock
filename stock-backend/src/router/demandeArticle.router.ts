import { Router } from "express";
import { DemandeArticleService } from "../controller/demandeArticles.service";
import { authenticate, requireRole } from "../middleware";
import { Role } from "../enums/role.enum";
import { requestBodyValidator } from "../settings/validators/validator";
import { ConfirmDenyDemandeValidator, CreateDemandeArticleValidator } from "../settings/validators/demande-article.validator";

export const demandeArticlesRouter = Router();

const demandeArticlesService = new DemandeArticleService();

demandeArticlesRouter.get(
  "/liste",
  authenticate,
  requireRole(Role.ADMIN, Role.ADMIN1, Role.ADMIN2, Role.RESPONSABLE_CHANTIER),
  demandeArticlesService.listDemandes,
);

demandeArticlesRouter.post(
  "/ajouter",
  authenticate,
  requireRole(
    Role.ADMIN,
    Role.ADMIN1,
    Role.ADMIN2,
    Role.RESPONSABLE_CHANTIER,
    Role.MERCHANT,
  ),
  requestBodyValidator.body(CreateDemandeArticleValidator),
  demandeArticlesService.createDemande,
);

demandeArticlesRouter.post(
  "/traiter",
  authenticate,
  requireRole(Role.ADMIN, Role.ADMIN1, Role.ADMIN2),
  requestBodyValidator.body(ConfirmDenyDemandeValidator),
  demandeArticlesService.confirmOrDeny,
);