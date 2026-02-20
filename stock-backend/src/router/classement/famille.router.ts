import { Router } from "express";
import { requestBodyValidator } from "../../settings/validators/validator";
import {
  createFamilleSchema,
  modifierFamilleSchema,
  supprimerFamilleSchema,
} from "../../settings/validators/familles.validator";
import { FamilleService } from "../../controller/famille.service";
import { authenticate, requireRole } from "../../middleware";
import { Role } from "../../enums/role.enum";

export const familleRouter = Router();
const famillesService = new FamilleService();

familleRouter.get("/liste", famillesService.listeFamilles);

familleRouter.get(
  "/tous",
  famillesService.listAll,
);

familleRouter.get("/recherche", famillesService.rechercherFamilles);

familleRouter.post(
  "/creer",
  authenticate,
  requireRole(Role.ADMIN, Role.ADMIN1, Role.ADMIN2),
  requestBodyValidator.body(createFamilleSchema),
  famillesService.creerFamille,
);

familleRouter.put(
  "/modifier",
  authenticate,
  requireRole(Role.ADMIN, Role.ADMIN1, Role.ADMIN2),
  requestBodyValidator.body(modifierFamilleSchema),
  famillesService.modifierFamille,
);

familleRouter.delete(
  "/supprimer",
  authenticate,
  requireRole(Role.ADMIN, Role.ADMIN1, Role.ADMIN2),
  famillesService.supprimerFamille,
);
