import { Router } from "express";
import { requestBodyValidator } from "../settings/validators/validator";
import {
  ajouterChantierValidator,
  modifierChantierValidator,
  supprimerChantierValidator,
  affecterChantierValidator,
} from "../settings/validators/chantier.validator";
import { ChantierService } from "../controller/chantier.service";
import { authenticate, requireRole } from "../middleware";
import { Role } from "../enums/role.enum";

export const chantierRouter = Router();

const chantierService = new ChantierService();

chantierRouter.get(
  "/liste",
  chantierService.listeChantiers,
);

chantierRouter.get(
  "/mes-chantiers",
  authenticate,
  requireRole(Role.RESPONSABLE_CHANTIER, Role.MERCHANT),
  chantierService.getMesChantiers,
);

chantierRouter.post(
  "/ajouter",
  authenticate,
  requireRole(Role.ADMIN, Role.ADMIN1, Role.ADMIN2),
  requestBodyValidator.body(ajouterChantierValidator),
  chantierService.creerChantier,
);

chantierRouter.put(
  "/affecter",
  authenticate,
  requireRole(Role.ADMIN, Role.ADMIN1, Role.ADMIN2),
  requestBodyValidator.body(affecterChantierValidator),
  chantierService.affecterChantier,
);

chantierRouter.put(
  "/modifier",
  authenticate,
  requireRole(Role.ADMIN, Role.ADMIN1, Role.ADMIN2),
  requestBodyValidator.body(modifierChantierValidator),
  chantierService.modifierChantier,
);

chantierRouter.delete(
  "/supprimer",
  authenticate,
  requireRole(Role.ADMIN, Role.ADMIN1, Role.ADMIN2),
  chantierService.supprimerChantier,
);

chantierRouter.get(
  "/summary/:chantierId",
  authenticate,
  requireRole(Role.ADMIN, Role.ADMIN1, Role.ADMIN2),
  chantierService.getChantierSummary,
);

// Stock per chantier: articles available (delivered - returned)
chantierRouter.get(
  "/stock/:chantierId",
  authenticate,
  requireRole(Role.ADMIN, Role.ADMIN1, Role.ADMIN2, Role.RESPONSABLE_CHANTIER, Role.MERCHANT),
  chantierService.getChantierStock,
);

