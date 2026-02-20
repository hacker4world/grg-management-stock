import { Router } from "express";
import { DocumentService } from "../controller/document.service";
import { authenticate } from "../middleware";

export const documentRouter = Router();
const service = new DocumentService();

documentRouter.get("/:id/download", service.download);
documentRouter.get("/demande/:demandeId/download-all", service.downloadAllForDemande);
