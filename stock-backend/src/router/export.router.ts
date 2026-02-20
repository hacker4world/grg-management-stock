import { Router } from "express";
import { ExportService } from "../controller/export.service";
import { authenticate, requireRole } from "../middleware";
import { Role } from "../enums/role.enum";

const exportService = new ExportService();
export const exportRouter = Router();

/* All export routes require authentication + admin roles */
exportRouter.use(authenticate);
exportRouter.use(requireRole(Role.ADMIN, Role.ADMIN1, Role.ADMIN2));

exportRouter.post(
  "/export-articles",
  exportService.exportArticles.bind(exportService),
);
exportRouter.post(
  "/export-fournisseurs",
  exportService.exportFournisseurs.bind(exportService),
);
exportRouter.post(
  "/export-fabriquants",
  exportService.exportFabriquants.bind(exportService),
);
exportRouter.post(
  "/export-chantiers",
  exportService.exportChantiers.bind(exportService),
);
exportRouter.post(
  "/export-familles",
  exportService.exportFamilles.bind(exportService),
);
exportRouter.post(
  "/export-sous-familles",
  exportService.exportSousFamilles.bind(exportService),
);
exportRouter.post(
  "/export-categories",
  exportService.exportCategories.bind(exportService),
);
exportRouter.post(
  "/export-entrees",
  exportService.exportEntrees.bind(exportService),
);
exportRouter.post(
  "/export-sorties",
  exportService.exportSorties.bind(exportService),
);
exportRouter.post(
  "/export-demandes",
  exportService.exportDemandesArticles.bind(exportService),
);
exportRouter.post(
  "/export-retours",
  exportService.exportRetoursArticles.bind(exportService),
);

exportRouter.post(
  "/export-notifications",
  exportService.exportNotifications.bind(exportService),
);
exportRouter.post(
  "/export-unites",
  exportService.exportUnites.bind(exportService),
);
exportRouter.post(
  "/export-depots",
  exportService.exportDepots.bind(exportService),
);

exportRouter.post(
  "/export-comptes",
  exportService.exportComptes.bind(exportService),
);

/* ---- NEW: Export historique complet d'un chantier ---- */
exportRouter.post(
  "/export-historique-chantier/:chantierId",
  exportService.exportHistoriqueChantier.bind(exportService),
);
