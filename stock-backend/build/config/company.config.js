"use strict";
/**
 * Configuration société (émetteur) pour les documents PDF (bande commande / bande livraison).
 * Les valeurs peuvent être surchargées via variables d'environnement (COMPANY_*, BANK_*, etc.).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyConfig = void 0;
const defaultCompanyName = "SOCIÉTÉ GAFSI RAMZI GÉNÉRAL BÂTIMENTS";
const defaultBank = {
    banque: process.env.BANK_NAME || "BANQUE ZITOUNA",
    numeroCompte: process.env.BANK_ACCOUNT || "25031000001508197679",
    iban: process.env.BANK_IBAN || "TN59 2503 1000 0015 0819 7679",
    bic: process.env.BANK_BIC || "BZITTNTT",
    ownerName: process.env.BANK_OWNER || `${defaultCompanyName} - GRG BT`,
};
exports.companyConfig = {
    name: process.env.COMPANY_NAME || defaultCompanyName,
    address: (process.env.COMPANY_ADDRESS || "36, Avenue de la république\n2050 Hammam Lif").split("\n"),
    tel: process.env.COMPANY_TEL || "58 568 800",
    email: process.env.COMPANY_EMAIL || "contact@grg-bt.tn",
    web: process.env.COMPANY_WEB || "www.grg-bt.tn",
    rc: process.env.COMPANY_RC || "1755259 E",
    matriculeFiscal: process.env.COMPANY_MATRICULE || "1755259 E/A/M 000",
    shippingMethod: process.env.COMPANY_SHIPPING || "Nos propres moyens",
    paymentTerms: process.env.COMPANY_PAYMENT_TERMS || "Règlement 50% d'avance, 50% à la livraison",
    bank: defaultBank,
    /** Logo template GR/GRG : mettre le fichier dans assets/logo.png ou définir COMPANY_LOGO_PATH */
    logoPath: process.env.COMPANY_LOGO_PATH || "assets/logo.jpg",
    validityDays: Number(process.env.COMPANY_VALIDITY_DAYS) || 10,
    tvaRate: Number(process.env.COMPANY_TVA_RATE) || 19,
    currencyLabel: process.env.COMPANY_CURRENCY || "Dinars tunisiens",
};
//# sourceMappingURL=company.config.js.map