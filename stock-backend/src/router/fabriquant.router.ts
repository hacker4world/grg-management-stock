import { Router } from "express";
import { requestBodyValidator } from "../settings/validators/validator";
import {
  ajouterFabriquantValidator,
  modifierFabriquantValidator,
} from "../settings/validators/fabriquant.validator";
import { FabriquantService } from "../controller/fabriquant.service";
import { authenticate, requireRole } from "../middleware";
import { Role } from "../enums/role.enum";

export const fabriquantRouter = Router();

const fabriquantService = new FabriquantService();

fabriquantRouter.get("/liste", authenticate, fabriquantService.listeFabriquants);

fabriquantRouter.post(
  "/ajouter",
  authenticate,
  requireRole(Role.ADMIN, Role.ADMIN1, Role.ADMIN2),
  requestBodyValidator.body(ajouterFabriquantValidator),
  fabriquantService.ajouterFabriquant
);

fabriquantRouter.put(
  "/modifier",
  authenticate,
  requireRole(Role.ADMIN, Role.ADMIN1, Role.ADMIN2),
  requestBodyValidator.body(modifierFabriquantValidator),
  fabriquantService.modifierFabriquant,
);

fabriquantRouter.delete(
  "/supprimer",
  authenticate,
  requireRole(Role.ADMIN, Role.ADMIN1, Role.ADMIN2),
  fabriquantService.supprimerFabriquant,
);