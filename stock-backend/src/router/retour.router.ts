import { Router } from "express";
import { requestBodyValidator } from "../settings/validators/validator";
import { RetourService } from "../controller/retour.service";
import {
  createRetourValidator,
  listRetoursValidator,
  approveDenyRetourValidator,
} from "../settings/validators/retour.validator";
import { authenticate, requireRole } from "../middleware";
import { Role } from "../enums/role.enum";

export const retourRouter = Router();
const service = new RetourService();

retourRouter.post(
  "/ajouter",
  authenticate,
  requireRole(Role.ADMIN, Role.ADMIN1, Role.ADMIN2, Role.RESPONSABLE_CHANTIER, Role.MERCHANT),
  requestBodyValidator.body(createRetourValidator),
  service.createRetour,
);

retourRouter.get(
  "/liste",
  requestBodyValidator.query(listRetoursValidator),
  service.listRetours,
);

retourRouter.put(
  "/traiter",
  authenticate,
  requireRole(Role.ADMIN, Role.ADMIN1, Role.ADMIN2),
  requestBodyValidator.body(approveDenyRetourValidator),
  service.approveDenyRetour,
);

