import { Router } from "express";
import { requestBodyValidator } from "../../settings/validators/validator";
import {
  creerSousFamilleSchema,
  modifierSousFamilleSchema,
} from "../../settings/validators/sousFamilles.validator";
import { SousFamillesService } from "../../controller/sous-familles.service";
import { authenticate, requireRole } from "../../middleware";
import { Role } from "../../enums/role.enum";

export const sousFamillesRouter = Router();
const sousFamilleService = new SousFamillesService();

sousFamillesRouter.get("/liste", authenticate, sousFamilleService.listeSousFamilles);

sousFamillesRouter.get("/filtrer", authenticate, sousFamilleService.filtrerSousFamilles);

sousFamillesRouter.post(
  "/creer",
  authenticate,
  requireRole(Role.ADMIN),
  requestBodyValidator.body(creerSousFamilleSchema),
  sousFamilleService.creerSousFamille
);

sousFamillesRouter.put(
  "/modifier",
  authenticate,
  requireRole(Role.ADMIN),
  requestBodyValidator.body(modifierSousFamilleSchema),
  sousFamilleService.modifierSousFamille
);

sousFamillesRouter.delete(
  "/supprimer",
  authenticate,
  requireRole(Role.ADMIN),
  sousFamilleService.supprimerSousFamille
);
