"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportRouter = void 0;
const express_1 = require("express");
const export_service_1 = require("../controller/export.service");
const middleware_1 = require("../middleware");
const role_enum_1 = require("../enums/role.enum");
const exportService = new export_service_1.ExportService();
exports.exportRouter = (0, express_1.Router)();
/* All export routes require authentication + admin roles */
exports.exportRouter.use(middleware_1.authenticate);
exports.exportRouter.use((0, middleware_1.requireRole)(role_enum_1.Role.ADMIN, role_enum_1.Role.ADMIN1, role_enum_1.Role.ADMIN2));
exports.exportRouter.post("/export-articles", exportService.exportArticles.bind(exportService));
exports.exportRouter.post("/export-fournisseurs", exportService.exportFournisseurs.bind(exportService));
exports.exportRouter.post("/export-fabriquants", exportService.exportFabriquants.bind(exportService));
exports.exportRouter.post("/export-chantiers", exportService.exportChantiers.bind(exportService));
exports.exportRouter.post("/export-familles", exportService.exportFamilles.bind(exportService));
exports.exportRouter.post("/export-sous-familles", exportService.exportSousFamilles.bind(exportService));
exports.exportRouter.post("/export-categories", exportService.exportCategories.bind(exportService));
exports.exportRouter.post("/export-entrees", exportService.exportEntrees.bind(exportService));
exports.exportRouter.post("/export-sorties", exportService.exportSorties.bind(exportService));
exports.exportRouter.post("/export-demandes", exportService.exportDemandesArticles.bind(exportService));
exports.exportRouter.post("/export-retours", exportService.exportRetoursArticles.bind(exportService));
exports.exportRouter.post("/export-notifications", exportService.exportNotifications.bind(exportService));
exports.exportRouter.post("/export-unites", exportService.exportUnites.bind(exportService));
exports.exportRouter.post("/export-depots", exportService.exportDepots.bind(exportService));
exports.exportRouter.post("/export-comptes", exportService.exportComptes.bind(exportService));
/* ---- NEW: Export historique complet d'un chantier ---- */
exports.exportRouter.post("/export-historique-chantier/:chantierId", exportService.exportHistoriqueChantier.bind(exportService));
//# sourceMappingURL=export.router.js.map