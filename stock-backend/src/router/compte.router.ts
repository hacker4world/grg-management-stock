import { Router } from "express";
import { requestBodyValidator } from "../settings/validators/validator";
import {
  accepterRefuserCompteValidator,
  loginValidator,
  signupValidator,
} from "../settings/validators/authentification.validator";
import { AuthentificationService } from "../controller/authentification.service";
import { authenticate, requireRole } from "../middleware";
import { Role } from "../enums/role.enum";

export const compteRouter = Router();
const authentificationService = new AuthentificationService();

// Public routes
compteRouter.post(
  "/signup",
  requestBodyValidator.body(signupValidator),
  authentificationService.signup
);

compteRouter.post(
  "/login",
  requestBodyValidator.body(loginValidator),
  authentificationService.login
);

compteRouter.post("/logout", authentificationService.logout);

compteRouter.post("/refresh", authentificationService.refreshToken);

// Authenticated route
compteRouter.get("/verify", authenticate, authentificationService.verifierCompte);

// Admin-only routes
compteRouter.get(
  "/liste",
  authenticate,
  requireRole(Role.ADMIN),
  authentificationService.listeComptes
);
  
compteRouter.get(
  "/requettes",
  authenticate,
  requireRole(Role.ADMIN),
  authentificationService.listeComptesNonAccepté
);

compteRouter.post(
  "/accepter-compte",
  authenticate,
  requireRole(Role.ADMIN),
  requestBodyValidator.body(accepterRefuserCompteValidator),
  authentificationService.accepterCompte
);

compteRouter.put(
  "/modifier",
  authenticate,
  requireRole(Role.ADMIN),
  authentificationService.updateCompte
);

compteRouter.delete(
  "/supprimer",
  authenticate,
  requireRole(Role.ADMIN),
  authentificationService.deleteCompte
);

