import path from "path";
import multer = require("multer");
import { Request } from "express";

/** Dossier racine des uploads (à la racine du projet) */
const UPLOADS_ROOT = path.resolve(process.cwd(), "uploads");

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

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Type de fichier non autorisé: ${file.mimetype}`));
  }
};

/**
 * Stockage en mémoire pour l'entrée stock.
 * Les fichiers sont écrits dans uploads/entrees/{entreeId}/ par le service après création de l'entrée.
 */
export const uploadEntreeDocuments = multer({
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
export function getUploadsDir(
  type: "entrees" | "sorties" | "demandes" | "retours",
  id: number,
): string {
  return path.join(UPLOADS_ROOT, type, String(id));
}

export { UPLOADS_ROOT };
