import { Router } from "express";
import { requestBodyValidator } from "../settings/validators/validator";
import {
  ajouterFournisseurValidator,
  modifierFournisseurValidator,
  supprimerFournisseurValidator,
} from "../settings/validators/fournisseur.validator";
import { FournisseurService } from "../controller/fournisseur.service";
import { authenticate, requireRole } from "../middleware";
import { Role } from "../enums/role.enum";

export const fournisseurRouter = Router();

const fournisseurService = new FournisseurService();

fournisseurRouter.get(
  "/liste",
  fournisseurService.listeFournisseurs,
);

fournisseurRouter.post(
  "/ajouter",
  authenticate,
  requireRole(Role.ADMIN, Role.ADMIN1, Role.ADMIN2),
  requestBodyValidator.body(ajouterFournisseurValidator),
  fournisseurService.creerFournisseur,
);

fournisseurRouter.put(
  "/modifier",
  authenticate,
  requireRole(Role.ADMIN, Role.ADMIN1, Role.ADMIN2),
  requestBodyValidator.body(modifierFournisseurValidator),
  fournisseurService.modifierFournisseur,
);

fournisseurRouter.delete(
  "/supprimer",
  authenticate,
  requireRole(Role.ADMIN, Role.ADMIN1, Role.ADMIN2),
  fournisseurService.supprimerFournisseur,
);
