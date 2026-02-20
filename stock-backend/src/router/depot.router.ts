import { Router } from "express";
import { DepotService } from "../controller/depot.service";
import { depotSchemas } from "../settings/validators/depot.validator";
import { requestBodyValidator } from "../settings/validators/validator";
import { authenticate, requireRole } from "../middleware";
import { Role } from "../enums/role.enum";

export const depotRouter = Router();

const depotService = new DepotService();

depotRouter.get(
  "/liste",
  depotService.listeDepots,
);

depotRouter.post(
  "/ajouter",
  authenticate,
  requireRole(Role.ADMIN, Role.ADMIN1, Role.ADMIN2),
  requestBodyValidator.body(depotSchemas.create),
  depotService.creerDepot,
);

depotRouter.put(
  "/modifier",
  authenticate,
  requireRole(Role.ADMIN, Role.ADMIN1, Role.ADMIN2),
  requestBodyValidator.body(depotSchemas.update),
  depotService.modifierDepot,
);

depotRouter.delete(
  "/supprimer",
  authenticate,
  requireRole(Role.ADMIN, Role.ADMIN1, Role.ADMIN2),
  depotService.supprimerDepot,
);
