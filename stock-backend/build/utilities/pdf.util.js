"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFicheExpeditionForDemande = generateFicheExpeditionForDemande;
exports.generateFicheExpeditionForSortie = generateFicheExpeditionForSortie;
exports.generateBonDeLivraisonForSortie = generateBonDeLivraisonForSortie;
exports.generateBonDeRetourForRetour = generateBonDeRetourForRetour;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const puppeteer_1 = __importDefault(require("puppeteer"));
const multer_config_1 = require("../config/multer.config");
const pdf_template_util_1 = require("./pdf-template.util");
/**
 * Génère un PDF à partir de HTML brut via Puppeteer.
 */
async function renderHtmlToPdf(html, filePath) {
    const browser = await puppeteer_1.default.launch({
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
async function generateFicheExpeditionForDemande(demande) {
    const dir = (0, multer_config_1.getUploadsDir)("demandes", demande.id);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    const filename = `fiche_expedition_${Date.now()}.pdf`;
    const filePath = path.join(dir, filename);
    const html = (0, pdf_template_util_1.generateFicheExpeditionHtmlForDemande)(demande);
    await renderHtmlToPdf(html, filePath);
    const stat = fs.statSync(filePath);
    return { type: "fiche_expedition", filename, path: filePath, size: stat.size };
}
/**
 * Génère la Fiche d'Expédition pour une sortie interne confirmée.
 * Appelé lors de la confirmation d'une Sortie avec typeSortie = "interne_depot" ou "interne_chantier".
 */
async function generateFicheExpeditionForSortie(sortie) {
    const dir = (0, multer_config_1.getUploadsDir)("sorties", sortie.id);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    const filename = `fiche_expedition_${Date.now()}.pdf`;
    const filePath = path.join(dir, filename);
    const html = (0, pdf_template_util_1.generateFicheExpeditionHtmlForSortie)(sortie);
    await renderHtmlToPdf(html, filePath);
    const stat = fs.statSync(filePath);
    return { type: "fiche_expedition", filename, path: filePath, size: stat.size };
}
/**
 * Génère le Bon de Livraison (BL) pour une sortie externe confirmée.
 * Appelé lors de la confirmation d'une Sortie avec typeSortie = "externe".
 */
async function generateBonDeLivraisonForSortie(sortie) {
    const dir = (0, multer_config_1.getUploadsDir)("sorties", sortie.id);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    const filename = `bande_livraison_${Date.now()}.pdf`;
    const filePath = path.join(dir, filename);
    const html = (0, pdf_template_util_1.generateBLHtmlForSortie)(sortie);
    await renderHtmlToPdf(html, filePath);
    const stat = fs.statSync(filePath);
    return { type: "bande_livraison", filename, path: filePath, size: stat.size };
}
/**
 * Génère le Bon de Retour (BR) pour un retour approuvé.
 * Appelé lors de l'approbation d'un RetourArticle.
 */
async function generateBonDeRetourForRetour(retour) {
    const dir = (0, multer_config_1.getUploadsDir)("retours", retour.id);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    const filename = `bon_de_retour_${Date.now()}.pdf`;
    const filePath = path.join(dir, filename);
    const html = (0, pdf_template_util_1.generateBonDeRetourHtml)(retour);
    await renderHtmlToPdf(html, filePath);
    const stat = fs.statSync(filePath);
    return { type: "bon_de_retour", filename, path: filePath, size: stat.size };
}
//# sourceMappingURL=pdf.util.js.map