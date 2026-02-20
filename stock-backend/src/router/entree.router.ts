import { Router } from "express";
import { requestBodyValidator } from "../settings/validators/validator";
import { confirmerEntreeValidator } from "../settings/validators/entree.validator";
import { uploadEntreeDocuments } from "../config/multer.config";
import { EntreeService } from "../controller/entree.service";
import { authenticate, requireRole } from "../middleware";
import { Role } from "../enums/role.enum";

export const entreeRouter = Router();
const service = new EntreeService();

entreeRouter.get(
  "/liste-confirme",
  authenticate,
  requireRole(Role.ADMIN, Role.ADMIN1, Role.MAGAZINIER),
  service.listerEntrees,
);
entreeRouter.get(
  "/liste-pending",
  authenticate,
  requireRole(Role.ADMIN, Role.ADMIN1, Role.MAGAZINIER),
  service.listerPendingEntrees,
);
entreeRouter.post(
  "/ajouter",
  authenticate,
  requireRole(Role.ADMIN, Role.ADMIN1, Role.MAGAZINIER),
  uploadEntreeDocuments,
  service.ajouterEntree,
);
entreeRouter.put(
  "/traiter",
  authenticate,
  requireRole(Role.ADMIN, Role.ADMIN1, Role.MAGAZINIER),
  requestBodyValidator.body(confirmerEntreeValidator),
  service.confirmerOuRefuser.bind(service),
);

entreeRouter.delete(
  "/supprimer",
  authenticate,
  requireRole(Role.ADMIN, Role.ADMIN1, Role.MAGAZINIER),
  service.supprimer,
);
