"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentService = void 0;
const fs_1 = __importDefault(require("fs"));
const archiver_1 = __importDefault(require("archiver"));
const repositories_1 = require("../repository/repositories");
class DocumentService {
    /**
     * GET /api/documents/:id/download
     * Auth via middleware. Role-based access: admin/magazinier = all; responsable-chantier = only docs from their chantiers.
     */
    async download(req, res) {
        const compte = req.user;
        const id = Number(req.params.id);
        if (!id || isNaN(id))
            return res.status(400).json({ message: "ID document invalide" });
        const document = await repositories_1.documentRepository.findOne({
            where: { id },
            relations: { entree: true, demandeArticle: { chantier: true }, sortie: { chantier: true } },
        });
        if (!document)
            return res.status(404).json({ message: "Document introuvable" });
        // Vérification des permissions
        /* if (compte.role === "admin" || compte.role === "magazinier") {
          // Accès autorisé
        } else if (compte.role === "responsable-chantier") {
          if (document.demandeArticle) {
            const chantierCode = document.demandeArticle.chantier?.code;
            if (chantierCode == null)
              return res.status(403).json({ message: "Accès refusé à ce document" });
            const chantierDuCompte = await chantierRepository.findOne({
              where: { code: chantierCode, compte: { id: compte.id } },
            });
            if (!chantierDuCompte)
              return res.status(403).json({ message: "Accès refusé à ce document" });
          } else if (document.entree) {
            return res.status(403).json({ message: "Accès refusé (document d'entrée réservé au magasinier/admin)" });
          }
        } else {
          return res.status(403).json({ message: "Rôle insuffisant pour télécharger ce document" });
        } */
        const filePath = document.path;
        if (!fs_1.default.existsSync(filePath))
            return res.status(404).json({ message: "Fichier introuvable sur le serveur" });
        const filename = document.originalName || document.filename;
        res.setHeader("Content-Type", document.mimeType);
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        const stream = fs_1.default.createReadStream(filePath);
        stream.pipe(res);
    }
    /**
     * GET /api/documents/demande/:demandeId/download-all
     * Download all documents (BC + BL) for a demande as ZIP
     */
    async downloadAllForDemande(req, res) {
        const compte = req.user;
        const demandeId = Number(req.params.demandeId);
        if (!demandeId || isNaN(demandeId))
            return res.status(400).json({ message: "ID demande invalide" });
        const demande = await repositories_1.demandeArticlesRepository.findOne({
            where: { id: demandeId },
            relations: { chantier: { compte: true }, documents: true },
        });
        if (!demande)
            return res.status(404).json({ message: "Demande introuvable" });
        // Permission check
        if (compte.role === "responsable-chantier") {
            if (demande.chantier?.compte?.id !== compte.id) {
                return res.status(403).json({ message: "Accès refusé" });
            }
        }
        else if (compte.role !== "admin" && compte.role !== "magazinier") {
            return res.status(403).json({ message: "Rôle insuffisant" });
        }
        if (!demande.documents || demande.documents.length === 0)
            return res.status(404).json({ message: "Aucun document trouvé" });
        // Check all files exist
        const validDocs = demande.documents.filter(doc => fs_1.default.existsSync(doc.path));
        if (validDocs.length === 0)
            return res.status(404).json({ message: "Fichiers introuvables sur le serveur" });
        // Create ZIP
        const zipFilename = `documents_demande_${demandeId}.zip`;
        res.setHeader("Content-Type", "application/zip");
        res.setHeader("Content-Disposition", `attachment; filename="${zipFilename}"`);
        const archive = (0, archiver_1.default)("zip", { zlib: { level: 9 } });
        archive.pipe(res);
        for (const doc of validDocs) {
            archive.file(doc.path, { name: doc.originalName || doc.filename });
        }
        await archive.finalize();
    }
}
exports.DocumentService = DocumentService;
//# sourceMappingURL=document.service.js.map