import { Router } from "express";
import { UniteService } from "../controller/unite.service";
import { requestBodyValidator } from "../settings/validators/validator";
import { uniteSchemas } from "../settings/validators/unite.validator";
import { authenticate, requireRole } from "../middleware";
import { Role } from "../enums/role.enum";

export const uniteRouter = Router();

export const uniteService = new UniteService();

uniteRouter.get(
  "/liste",
  uniteService.listeUnites,
);

uniteRouter.post(
  "/creer",
  authenticate,
  requireRole(Role.ADMIN, Role.ADMIN1, Role.ADMIN2),
  requestBodyValidator.body(uniteSchemas.create),
  uniteService.creerUnite,
);
uniteRouter.put(
  "/modifier",
  authenticate,
  requireRole(Role.ADMIN, Role.ADMIN1, Role.ADMIN2),
  requestBodyValidator.body(uniteSchemas.update),
  uniteService.modifierUnite,
);
uniteRouter.delete(
  "/supprimer",
  authenticate,
  requireRole(Role.ADMIN, Role.ADMIN1, Role.ADMIN2),
  uniteService.supprimerUnite,
);
