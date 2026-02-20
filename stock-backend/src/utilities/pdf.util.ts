import * as fs from "fs";
import * as path from "path";
import puppeteer from "puppeteer";
import { DemandeArticle } from "../entity/DemandeArticle";
import { Sortie } from "../entity/Sortie";
import { RetourArticle } from "../entity/RetourArticle";
import { getUploadsDir } from "../config/multer.config";
import {
  generateFicheExpeditionHtmlForDemande,
  generateFicheExpeditionHtmlForSortie,
  generateBLHtmlForSortie,
  generateBonDeRetourHtml,
} from "./pdf-template.util";

export type DocumentType = "fiche_expedition" | "bande_commande" | "bande_livraison" | "bon_de_retour" | "documents_zip";
export type PdfType = "fiche_expedition" | "bande_livraison" | "bon_de_retour";

export interface GeneratedPdfInfo {
  type: DocumentType;
  filename: string;
  path: string;
  size: number;
}

/**
 * Génère un PDF à partir de HTML brut via Puppeteer.
 */
async function renderHtmlToPdf(html: string, filePath: string): Promise<void> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  await page.pdf({
    path: filePath,
    format: "A4",
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });

  await browser.close();
}

/**
 * Génère la Fiche d'Expédition pour une demande confirmée.
 * Appelé lors de la confirmation d'une DemandeArticle.
 */
export async function generateFicheExpeditionForDemande(
  demande: DemandeArticle,
): Promise<GeneratedPdfInfo> {
  const dir = getUploadsDir("demandes", demande.id);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const filename = `fiche_expedition_${Date.now()}.pdf`;
  const filePath = path.join(dir, filename);
  const html = generateFicheExpeditionHtmlForDemande(demande);

  await renderHtmlToPdf(html, filePath);

  const stat = fs.statSync(filePath);
  return { type: "fiche_expedition", filename, path: filePath, size: stat.size };
}

/**
 * Génère la Fiche d'Expédition pour une sortie interne confirmée.
 * Appelé lors de la confirmation d'une Sortie avec typeSortie = "interne_depot" ou "interne_chantier".
 */
export async function generateFicheExpeditionForSortie(
  sortie: Sortie,
): Promise<GeneratedPdfInfo> {
  const dir = getUploadsDir("sorties", sortie.id);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const filename = `fiche_expedition_${Date.now()}.pdf`;
  const filePath = path.join(dir, filename);
  const html = generateFicheExpeditionHtmlForSortie(sortie);

  await renderHtmlToPdf(html, filePath);

  const stat = fs.statSync(filePath);
  return { type: "fiche_expedition", filename, path: filePath, size: stat.size };
}

/**
 * Génère le Bon de Livraison (BL) pour une sortie externe confirmée.
 * Appelé lors de la confirmation d'une Sortie avec typeSortie = "externe".
 */
export async function generateBonDeLivraisonForSortie(
  sortie: Sortie,
): Promise<GeneratedPdfInfo> {
  const dir = getUploadsDir("sorties", sortie.id);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const filename = `bande_livraison_${Date.now()}.pdf`;
  const filePath = path.join(dir, filename);
  const html = generateBLHtmlForSortie(sortie);

  await renderHtmlToPdf(html, filePath);

  const stat = fs.statSync(filePath);
  return { type: "bande_livraison", filename, path: filePath, size: stat.size };
}

/**
 * Génère le Bon de Retour (BR) pour un retour approuvé.
 * Appelé lors de l'approbation d'un RetourArticle.
 */
export async function generateBonDeRetourForRetour(
  retour: RetourArticle,
): Promise<GeneratedPdfInfo> {
  const dir = getUploadsDir("retours", retour.id);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const filename = `bon_de_retour_${Date.now()}.pdf`;
  const filePath = path.join(dir, filename);
  const html = generateBonDeRetourHtml(retour);

  await renderHtmlToPdf(html, filePath);

  const stat = fs.statSync(filePath);
  return { type: "bon_de_retour", filename, path: filePath, size: stat.size };
}
