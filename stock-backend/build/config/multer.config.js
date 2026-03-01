"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UPLOADS_ROOT = exports.uploadEntreeDocuments = void 0;
exports.getUploadsDir = getUploadsDir;
const path_1 = __importDefault(require("path"));
const multer = require("multer");
/** Dossier racine des uploads (à la racine du projet) */
const UPLOADS_ROOT = path_1.default.resolve(process.cwd(), "uploads");
exports.UPLOADS_ROOT = UPLOADS_ROOT;
/** MIME types autorisés pour les documents (bande commande / livraison) */
const ALLOWED_MIME_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
];
/** Taille max par fichier (10 Mo) */
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const fileFilter = (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error(`Type de fichier non autorisé: ${file.mimetype}`));
    }
};
/**
 * Stockage en mémoire pour l'entrée stock.
 * Les fichiers sont écrits dans uploads/entrees/{entreeId}/ par le service après création de l'entrée.
 */
exports.uploadEntreeDocuments = multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: 2,
    },
}).fields([
    { name: "bande_commande", maxCount: 1 },
    { name: "bande_livraison", maxCount: 1 },
]);
/**
 * Retourne le chemin du dossier uploads pour un type et un ID.
 * Utilisé pour créer les dossiers sorties/{demandeId} et entrees/{entreeId}.
 */
function getUploadsDir(type, id) {
    return path_1.default.join(UPLOADS_ROOT, type, String(id));
}
//# sourceMappingURL=multer.config.js.map