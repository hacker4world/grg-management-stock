import { Request, Response } from "express";
import {
  articlesRepositoy,
  categoryRepository,
  chantierRepository,
  compteRepository,
  demandeArticlesRepository,
  depotRepository,
  entreeRepository,
  fabriquantRepository,
  familleRepository,
  fournisseurRepository,
  retourRepository,
  sortieRepository,
  sousFamillesRepository,
  stockNotificationRepository,
  uniteRepository,
} from "../repository/repositories";
import { In, Raw } from "typeorm";
import { Article } from "../entity/Article";

const ExcelJS = require("exceljs");

/* ------------------------------------------------------------------ */
/*  Shared helpers                                                      */
/* ------------------------------------------------------------------ */

function translateStatus(status: string): string {
  switch (status) {
    case "confirmed":
      return "Confirmé";
    case "denied":
      return "Refusé";
    case "pending":
    default:
      return "En Attente";
  }
}

function translateTypeSortie(type: string): string {
  switch (type) {
    case "interne_chantier":
      return "Interne Chantier";
    case "interne_depot":
      return "Interne Dépôt";
    case "externe":
      return "Externe";
    default:
      return type;
  }
}

function buildDateWhereClause(
  baseWhere: any,
  dateFrom?: string,
  dateTo?: string,
): any {
  if (dateFrom && dateTo) {
    baseWhere.date = Raw((alias) => `${alias} BETWEEN :from AND :to`, {
      from: dateFrom,
      to: dateTo,
    });
  } else if (dateFrom) {
    baseWhere.date = Raw((alias) => `${alias} >= :from`, { from: dateFrom });
  } else if (dateTo) {
    baseWhere.date = Raw((alias) => `${alias} <= :to`, { to: dateTo });
  }
  return baseWhere;
}

/* ------------------------------------------------------------------ */
/*  Export Service                                                      */
/* ------------------------------------------------------------------ */

export class ExportService {
  /* ---- Style helpers ---- */

