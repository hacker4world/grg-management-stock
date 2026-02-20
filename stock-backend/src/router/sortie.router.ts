import { Router, Request, Response, NextFunction } from "express";
import { requestBodyValidator } from "../settings/validators/validator";
import {
  createSortieValidator,
  listSortiesValidator,
  confirmDenySortieValidator,
  deleteSortieValidator,
} from "../settings/validators/sortie.validator";
import { SortieService } from "../controller/sortie.service";
import { authenticate, requireRole } from "../middleware";
import { Role } from "../enums/role.enum";

export const sortieRouter = Router();
const service = new SortieService();

/**
 * Custom middleware for the dynamic createSortieValidator
 * (it's a function, not a Joi schema, so we can't use requestBodyValidator.body())
 */
function validateCreateSortie(req: Request, res: Response, next: NextFunction) {
  const result: any = createSortieValidator(req.body);
  if (result.error) {
    const errorMessage = result.error.details
      ? result.error.details.map((d: any) => d.message)
      : result.error.message;
    return res.status(400).json({
      message: "Validation error",
      details: errorMessage,
    });
  }
  if (result.value) {
    req.body = result.value;
  }
  next();
}

sortieRouter.post(
  "/create",
  authenticate,
  requireRole(Role.ADMIN, Role.ADMIN1, Role.MAGAZINIER),
  validateCreateSortie,
  service.createSortie.bind(service),
);

sortieRouter.get(
  "/list-pending",
  authenticate,
  requireRole(Role.ADMIN, Role.ADMIN1, Role.MAGAZINIER),
  requestBodyValidator.query(listSortiesValidator),
  service.listSorties.bind(service),
);

sortieRouter.get(
  "/list-confirme",
  authenticate,
  requireRole(Role.ADMIN, Role.ADMIN1, Role.MAGAZINIER),
  requestBodyValidator.query(listSortiesValidator),
  service.listConfirmedSorties.bind(service),
);

sortieRouter.put(
  "/confirm-deny",
  authenticate,
  requireRole(Role.ADMIN, Role.ADMIN1, Role.MAGAZINIER),
  requestBodyValidator.body(confirmDenySortieValidator),
  service.confirmDenySortie.bind(service),
);

sortieRouter.delete(
  "/supprimer",
  authenticate,
  requireRole(Role.ADMIN, Role.ADMIN1, Role.MAGAZINIER),
  requestBodyValidator.query(deleteSortieValidator),
  service.deleteSortie.bind(service),
);
