"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentRouter = void 0;
const express_1 = require("express");
const document_service_1 = require("../controller/document.service");
exports.documentRouter = (0, express_1.Router)();
const service = new document_service_1.DocumentService();
exports.documentRouter.get("/:id/download", service.download);
exports.documentRouter.get("/demande/:demandeId/download-all", service.downloadAllForDemande);
//# sourceMappingURL=document.router.js.map