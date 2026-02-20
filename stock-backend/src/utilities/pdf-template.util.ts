import * as fs from "fs";
import * as path from "path";
import { DemandeArticle } from "../entity/DemandeArticle";
import { Sortie } from "../entity/Sortie";
import { RetourArticle } from "../entity/RetourArticle";
import { companyConfig } from "../config/company.config";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function toFrenchDate(iso: string): string {
  const [yy, mm, dd] = iso.split("-");
  return `${dd}/${mm}/${yy}`;
}

function formatNumber(n: number): string {
  return Number(n).toLocaleString("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  });
}

function generateDocNum(id: number): string {
  const year = new Date().getFullYear().toString().slice(-2);
  const seq = String(id).padStart(4, "0");
  return `${year}-${seq}`;
}

/**
 * Reads the company logo and returns a base64 data-URI string.
 */
function getLogoDataUri(): string | null {
  const conf = companyConfig;
  if (!conf.logoPath) return null;

  const abs = path.isAbsolute(conf.logoPath)
    ? conf.logoPath
    : path.resolve(conf.logoPath);

  if (!fs.existsSync(abs)) return null;

  const ext = path.extname(abs).replace(".", "").toLowerCase();
  const mime = ext === "png" ? "image/png"
    : ext === "jpg" || ext === "jpeg" ? "image/jpeg"
    : ext === "gif" ? "image/gif"
    : "image/png";

  const b64 = fs.readFileSync(abs).toString("base64");
  return `data:${mime};base64,${b64}`;
}

/* ================================================================== */
/*  CSS for delivery / expedition documents (FE, BL, BR)               */
/* ================================================================== */

function deliveryCss(): string {
  return `
    @page { size: A4; margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 210mm; height: 297mm; overflow: hidden; }
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 9pt; color: #1a1a2e;
      padding: 8mm 10mm;
      display: flex; flex-direction: column;
    }

    /* ---- TOP HEADER ---- */
    .top-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 5mm;
      flex-shrink: 0;
    }
    .logo-area { text-align: center; }
    .logo-area img {
      width: 80px; height: 80px; object-fit: contain;
    }
    .logo-area .label {
      display: block; margin-top: 2px;
      font-size: 7pt; font-style: italic; color: #555;
    }
    .title-area { text-align: right; }
    .title-area .doc-title {
      font-size: 16pt; font-weight: bold; color: #1a1a2e;
      margin-bottom: 2mm;
    }
    .title-area .meta {
      font-size: 8pt; line-height: 1.5; color: #444;
    }

    /* ---- INFO BOXES (Expéditeur + Destinataire) ---- */
    .info-row {
      display: flex; gap: 5mm;
      margin-bottom: 4mm;
      flex-shrink: 0;
    }
    .info-box {
      flex: 1;
      border: 1px solid #2c3e6b;
      padding: 3mm;
      font-size: 8pt; line-height: 1.4;
      min-height: 28mm;
    }
    .info-box.expediteur {
      border-left: 4px solid #2c3e6b;
    }
    .info-box .box-label {
      font-size: 7pt; font-weight: bold;
      text-transform: uppercase; color: #2c3e6b;
      margin-bottom: 2mm; letter-spacing: 0.5px;
    }
    .info-box .company-name {
      font-weight: bold; font-size: 10pt; color: #1a1a2e;
      margin-bottom: 1mm;
    }

    /* ---- SHIPPING INFO ---- */
    .shipping-info {
      border: 1px solid #2c3e6b;
      padding: 2mm 4mm;
      margin-bottom: 4mm;
      font-size: 8pt; line-height: 1.5;
      flex-shrink: 0;
    }
    .shipping-info strong { color: #2c3e6b; }

    /* ---- TABLE WRAPPER (grows to fill remaining space) ---- */
    .table-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }

    /* ---- TABLE ---- */
    .items-table {
      width: 100%; border-collapse: collapse;
      font-size: 8pt;
      flex: 1;
    }
    .items-table thead th {
      background: #f0f0f0;
      border: 1px solid #999;
      padding: 1.5mm 2mm;
      font-weight: bold; text-align: center;
      font-size: 7.5pt; color: #1a1a2e;
    }
    .items-table thead th:first-child { text-align: left; }
    .items-table tbody td {
      border-left: 1px solid #ccc;
      border-right: 1px solid #ccc;
      padding: 1.5mm 2mm;
      vertical-align: middle;
    }
    .items-table tbody td.center { text-align: center; }
    .items-table tbody td.right { text-align: right; }

    /* spacer row fills remaining vertical space */
    .items-table tbody tr.spacer-row td {
      border-left: 1px solid #ccc;
      border-right: 1px solid #ccc;
      border-bottom: none;
      height: 100%;
    }

    /* total row */
    .items-table tfoot td {
      border: 1px solid #999;
      padding: 1.5mm 2mm;
      font-weight: bold;
      background: #f0f0f0;
      text-align: center;
    }
    .items-table tfoot td:first-child { text-align: left; }

    /* ---- SIGNATURE / CACHET ---- */
    .signature-row {
      display: flex;
      justify-content: flex-end;
      margin-top: 3mm;
      flex-shrink: 0;
    }
    .signature-block {
      width: 55mm;
      text-align: center;
    }
    .signature-block .sig-label {
      font-weight: bold; color: #2c3e6b;
      margin-bottom: 1.5mm; font-size: 7pt;
    }
    .signature-block .sig-area {
      border: 1px solid #2c3e6b;
      height: 18mm;
      border-radius: 2px;
    }

    /* ---- FOOTER ---- */
    .footer {
      flex-shrink: 0;
      border-top: 1px solid #2c3e6b;
      margin-top: 3mm;
      padding-top: 2mm;
      font-size: 6pt; text-align: center;
      line-height: 1.5; color: #444;
      position: relative;
    }
    .footer .page-num {
      position: absolute; right: 0; bottom: 0;
      font-size: 6pt;
    }
  `;
}

/* ------------------------------------------------------------------ */
/*  Shared fragments                                                   */
/* ------------------------------------------------------------------ */

function logoImgTag(size = 70): string {
  const dataUri = getLogoDataUri();
  if (dataUri) {
    return `<img src="${dataUri}" alt="Logo" style="width:${size}px;height:${size}px;object-fit:contain;" />`;
  }
  return `<div style="width:${size}px;height:${size}px;border:2px solid #2c3e6b;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:16pt;color:#2c3e6b;">GRG</div>`;
}

function footerHtml(): string {
  const conf = companyConfig;
  return `
    <div class="footer">
      Siège social: ${conf.name} - ${conf.address.join(", ")}, Tunisie<br>
      Téléphone: ${conf.tel} - ${conf.web} - ${conf.email}<br>
      Société à responsabilité limitée (SARL) - RC: ${conf.rc} - Matricule fiscal: ${conf.matriculeFiscal}
      <span class="page-num">1 / 1</span>
    </div>
  `;
}

function signatureHtml(): string {
  return `
  <div class="signature-row">
    <div class="signature-block">
      <div class="sig-label">Cachet, Date et Signature</div>
      <div class="sig-area"></div>
    </div>
  </div>`;
}

/* ================================================================== */
/*  1. Fiche d'Expédition from DemandeArticle — delivery style,        */
/*     articles + quantities only, NO prices, NO shipping info         */
/* ================================================================== */

export function generateFicheExpeditionHtmlForDemande(demande: DemandeArticle): string {
  const conf = companyConfig;
  const docNum = generateDocNum(demande.id);
  const dateFr = toFrenchDate(demande.date);

  /* ---- destinataire (chantier) ---- */
  const destNom = demande.chantier ? demande.chantier.nom : "-";
  const destAdresse = demande.chantier ? (demande.chantier.adresse || "") : "";

  /* ---- table rows ---- */
  let totalQty = 0;
  const itemsHtml = (demande.items || []).map(item => {
    const article = item.article;
    const uniteNom = article.unite ? article.unite.nom : "pce";
    const qty = item.quantite;
    totalQty += qty;
    return `
      <tr>
        <td><strong>${article.nom || "-"}</strong> (${uniteNom})</td>
        <td class="center">${qty}</td>
      </tr>`;
  }).join("");

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>${deliveryCss()}</style>
</head>
<body>

  <!-- ===== TOP HEADER ===== -->
  <div class="top-header">
    <div class="logo-area">
      ${logoImgTag(85)}
      <span class="label">Expéditeur</span>
    </div>
    <div class="title-area">
      <div class="doc-title">Fiche d'Expédition N°${docNum}</div>
      <div class="meta">
        Date : ${dateFr}
      </div>
    </div>
  </div>

  <!-- ===== EXPÉDITEUR + DESTINATAIRE ===== -->
  <div class="info-row">
    <div class="info-box expediteur">
      <div class="box-label">Expéditeur</div>
      <div class="company-name">${conf.name}</div>
      ${conf.address.join("<br>")}<br><br>
      Tél.: ${conf.tel}<br>
      Email: ${conf.email}<br>
      Web: ${conf.web}
    </div>
    <div class="info-box">
      <div class="box-label">Destinataire</div>
      <strong>${destNom}</strong><br>
      ${destAdresse}
    </div>
  </div>

  <!-- ===== TABLE (flex-grow to fill page) ===== -->
  <div class="table-wrapper">
    <table class="items-table">
      <thead>
        <tr>
          <th style="width:65%">Désignation</th>
          <th style="width:35%">Quantité</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
        <tr class="spacer-row"><td></td><td></td></tr>
      </tbody>
      <tfoot>
        <tr>
          <td style="text-align:left">Total</td>
          <td>${totalQty}</td>
        </tr>
      </tfoot>
    </table>
  </div>

  <!-- ===== SIGNATURE / CACHET ===== -->
  ${signatureHtml()}

  <!-- ===== FOOTER ===== -->
  ${footerHtml()}

</body></html>`;
}

/* ================================================================== */
/*  2. Fiche d'Expédition from Sortie (interne) — delivery style,      */
/*     with shipping info, destinataire = chantier or depot             */
/* ================================================================== */

export function generateFicheExpeditionHtmlForSortie(sortie: Sortie): string {
  const conf = companyConfig;
  const docNum = generateDocNum(sortie.id);
  const dateFr = toFrenchDate(sortie.date);

  /* ---- destinataire (chantier OR depot) ---- */
  let destNom = "-";
  let destAdresse = "";

  if (sortie.typeSortie === "interne_chantier" && sortie.chantier) {
    destNom = sortie.chantier.nom;
    destAdresse = sortie.chantier.adresse || "";
  } else if (sortie.typeSortie === "interne_depot" && sortie.depot) {
    destNom = sortie.depot.nom;
    destAdresse = sortie.depot.adresse || "";
  }

  /* ---- table rows ---- */
  let totalQty = 0;
  const itemsHtml = (sortie.articleSorties || [])
    .map((line) => {
      const article = line.article;
      const uniteNom = article.unite ? article.unite.nom : "pce";
      const qty = Number(line.stockSortie);
      totalQty += qty;
      return `
      <tr>
        <td><strong>${article.nom || "-"}</strong> (${uniteNom})</td>
        <td></td>
        <td class="center">${qty}</td>
        <td class="center">${qty}</td>
      </tr>`;
    })
    .join("");

  /* ---- shipping section (always present for sortie interne) ---- */
  let shippingLines = "";

  if (sortie.typeSortie === "interne_chantier") {
    shippingLines = `
      <strong>Méthode d'expédition:</strong> Nos propres moyens<br>
      <strong>Transporteur:</strong> ${sortie.nomTransporteurChantier || "-"}<br>
      <strong>Matricule voiture:</strong> ${sortie.matriculeTransporteurChantier || "-"}`;
  } else if (sortie.typeSortie === "interne_depot") {
    shippingLines = `
      <strong>Méthode d'expédition:</strong> Nos propres moyens<br>
      <strong>Transporteur:</strong> ${sortie.nomTransporteurDepot || "-"}<br>
      <strong>Matricule voiture:</strong> ${sortie.matriculeTransporteurDepot || "-"}`;
  }

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>${deliveryCss()}</style>
</head>
<body>

  <!-- ===== TOP HEADER ===== -->
  <div class="top-header">
    <div class="logo-area">
      ${logoImgTag(85)}
      <span class="label">Expéditeur</span>
    </div>
    <div class="title-area">
      <div class="doc-title">Fiche d'Expédition N°${docNum}</div>
      <div class="meta">
        Date : ${dateFr}
      </div>
    </div>
  </div>

  <!-- ===== EXPÉDITEUR + DESTINATAIRE ===== -->
  <div class="info-row">
    <div class="info-box expediteur">
      <div class="box-label">Expéditeur</div>
      <div class="company-name">${conf.name}</div>
      ${conf.address.join("<br>")}<br><br>
      Tél.: ${conf.tel}<br>
      Email: ${conf.email}<br>
      Web: ${conf.web}
    </div>
    <div class="info-box">
      <div class="box-label">Destinataire</div>
      <strong>${destNom}</strong><br>
      ${destAdresse}
    </div>
  </div>

  <!-- ===== SHIPPING INFO ===== -->
  <div class="shipping-info">
    ${shippingLines}
  </div>

  <!-- ===== TABLE (flex-grow to fill page) ===== -->
  <div class="table-wrapper">
    <table class="items-table">
      <thead>
        <tr>
          <th style="width:50%">Désignation</th>
          <th style="width:15%">Poids/vol.</th>
          <th style="width:17%">Qté commandée</th>
          <th style="width:18%">Qté. à expédier</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
        <tr class="spacer-row"><td></td><td></td><td></td><td></td></tr>
      </tbody>
      <tfoot>
        <tr>
          <td style="text-align:left">Total</td>
          <td></td>
          <td>${totalQty}</td>
          <td>${totalQty}</td>
        </tr>
      </tfoot>
    </table>
  </div>

  <!-- ===== SIGNATURE / CACHET ===== -->
  ${signatureHtml()}

  <!-- ===== FOOTER ===== -->
  ${footerHtml()}

</body></html>`;
}


/* ================================================================== */
/*  3. Bon de Livraison (BL) from Sortie (externe) — delivery layout   */
/*     destinataire = enterprise + address + matricule fiscal           */
/* ================================================================== */

export function generateBLHtmlForSortie(sortie: Sortie): string {
  const conf = companyConfig;
  const docNum = generateDocNum(sortie.id);
  const dateFr = toFrenchDate(sortie.date);

  /* ---- destinataire (enterprise info for external clients) ---- */
  const destNom = sortie.nomEntreprise || "-";
  const destAdresse = sortie.adresseEntreprise || "";
  const destMatricule = sortie.matriculeFiscalEntreprise || "";

  /* ---- table rows ---- */
  let totalQty = 0;
  const itemsHtml = (sortie.articleSorties || [])
    .map((line) => {
      const article = line.article;
      const uniteNom = article.unite ? article.unite.nom : "pce";
      const qty = Number(line.stockSortie);
      totalQty += qty;
      return `
      <tr>
        <td><strong>${article.nom || "-"}</strong> (${uniteNom})</td>
        <td></td>
        <td class="center">${qty}</td>
        <td class="center">${qty}</td>
      </tr>`;
    })
    .join("");

  /* ---- shipping section ---- */
  let shippingLines = "";

  if (sortie.sousTypeSortieExterne === "avec_transporteur") {
    /* Client sent their own transporter */
    shippingLines = `
      <strong>Méthode d'expédition:</strong> Client<br>
      <strong>Transporteur:</strong> ${sortie.nomTransporteurExterne || "-"}<br>
      <strong>Matricule voiture:</strong> ${sortie.matriculeTransporteurExterne || "-"}`;
  } else if (sortie.sousTypeSortieExterne === "sans_transporteur") {
    /* Client picks up in person */
    shippingLines = `
      <strong>Méthode d'expédition:</strong> Client<br>
      <strong>Nom du client:</strong> ${sortie.nomClient || destNom}`;
  }

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>${deliveryCss()}</style>
</head>
<body>

  <!-- ===== TOP HEADER ===== -->
  <div class="top-header">
    <div class="logo-area">
      ${logoImgTag(85)}
      <span class="label">Expéditeur</span>
    </div>
    <div class="title-area">
      <div class="doc-title">Bon De Livraison N°${docNum}</div>
      <div class="meta">
        Date : ${dateFr}
      </div>
    </div>
  </div>

  <!-- ===== EXPÉDITEUR + DESTINATAIRE ===== -->
  <div class="info-row">
    <div class="info-box expediteur">
      <div class="box-label">Expéditeur</div>
      <div class="company-name">${conf.name}</div>
      ${conf.address.join("<br>")}<br><br>
      Tél.: ${conf.tel}<br>
      Email: ${conf.email}<br>
      Web: ${conf.web}
    </div>
    <div class="info-box">
      <div class="box-label">Destinataire</div>
      <strong>${destNom}</strong><br>
      ${destAdresse}${destMatricule ? `<br>Matricule fiscal: ${destMatricule}` : ""}
    </div>
  </div>

  <!-- ===== SHIPPING INFO ===== -->
  <div class="shipping-info">
    ${shippingLines}
  </div>

  <!-- ===== TABLE (flex-grow to fill page) ===== -->
  <div class="table-wrapper">
    <table class="items-table">
      <thead>
        <tr>
          <th style="width:50%">Désignation</th>
          <th style="width:15%">Poids/vol.</th>
          <th style="width:17%">Qté commandée</th>
          <th style="width:18%">Qté. à expédier</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
        <tr class="spacer-row"><td></td><td></td><td></td><td></td></tr>
      </tbody>
      <tfoot>
        <tr>
          <td style="text-align:left">Total</td>
          <td></td>
          <td>${totalQty}</td>
          <td>${totalQty}</td>
        </tr>
      </tfoot>
    </table>
  </div>

  <!-- ===== SIGNATURE / CACHET ===== -->
  ${signatureHtml()}

  <!-- ===== FOOTER ===== -->
  ${footerHtml()}

</body></html>`;
}


/* ================================================================== */
/*  4. Bon de Retour (BR) from RetourArticle — same delivery style     */
/* ================================================================== */

export function generateBonDeRetourHtml(retour: RetourArticle): string {
  const conf = companyConfig;
  const docNum = generateDocNum(retour.id);
  const dateFr = toFrenchDate(retour.date);

  /* ---- client info ---- */
  const clientNom = retour.chantier ? retour.chantier.nom : "-";
  const clientAdresse = retour.chantier ? (retour.chantier.adresse || "") : "";
  const clientResp = (retour.chantier as any)?.compte
    ? `Responsable: ${(retour.chantier as any).compte.prenom} ${(retour.chantier as any).compte.nom}`
    : "";

  /* ---- table rows ---- */
  let totalQty = 0;
  const itemsHtml = (retour.items || []).map(item => {
    const article = item.article;
    const uniteNom = article.unite ? (article.unite as any).nom : "pce";
    const qty = item.quantite;
    totalQty += qty;
    return `
      <tr>
        <td><strong>${article.nom || "-"}</strong> (${uniteNom})</td>
        <td class="center">${qty}</td>
        <td>${item.reason || "-"}</td>
      </tr>`;
  }).join("");

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>${deliveryCss()}</style>
</head>
<body>

  <!-- ===== TOP HEADER ===== -->
  <div class="top-header">
    <div class="logo-area">
      ${logoImgTag(85)}
    </div>
    <div class="title-area">
      <div class="doc-title" style="color:#b91c1c">Bon De Retour N°${docNum}</div>
      <div class="meta">
        Date : ${dateFr}
      </div>
    </div>
  </div>

  <!-- ===== EXPÉDITEUR + DESTINATAIRE ===== -->
  <div class="info-row">
    <div class="info-box expediteur">
      <div class="box-label">Société</div>
      <div class="company-name">${conf.name}</div>
      ${conf.address.join("<br>")}<br><br>
      Tél.: ${conf.tel}<br>
      Email: ${conf.email}<br>
      Web: ${conf.web}
    </div>
    <div class="info-box">
      <div class="box-label">Client / Chantier</div>
      <strong>${clientNom}</strong><br>
      ${clientAdresse}<br>
      ${clientResp}
    </div>
  </div>

  <!-- ===== TABLE (flex-grow to fill page) ===== -->
  <div class="table-wrapper">
    <table class="items-table">
      <thead>
        <tr>
          <th style="width:45%">Désignation</th>
          <th style="width:20%">Qté à retourner</th>
          <th style="width:35%">Motif de retour</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
        <tr class="spacer-row"><td></td><td></td><td></td></tr>
      </tbody>
      <tfoot>
        <tr>
          <td style="text-align:left">Total</td>
          <td>${totalQty}</td>
          <td></td>
        </tr>
      </tfoot>
    </table>
  </div>

  <!-- ===== SIGNATURE / CACHET ===== -->
  ${signatureHtml()}

  <!-- ===== FOOTER ===== -->
  ${footerHtml()}

</body></html>`;
}