  private styleHeaderRow(worksheet: any) {
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1a1a2e" },
    };
    headerRow.alignment = { horizontal: "center", vertical: "middle" };
    headerRow.height = 22;
  }

  private async sendExcelResponse(
    response: Response,
    workbook: any,
    fileName: string,
  ) {
    response.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    response.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
    );

    await workbook.xlsx.write(response);
    response.end();
  }

  /* ================================================================ */
  /*  EXPORT ARTICLES                                                  */
  /* ================================================================ */
  public async exportArticles(request: Request, response: Response) {
    try {
      const { articleList } = request.body;

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Articles");

      worksheet.columns = [
        { header: "ID", key: "id", width: 10 },
        { header: "Nom", key: "nom", width: 15 },
        { header: "Stock minimum", key: "stockMinimum", width: 10 },
        { header: "Stock actuel", key: "stockActuel", width: 10 },
        { header: "Prix moyenne", key: "prixMoyenne", width: 10 },
        { header: "Dépot", key: "depot", width: 10 },
        { header: "Unité", key: "unite", width: 10 },
        { header: "Catégorie", key: "categorie", width: 15 },
      ];
      this.styleHeaderRow(worksheet);

      let articlesToExport = [];

      if (articleList?.length > 0) articlesToExport = articleList;
      else {
        articlesToExport = await articlesRepositoy.find({
          relations: ["depot", "unite", "categorie"],
        });
      }

      articlesToExport.forEach((article) =>
        worksheet.addRow({
          ...article,
          depot: article.depot?.nom,
          unite: article.unite?.nom,
          categorie: article.categorie?.nom,
        }),
      );

      await this.sendExcelResponse(response, workbook, "articles.xlsx");
    } catch (error) {
      console.error("Export articles error:", error);
      if (!response.headersSent) {
        response.status(500).json({ message: "Erreur lors de l'export des articles" });
      }
    }
  }

  /* ================================================================ */
  /*  EXPORT FOURNISSEURS                                              */
  /* ================================================================ */
  public async exportFournisseurs(request: Request, response: Response) {
    try {
      const { fournisseurList } = request.body;

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Fournisseurs");

      worksheet.columns = [
        { header: "Code", key: "code", width: 10 },
        { header: "Nom", key: "nom", width: 20 },
        { header: "Contact", key: "contact", width: 20 },
        { header: "Adresse", key: "adresse", width: 30 },
      ];
      this.styleHeaderRow(worksheet);

      let dataToExport = [];
      if (fournisseurList?.length > 0) {
        dataToExport = fournisseurList;
      } else {
        dataToExport = await fournisseurRepository.find();
      }

      dataToExport.forEach((item) => worksheet.addRow(item));

      await this.sendExcelResponse(response, workbook, "fournisseurs.xlsx");
    } catch (error) {
      console.error("Export fournisseurs error:", error);
      if (!response.headersSent) {
        response.status(500).json({ message: "Erreur lors de l'export des fournisseurs" });
      }
    }
  }

  /* ================================================================ */
  /*  EXPORT FABRIQUANTS                                               */
  /* ================================================================ */
  public async exportFabriquants(request: Request, response: Response) {
    try {
      const { fabriquantList } = request.body;
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Fabriquants");

      worksheet.columns = [
        { header: "Code", key: "code", width: 10 },
        { header: "Nom", key: "nom", width: 20 },
        { header: "Adresse", key: "adresse", width: 30 },
        { header: "Contact", key: "contact", width: 20 },
      ];
      this.styleHeaderRow(worksheet);

      let dataToExport = [];
      if (fabriquantList?.length > 0) {
        dataToExport = fabriquantList;
      } else {
        dataToExport = await fabriquantRepository.find();
      }

      dataToExport.forEach((item) => worksheet.addRow(item));

      await this.sendExcelResponse(response, workbook, "fabriquants.xlsx");
    } catch (error) {
      console.error("Export fabriquants error:", error);
      if (!response.headersSent) {
        response.status(500).json({ message: "Erreur lors de l'export des fabriquants" });
      }
    }
  }

  /* ================================================================ */
  /*  EXPORT CHANTIERS                                                 */
  /* ================================================================ */
  public async exportChantiers(request: Request, response: Response) {
    try {
      const { chantierList } = request.body;
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Chantiers");

      worksheet.columns = [
        { header: "Code", key: "code", width: 10 },
        { header: "Nom", key: "nom", width: 20 },
        { header: "Adresse", key: "adresse", width: 30 },
        { header: "Compte", key: "compte", width: 20 },
      ];
      this.styleHeaderRow(worksheet);

      let dataToExport = [];
      if (chantierList?.length > 0) {
        dataToExport = chantierList;
      } else {
        dataToExport = await chantierRepository.find({
          relations: ["compte"],
        });
      }

      dataToExport.forEach((chantier) =>
        worksheet.addRow({
          ...chantier,
          compte: chantier.compte?.nom_utilisateur,
        }),
      );

      await this.sendExcelResponse(response, workbook, "chantiers.xlsx");
    } catch (error) {
      console.error("Export chantiers error:", error);
      if (!response.headersSent) {
        response.status(500).json({ message: "Erreur lors de l'export des chantiers" });
      }
    }
  }

  /* ================================================================ */
  /*  EXPORT FAMILLES                                                  */
  /* ================================================================ */
  public async exportFamilles(request: Request, response: Response) {
    try {
      const { familleList } = request.body;
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Familles");

      worksheet.columns = [
        { header: "ID", key: "id", width: 10 },
        { header: "Nom", key: "nom", width: 25 },
      ];
      this.styleHeaderRow(worksheet);

      let dataToExport = [];
      if (familleList?.length > 0) {
        dataToExport = familleList;
      } else {
        dataToExport = await familleRepository.find();
      }

      dataToExport.forEach((item) => worksheet.addRow(item));
      await this.sendExcelResponse(response, workbook, "familles.xlsx");
    } catch (error) {
      console.error("Export familles error:", error);
      if (!response.headersSent) {
        response.status(500).json({ message: "Erreur lors de l'export des familles" });
      }
    }
  }

  /* ================================================================ */
  /*  EXPORT SOUS-FAMILLES  (BUG FIX: was using familleRepository)     */
  /* ================================================================ */
  public async exportSousFamilles(request: Request, response: Response) {
    try {
      const { sousFamilleList } = request.body;
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sous Familles");

      worksheet.columns = [
        { header: "ID", key: "id", width: 10 },
        { header: "Nom", key: "nom", width: 25 },
        { header: "Famille", key: "famille", width: 25 },
      ];
      this.styleHeaderRow(worksheet);

      let dataToExport = [];
      if (sousFamilleList?.length > 0) {
        dataToExport = sousFamilleList;
      } else {
        dataToExport = await sousFamillesRepository.find({
          relations: ["famille"],
        });
      }

      dataToExport.forEach((item) =>
        worksheet.addRow({
          ...item,
          famille: item.famille?.nom,
        }),
      );

      await this.sendExcelResponse(response, workbook, "sous_familles.xlsx");
    } catch (error) {
      console.error("Export sous-familles error:", error);
      if (!response.headersSent) {
        response.status(500).json({ message: "Erreur lors de l'export des sous-familles" });
      }
    }
  }

  /* ================================================================ */
  /*  EXPORT CATEGORIES  (BUG FIX: was using chantierRepository)       */
  /* ================================================================ */
  public async exportCategories(request: Request, response: Response) {
    try {
      const { categorieList } = request.body;
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Categories");

      worksheet.columns = [
        { header: "ID", key: "id", width: 10 },
        { header: "Nom", key: "nom", width: 25 },
        { header: "Sous Famille", key: "sous_famille", width: 25 },
      ];
      this.styleHeaderRow(worksheet);

      let dataToExport = [];
      if (categorieList?.length > 0) {
        dataToExport = categorieList;
      } else {
        dataToExport = await categoryRepository.find({
          relations: ["sous_famille"],
        });
      }

      dataToExport.forEach((item) =>
        worksheet.addRow({
          ...item,
          sous_famille: item.sous_famille?.nom,
        }),
      );

      await this.sendExcelResponse(response, workbook, "categories.xlsx");
    } catch (error) {
      console.error("Export categories error:", error);
      if (!response.headersSent) {
        response.status(500).json({ message: "Erreur lors de l'export des catégories" });
      }
    }
  }

  /* ================================================================ */
  /*  EXPORT ENTREES  (REWRITTEN — with entreeArticleItems details)    */
  /* ================================================================ */
  public async exportEntrees(request: Request, response: Response) {
    try {
      const { entreeList, confirme, dateFrom, dateTo } = request.body;
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Entrées");

      worksheet.columns = [
        { header: "Entrée ID", key: "entreeId", width: 12 },
        { header: "Date", key: "date", width: 15 },
        { header: "Status", key: "status", width: 15 },
        { header: "Article", key: "article", width: 25 },
        { header: "Quantité", key: "stockEntree", width: 15 },
        { header: "Prix", key: "prix", width: 12 },
        { header: "Fournisseur", key: "fournisseur", width: 20 },
        { header: "Fabriquant", key: "fabriquant", width: 20 },
        { header: "Utilisateur", key: "compte", width: 20 },
        { header: "Observation", key: "observation", width: 30 },
      ];
      this.styleHeaderRow(worksheet);

      let dataToExport = [];
      if (entreeList?.length > 0) {
        dataToExport = entreeList;
      } else {
        const where: any = {
          status: confirme ? "confirmed" : "pending",
        };
        buildDateWhereClause(where, dateFrom, dateTo);

        dataToExport = await entreeRepository.find({
          relations: [
            "fournisseur",
            "fabriquant",
            "compte",
            "entreeArticleItems",
            "entreeArticleItems.article",
          ],
          where,
          order: { date: "DESC" },
        });
      }

      for (const entree of dataToExport) {
        const baseRow = {
          entreeId: entree.id,
          date: entree.date,
          status: translateStatus(entree.status),
          fournisseur: entree.fournisseur?.nom || "-",
          fabriquant: entree.fabriquant?.nom || "-",
          compte: entree.compte?.nom_utilisateur || "-",
          observation: entree.observation || "",
        };

        const items = entree.entreeArticleItems || [];
        if (items.length === 0) {
          worksheet.addRow({
            ...baseRow,
            article: "-",
            stockEntree: 0,
            prix: 0,
          });
        } else {
          for (const item of items) {
            worksheet.addRow({
              ...baseRow,
              article: item.article?.nom || "-",
              stockEntree: Number(item.stockEntree),
              prix: Number(item.prix),
            });
          }
        }
      }

      await this.sendExcelResponse(response, workbook, "entrees.xlsx");
    } catch (error) {
      console.error("Export entrees error:", error);
      if (!response.headersSent) {
        response.status(500).json({ message: "Erreur lors de l'export des entrées" });
      }
    }
  }

  /* ================================================================ */
  /*  EXPORT SORTIES  (REWRITTEN — full attributes + article items)    */
  /* ================================================================ */
  public async exportSorties(request: Request, response: Response) {
    try {
      const { sortieList, confirme, dateFrom, dateTo } = request.body;
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sorties");

      worksheet.columns = [
        { header: "Sortie ID", key: "sortieId", width: 12 },
        { header: "Date", key: "date", width: 15 },
        { header: "Type", key: "typeSortie", width: 22 },
        { header: "Status", key: "status", width: 15 },
        { header: "Destinataire", key: "destinataire", width: 25 },
        { header: "Article", key: "article", width: 25 },
        { header: "Quantité", key: "quantite", width: 12 },
        { header: "Transporteur", key: "transporteur", width: 25 },
        { header: "Matricule", key: "matricule", width: 18 },
        { header: "Nom Client", key: "nomClient", width: 22 },
        { header: "Matricule Fiscal", key: "matriculeFiscal", width: 20 },
        { header: "Utilisateur", key: "compte", width: 20 },
        { header: "Observation", key: "observation", width: 30 },
      ];
      this.styleHeaderRow(worksheet);

      let dataToExport = [];
      if (sortieList?.length > 0) {
        dataToExport = sortieList;
      } else {
        const where: any = {
          status: confirme ? "confirmed" : "pending",
        };
        buildDateWhereClause(where, dateFrom, dateTo);

        dataToExport = await sortieRepository.find({
          relations: [
            "chantier",
            "depot",
            "compte",
            "articleSorties",
            "articleSorties.article",
          ],
          where,
          order: { date: "DESC" },
        });
      }

      for (const sortie of dataToExport) {
        let destinataire = "-";
        let transporteur = "-";
        let matricule = "-";

        if (sortie.typeSortie === "interne_chantier") {
          destinataire = sortie.chantier?.nom || "-";
          transporteur = sortie.nomTransporteurChantier || "-";
          matricule = sortie.matriculeTransporteurChantier || "-";
        } else if (sortie.typeSortie === "interne_depot") {
          destinataire = sortie.depot?.nom || "-";
          transporteur = sortie.nomTransporteurDepot || "-";
          matricule = sortie.matriculeTransporteurDepot || "-";
        } else if (sortie.typeSortie === "externe") {
          destinataire = sortie.nomEntreprise || "-";
          transporteur = sortie.nomTransporteurExterne || "-";
          matricule = sortie.matriculeTransporteurExterne || "-";
        }

        const baseRow = {
          sortieId: sortie.id,
          date: sortie.date,
          typeSortie: translateTypeSortie(sortie.typeSortie),
          status: translateStatus(sortie.status),
          destinataire,
          transporteur,
          matricule,
          nomClient: sortie.nomClient || "-",
          matriculeFiscal: sortie.matriculeFiscalEntreprise || "-",
          compte: sortie.compte?.nom_utilisateur || "-",
          observation: sortie.observation || "",
        };

        const items = sortie.articleSorties || [];
        if (items.length === 0) {
          worksheet.addRow({ ...baseRow, article: "-", quantite: 0 });
        } else {
          for (const as of items) {
            worksheet.addRow({
              ...baseRow,
              article: as.article?.nom || "-",
              quantite: Number(as.stockSortie),
            });
          }
        }
      }

      await this.sendExcelResponse(response, workbook, "sorties.xlsx");
    } catch (error) {
      console.error("Export sorties error:", error);
      if (!response.headersSent) {
        response.status(500).json({ message: "Erreur lors de l'export des sorties" });
      }
    }
  }

  /* ================================================================ */
  /*  EXPORT DEMANDES ARTICLES  (REWRITTEN — with item details)        */
  /* ================================================================ */
  public async exportDemandesArticles(request: Request, response: Response) {
    try {
      const { demandeList, dateFrom, dateTo } = request.body;
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Demandes Articles");

      worksheet.columns = [
        { header: "Demande ID", key: "demandeId", width: 12 },
        { header: "Date", key: "date", width: 15 },
        { header: "Chantier", key: "chantier", width: 20 },
        { header: "Status", key: "status", width: 15 },
        { header: "Article", key: "article", width: 25 },
        { header: "Quantité", key: "quantite", width: 12 },
        { header: "Observation", key: "observation", width: 30 },
      ];
      this.styleHeaderRow(worksheet);

      let dataToExport = [];
      if (demandeList?.length > 0) {
        dataToExport = demandeList;
      } else {
        const where: any = {};
        buildDateWhereClause(where, dateFrom, dateTo);

        dataToExport = await demandeArticlesRepository.find({
          relations: ["chantier", "items", "items.article"],
          where,
          order: { date: "DESC" },
        });
      }

      for (const demande of dataToExport) {
        const baseRow = {
          demandeId: demande.id,
          date: demande.date,
          chantier: demande.chantier?.nom || "-",
          status: translateStatus(demande.status),
          observation: demande.observation || "",
        };

        const items = demande.items || [];
        if (items.length === 0) {
          worksheet.addRow({ ...baseRow, article: "-", quantite: 0 });
        } else {
          for (const item of items) {
            worksheet.addRow({
              ...baseRow,
              article: item.article?.nom || "-",
              quantite: item.quantite,
            });
          }
        }
      }

      await this.sendExcelResponse(response, workbook, "demandes_articles.xlsx");
    } catch (error) {
      console.error("Export demandes error:", error);
      if (!response.headersSent) {
        response.status(500).json({ message: "Erreur lors de l'export des demandes" });
      }
    }
  }

  /* ================================================================ */
  /*  EXPORT RETOURS ARTICLES  (REWRITTEN — with item details)         */
  /* ================================================================ */
  public async exportRetoursArticles(request: Request, response: Response) {
    try {
      const { retourList, dateFrom, dateTo } = request.body;
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Retours Articles");

      worksheet.columns = [
        { header: "Retour ID", key: "retourId", width: 12 },
        { header: "Date", key: "date", width: 15 },
        { header: "Chantier", key: "chantier", width: 20 },
        { header: "Status", key: "status", width: 15 },
        { header: "Article", key: "article", width: 25 },
        { header: "Quantité", key: "quantite", width: 12 },
        { header: "Raison", key: "raison", width: 30 },
        { header: "Observation", key: "observation", width: 30 },
      ];
      this.styleHeaderRow(worksheet);

      let dataToExport = [];
      if (retourList?.length > 0) {
        dataToExport = retourList;
      } else {
        const where: any = {};
        buildDateWhereClause(where, dateFrom, dateTo);

        dataToExport = await retourRepository.find({
          relations: ["chantier", "items", "items.article"],
          where,
          order: { date: "DESC" },
        });
      }

      for (const retour of dataToExport) {
        const baseRow = {
          retourId: retour.id,
          date: retour.date,
          chantier: retour.chantier?.nom || "-",
          status: translateStatus(retour.status),
          observation: retour.observation || "",
        };

        const items = retour.items || [];
        if (items.length === 0) {
          worksheet.addRow({
            ...baseRow,
            article: "-",
            quantite: 0,
            raison: "-",
          });
        } else {
          for (const item of items) {
            worksheet.addRow({
              ...baseRow,
              article: item.article?.nom || "-",
              quantite: item.quantite,
              raison: item.reason || "-",
            });
          }
        }
      }

      await this.sendExcelResponse(response, workbook, "retours_articles.xlsx");
    } catch (error) {
      console.error("Export retours error:", error);
      if (!response.headersSent) {
        response.status(500).json({ message: "Erreur lors de l'export des retours" });
      }
    }
  }

  /* ================================================================ */
  /*  EXPORT HISTORIQUE CHANTIER  (NEW — multi-sheet)                   */
  /* ================================================================ */
  public async exportHistoriqueChantier(
    request: Request,
    response: Response,
  ) {
    try {
      const chantierId = Number(request.params.chantierId);
      const { dateFrom, dateTo } = request.body;

      const chantier = await chantierRepository.findOne({
        where: { code: chantierId },
        relations: ["compte"],
      });

      if (!chantier) {
        return response
          .status(404)
          .json({ message: "Chantier introuvable" });
      }

      const workbook = new ExcelJS.Workbook();

      /* -------- Helper: build where with chantier + date range -------- */
      const buildWhere = () => {
        const w: any = { chantier: { code: chantierId } };
        return buildDateWhereClause(w, dateFrom, dateTo);
      };

      /* ================================================================ */
      /*  Sheet 1: Résumé                                                 */
      /* ================================================================ */
      const summarySheet = workbook.addWorksheet("Résumé");

      summarySheet.columns = [
        { header: "Propriété", key: "prop", width: 30 },
        { header: "Valeur", key: "val", width: 40 },
      ];
      this.styleHeaderRow(summarySheet);

      summarySheet.addRow({ prop: "Code Chantier", val: chantier.code });
      summarySheet.addRow({ prop: "Nom", val: chantier.nom });
      summarySheet.addRow({ prop: "Adresse", val: chantier.adresse });
      summarySheet.addRow({
        prop: "Responsable",
        val: chantier.compte?.nom_utilisateur || "-",
      });
      summarySheet.addRow({
        prop: "Date d'export",
        val: new Date().toLocaleDateString("fr-FR"),
      });
      if (dateFrom)
        summarySheet.addRow({ prop: "Période — Du", val: dateFrom });
      if (dateTo)
        summarySheet.addRow({ prop: "Période — Au", val: dateTo });

      /* ================================================================ */
      /*  Sheet 2: Demandes Articles                                      */
      /* ================================================================ */
      const demandes = await demandeArticlesRepository.find({
        where: buildWhere(),
        relations: ["items", "items.article"],
        order: { date: "DESC" },
      });

      const demandesSheet = workbook.addWorksheet("Demandes Articles");
      demandesSheet.columns = [
        { header: "Demande ID", key: "demandeId", width: 12 },
        { header: "Date", key: "date", width: 15 },
        { header: "Status", key: "status", width: 15 },
        { header: "Article", key: "article", width: 25 },
        { header: "Quantité", key: "quantite", width: 12 },
        { header: "Observation", key: "observation", width: 30 },
      ];
      this.styleHeaderRow(demandesSheet);

      for (const d of demandes) {
        const items = d.items || [];
        if (items.length === 0) {
          demandesSheet.addRow({
            demandeId: d.id,
            date: d.date,
            status: translateStatus(d.status),
            article: "-",
            quantite: 0,
            observation: d.observation || "",
          });
        } else {
          for (const item of items) {
            demandesSheet.addRow({
              demandeId: d.id,
              date: d.date,
              status: translateStatus(d.status),
              article: item.article?.nom || "-",
              quantite: item.quantite,
              observation: d.observation || "",
            });
          }
        }
      }

      /* ================================================================ */
      /*  Sheet 3: Retours Articles                                       */
      /* ================================================================ */
      const retours = await retourRepository.find({
        where: buildWhere(),
        relations: ["items", "items.article"],
        order: { date: "DESC" },
      });

      const retoursSheet = workbook.addWorksheet("Retours Articles");
      retoursSheet.columns = [
        { header: "Retour ID", key: "retourId", width: 12 },
        { header: "Date", key: "date", width: 15 },
        { header: "Status", key: "status", width: 15 },
        { header: "Article", key: "article", width: 25 },
        { header: "Quantité", key: "quantite", width: 12 },
        { header: "Raison", key: "raison", width: 30 },
        { header: "Observation", key: "observation", width: 30 },
      ];
      this.styleHeaderRow(retoursSheet);

      for (const r of retours) {
        const items = r.items || [];
        if (items.length === 0) {
          retoursSheet.addRow({
            retourId: r.id,
            date: r.date,
            status: translateStatus(r.status),
            article: "-",
            quantite: 0,
            raison: "-",
            observation: r.observation || "",
          });
        } else {
          for (const item of items) {
            retoursSheet.addRow({
              retourId: r.id,
              date: r.date,
              status: translateStatus(r.status),
              article: item.article?.nom || "-",
              quantite: item.quantite,
              raison: item.reason || "-",
              observation: r.observation || "",
            });
          }
        }
      }

      /* ================================================================ */
      /*  Sheet 4: Sorties (Livraisons vers ce chantier)                  */
      /* ================================================================ */
      const sortieWhere: any = {
        chantier: { code: chantierId },
        typeSortie: "interne_chantier",
      };
      buildDateWhereClause(sortieWhere, dateFrom, dateTo);

      const sorties = await sortieRepository.find({
        where: sortieWhere,
        relations: [
          "articleSorties",
          "articleSorties.article",
          "compte",
        ],
        order: { date: "DESC" },
      });

      const sortiesSheet = workbook.addWorksheet("Sorties (Livraisons)");
      sortiesSheet.columns = [
        { header: "Sortie ID", key: "sortieId", width: 12 },
        { header: "Date", key: "date", width: 15 },
        { header: "Status", key: "status", width: 15 },
        { header: "Article", key: "article", width: 25 },
        { header: "Quantité", key: "quantite", width: 12 },
        { header: "Transporteur", key: "transporteur", width: 25 },
        { header: "Matricule", key: "matricule", width: 18 },
        { header: "Utilisateur", key: "compte", width: 20 },
        { header: "Observation", key: "observation", width: 30 },
      ];
      this.styleHeaderRow(sortiesSheet);

      for (const s of sorties) {
        const baseRow = {
          sortieId: s.id,
          date: s.date,
          status: translateStatus(s.status),
          transporteur: s.nomTransporteurChantier || "-",
          matricule: s.matriculeTransporteurChantier || "-",
          compte: s.compte?.nom_utilisateur || "-",
          observation: s.observation || "",
        };

        const items = s.articleSorties || [];
        if (items.length === 0) {
          sortiesSheet.addRow({ ...baseRow, article: "-", quantite: 0 });
        } else {
          for (const as of items) {
            sortiesSheet.addRow({
              ...baseRow,
              article: as.article?.nom || "-",
              quantite: Number(as.stockSortie),
            });
          }
        }
      }

      /* ================================================================ */
      /*  Sheet 5: Stock Actuel du Chantier                               */
      /* ================================================================ */
      const confirmedSorties = await sortieRepository.find({
        where: { chantier: { code: chantierId }, status: "confirmed" },
        relations: [
          "articleSorties",
          "articleSorties.article",
          "articleSorties.article.unite",
        ],
      });

      const allRetours = await retourRepository.find({
        where: {
          chantier: { code: chantierId },
          status: In(["confirmed", "pending"]),
        },
        relations: ["items", "items.article"],
      });

      const deliveredMap = new Map<
        number,
        { article: Article; delivered: number }
      >();
      for (const sortie of confirmedSorties) {
        for (const as of sortie.articleSorties) {
          const existing = deliveredMap.get(as.article.id);
          if (existing) {
            existing.delivered += Number(as.stockSortie);
          } else {
            deliveredMap.set(as.article.id, {
              article: as.article,
              delivered: Number(as.stockSortie),
            });
          }
        }
      }

      const confirmedReturnMap = new Map<number, number>();
      const pendingReturnMap = new Map<number, number>();
      for (const retour of allRetours) {
        const targetMap =
          retour.status === "confirmed"
            ? confirmedReturnMap
            : pendingReturnMap;
        for (const item of retour.items) {
          const prev = targetMap.get(item.article.id) || 0;
          targetMap.set(item.article.id, prev + Number(item.quantite));
        }
      }

      const stockSheet = workbook.addWorksheet("Stock Actuel");
      stockSheet.columns = [
        { header: "Article", key: "article", width: 25 },
        { header: "Unité", key: "unite", width: 12 },
        { header: "Total Livré", key: "totalLivre", width: 15 },
        { header: "Total Retourné", key: "totalRetourne", width: 15 },
        { header: "En Attente Retour", key: "enAttente", width: 18 },
        { header: "Disponible", key: "disponible", width: 15 },
      ];
      this.styleHeaderRow(stockSheet);

      for (const [articleId, { article, delivered }] of deliveredMap) {
        const confirmed = confirmedReturnMap.get(articleId) || 0;
        const pending = pendingReturnMap.get(articleId) || 0;
        const available = delivered - confirmed - pending;

        stockSheet.addRow({
          article: article.nom,
          unite: (article as any).unite?.nom || "-",
          totalLivre: delivered,
          totalRetourne: confirmed,
          enAttente: pending,
          disponible: available,
        });
      }

      /* ---- Update summary with counts ---- */
      summarySheet.addRow({});
      summarySheet.addRow({
        prop: "Total Demandes",
        val: demandes.length,
      });
      summarySheet.addRow({
        prop: "Demandes Confirmées",
        val: demandes.filter((d) => d.status === "confirmed").length,
      });
      summarySheet.addRow({
        prop: "Demandes Refusées",
        val: demandes.filter((d) => d.status === "denied").length,
      });
      summarySheet.addRow({
        prop: "Demandes En Attente",
        val: demandes.filter((d) => d.status === "pending").length,
      });
      summarySheet.addRow({});
      summarySheet.addRow({
        prop: "Total Retours",
        val: retours.length,
      });
      summarySheet.addRow({
        prop: "Retours Confirmés",
        val: retours.filter((r) => r.status === "confirmed").length,
      });
      summarySheet.addRow({
        prop: "Retours Refusés",
        val: retours.filter((r) => r.status === "denied").length,
      });
      summarySheet.addRow({
        prop: "Retours En Attente",
        val: retours.filter((r) => r.status === "pending").length,
      });
      summarySheet.addRow({});
      summarySheet.addRow({
        prop: "Total Sorties (Livraisons)",
        val: sorties.length,
      });
      summarySheet.addRow({
        prop: "Sorties Confirmées",
        val: sorties.filter((s) => s.status === "confirmed").length,
      });

      const fileName = `historique_chantier_${chantier.code}.xlsx`;
      await this.sendExcelResponse(response, workbook, fileName);
    } catch (error) {
      console.error("Export historique chantier error:", error);
      if (!response.headersSent) {
        response.status(500).json({ message: "Erreur lors de l'export de l'historique chantier" });
      }
    }
  }

  /* ================================================================ */
  /*  EXPORT NOTIFICATIONS                                             */
  /* ================================================================ */
  public async exportNotifications(request: Request, response: Response) {
    try {
      const { notificationList } = request.body;
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Notifications");

      worksheet.columns = [
        { header: "ID", key: "id", width: 10 },
        { header: "Type", key: "type", width: 15 },
        { header: "Message", key: "message", width: 40 },
        { header: "Article", key: "article", width: 20 },
        { header: "Stock Actuel", key: "stockActuel", width: 15 },
        { header: "Stock Minimum", key: "stockMinimum", width: 15 },
        { header: "Lue", key: "isRead", width: 10 },
        { header: "Date", key: "createdAt", width: 20 },
      ];
      this.styleHeaderRow(worksheet);

      let dataToExport = [];
      if (notificationList?.length > 0) {
        dataToExport = notificationList;
      } else {
        dataToExport = await stockNotificationRepository.find({
          relations: ["article"],
        });
      }

      dataToExport.forEach((item) =>
        worksheet.addRow({
          ...item,
          article: item.article?.nom,
        }),
      );

      await this.sendExcelResponse(response, workbook, "notifications.xlsx");
    } catch (error) {
      console.error("Export notifications error:", error);
      if (!response.headersSent) {
        response.status(500).json({ message: "Erreur lors de l'export des notifications" });
      }
    }
  }

  /* ================================================================ */
  /*  EXPORT UNITES                                                    */
  /* ================================================================ */
  public async exportUnites(request: Request, response: Response) {
    try {
      const { uniteList } = request.body;
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Unités");

      worksheet.columns = [
        { header: "ID", key: "id", width: 10 },
        { header: "Nom", key: "nom", width: 25 },
      ];
      this.styleHeaderRow(worksheet);

      let dataToExport = [];
      if (uniteList?.length > 0) {
        dataToExport = uniteList;
      } else {
        dataToExport = await uniteRepository.find();
      }

      dataToExport.forEach((item) => worksheet.addRow(item));
      await this.sendExcelResponse(response, workbook, "unites.xlsx");
    } catch (error) {
      console.error("Export unites error:", error);
      if (!response.headersSent) {
        response.status(500).json({ message: "Erreur lors de l'export des unités" });
      }
    }
  }

  /* ================================================================ */
  /*  EXPORT DEPOTS                                                    */
  /* ================================================================ */
  public async exportDepots(request: Request, response: Response) {
    try {
      const { depotList } = request.body;
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Dépots");

      worksheet.columns = [
        { header: "ID", key: "id", width: 10 },
        { header: "Nom", key: "nom", width: 25 },
        { header: "Adresse", key: "adresse", width: 30 },
      ];
      this.styleHeaderRow(worksheet);

      let dataToExport = [];
      if (depotList?.length > 0) {
        dataToExport = depotList;
      } else {
        dataToExport = await depotRepository.find();
      }

      dataToExport.forEach((item) => worksheet.addRow(item));
      await this.sendExcelResponse(response, workbook, "depots.xlsx");
    } catch (error) {
      console.error("Export depots error:", error);
      if (!response.headersSent) {
        response.status(500).json({ message: "Erreur lors de l'export des dépôts" });
      }
    }
  }

  /* ================================================================ */
  /*  EXPORT COMPTES                                                   */
  /* ================================================================ */
  public async exportComptes(request: Request, response: Response) {
    try {
      const { compteList, confirme } = request.body;
      const workbook = new ExcelJS.Workbook();
      const sheetName = confirme
        ? "Comptes Confirmés"
        : "Comptes Non Confirmés";
      const worksheet = workbook.addWorksheet(sheetName);

      worksheet.columns = [
        { header: "ID", key: "id", width: 10 },
        { header: "Nom", key: "nom", width: 20 },
        { header: "Prénom", key: "prenom", width: 20 },
        { header: "Nom d'utilisateur", key: "nom_utilisateur", width: 25 },
        { header: "Rôle", key: "role", width: 15 },
        { header: "Confirmé", key: "confirme", width: 10 },
      ];
      this.styleHeaderRow(worksheet);

      let dataToExport = [];
      if (compteList?.length > 0) {
        dataToExport = compteList;
      } else {
        dataToExport = await compteRepository.find({
          where: { confirme: confirme ?? false },
        });
      }

      dataToExport.forEach((item) => worksheet.addRow(item));

      const fileName = confirme
        ? "comptes_confirmes.xlsx"
        : "comptes_non_confirmes.xlsx";
      await this.sendExcelResponse(response, workbook, fileName);
    } catch (error) {
      console.error("Export comptes error:", error);
      if (!response.headersSent) {
        response.status(500).json({ message: "Erreur lors de l'export des comptes" });
      }
    }
  }
}
