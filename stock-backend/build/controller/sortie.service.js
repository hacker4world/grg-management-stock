"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SortieService = void 0;
const repositories_1 = require("../repository/repositories");
const typeorm_1 = require("typeorm");
const role_enum_1 = require("../enums/role.enum");
const notification_util_1 = require("../utilities/notification.util");
const pdf_util_1 = require("../utilities/pdf.util");
class SortieService {
    /**
     * Create a new sortie with type-specific validation and field handling
     */
    async createSortie(req, res) {
        try {
            const dto = req.body;
            // ============ VALIDATE COMPTE ============
            const compte = await repositories_1.compteRepository.findOneBy({
                id: dto.compteId,
            });
            if (!compte) {
                return res.status(400).json({
                    message: "Compte introuvable",
                });
            }
            const allowedRoles = [role_enum_1.Role.ADMIN, role_enum_1.Role.ADMIN1, role_enum_1.Role.MAGAZINIER];
            if (!allowedRoles.includes(compte.role)) {
                return res.status(400).json({
                    message: "Le compte doit être un admin ou un magazinier",
                });
            }
            // ============ BUILD SORTIE BASED ON TYPE ============
            const sortie = await this.buildSortieByType(dto, compte, res);
            if (!sortie)
                return; // Error already sent
            await repositories_1.sortieRepository.save(sortie);
            // ============ CREATE ARTICLE LINES ============
            const lines = [];
            for (const l of dto.articles) {
                const article = await repositories_1.articlesRepositoy.findOneBy({ id: l.articleId });
                if (!article) {
                    return res
                        .status(404)
                        .json({ message: `Article ${l.articleId} inconnu` });
                }
                lines.push(repositories_1.articleSortieRepository.create({
                    sortie,
                    article,
                    stockSortie: l.stockSortie,
                }));
            }
            await repositories_1.articleSortieRepository.save(lines);
            // ============ RELOAD WITH RELATIONS ============
            const fresh = await repositories_1.sortieRepository.findOne({
                where: { id: sortie.id },
                relations: {
                    chantier: true,
                    depot: true,
                    compte: true,
                    articleSorties: { article: true },
                },
            });
            return res.status(201).json({
                message: "Sortie créée",
                sortie: fresh,
            });
        }
        catch (error) {
            console.error("🔴 createSortie error:", error?.message || error);
            if (error?.stack)
                console.error(error.stack);
            return res.status(500).json({
                message: "Erreur lors de la création de la sortie",
                detail: error?.message,
            });
        }
    }
    async buildSortieByType(dto, compte, res) {
        const baseFields = {
            date: new Date().toISOString().slice(0, 10),
            observation: dto.observation || null,
            status: "pending",
            compte,
        };
        // ============ SORTIE INTERNE DEPOT ============
        if (dto.typeSortie === "interne_depot") {
            const depot = await repositories_1.depotRepository.findOneBy({
                id: dto.depotId,
            });
            if (!depot) {
                res.status(404).json({ message: "Dépôt introuvable" });
                return null;
            }
            return repositories_1.sortieRepository.create({
                ...baseFields,
                typeSortie: "interne_depot",
                depot,
                nomTransporteurDepot: dto.nomTransporteur,
                matriculeTransporteurDepot: dto.matriculeTransporteur,
                chantier: null,
                sousTypeSortieExterne: null,
                nomEntreprise: null,
                adresseEntreprise: null,
                matriculeFiscalEntreprise: null,
                nomClient: null,
                nomTransporteurExterne: null,
                matriculeTransporteurExterne: null,
            });
        }
        if (dto.typeSortie === "interne_chantier") {
            const chantier = await repositories_1.chantierRepository.findOneBy({
                code: dto.chantierId,
            });
            if (!chantier) {
                res.status(404).json({ message: "Chantier introuvable" });
                return null;
            }
            return repositories_1.sortieRepository.create({
                ...baseFields,
                typeSortie: "interne_chantier",
                chantier,
                nomTransporteurChantier: dto.nomTransporteur,
                matriculeTransporteurChantier: dto.matriculeTransporteur,
                depot: null,
                sousTypeSortieExterne: null,
                nomEntreprise: null,
                adresseEntreprise: null,
                matriculeFiscalEntreprise: null,
                nomClient: null,
                nomTransporteurExterne: null,
                matriculeTransporteurExterne: null,
            });
        }
        // ============ SORTIE EXTERNE ============
        if (dto.typeSortie === "externe") {
            const sortieExterne = repositories_1.sortieRepository.create({
                ...baseFields,
                typeSortie: "externe",
                sousTypeSortieExterne: dto.sousTypeSortieExterne,
                nomEntreprise: dto.nomEntreprise,
                adresseEntreprise: dto.adresseEntreprise,
                matriculeFiscalEntreprise: dto.matriculeFiscalEntreprise,
                nomClient: dto.nomClient,
                depot: null,
                chantier: null,
            });
            // Add transporteur fields if "avec_transporteur"
            if (dto.sousTypeSortieExterne === "avec_transporteur") {
                sortieExterne.nomTransporteurExterne = dto.nomTransporteur;
                sortieExterne.matriculeTransporteurExterne = dto.matriculeTransporteur;
            }
            else {
                sortieExterne.nomTransporteurExterne = null;
                sortieExterne.matriculeTransporteurExterne = null;
            }
            return sortieExterne;
        }
        res.status(400).json({ message: "Type de sortie invalide" });
        return null;
    }
    async listSorties(req, res) {
        const q = req.query;
        const page = Number(q.page) || 1;
        const max = Number(process.env.MAX_PER_PAGE) || 20;
        const where = {
            status: "pending",
        };
        if (q.date)
            where.date = q.date;
        if (q.typeSortie)
            where.typeSortie = q.typeSortie;
        if (q.chantierId)
            where.chantier = { code: Number(q.chantierId) };
        if (q.depotId)
            where.depot = { id: Number(q.depotId) };
        if (q.compteId)
            where.compte = { id: Number(q.compteId) };
        if (q.id != undefined)
            where.id = Number(q.id); // Add this line
        // ============ FILTER BY ARTICLE ID ============
        let articleFilter;
        if (q.articleId) {
            const rows = await repositories_1.articleSortieRepository.find({
                where: { article: { id: Number(q.articleId) } },
                select: { sortie: { id: true } },
                relations: { sortie: true },
            });
            articleFilter = rows.map((r) => r.sortie.id);
            if (!articleFilter.length) {
                return res.json({
                    sorties: [],
                    count: 0,
                    totalPages: 0,
                    lastPage: true,
                });
            }
            where.id = (0, typeorm_1.In)(articleFilter);
        }
        // ============ FILTER BY STOCK SORTIE ============
        let stockSortieFilter;
        if (q.stockSortie) {
            stockSortieFilter = Number(q.stockSortie);
            const rows = await repositories_1.articleSortieRepository.find({
                where: { stockSortie: stockSortieFilter },
                select: { sortie: { id: true } },
                relations: { sortie: true },
            });
            const sortieIds = rows.map((r) => r.sortie.id);
            if (!sortieIds.length) {
                return res.json({
                    sorties: [],
                    count: 0,
                    totalPages: 0,
                    lastPage: true,
                });
            }
            where.id = (0, typeorm_1.In)(sortieIds);
        }
        // ============ FETCH SORTIES ============
        const [sorties, total] = await repositories_1.sortieRepository.findAndCount({
            where,
            relations: {
                chantier: true,
                depot: true,
                compte: true,
                articleSorties: { article: true },
            },
            order: { date: "DESC", id: "DESC" },
            skip: (page - 1) * max,
            take: max,
        });
        // Filter article lines if stockSortie filter was applied
        if (stockSortieFilter !== undefined) {
            sorties.forEach((s) => {
                s.articleSorties = s.articleSorties.filter((l) => l.stockSortie === stockSortieFilter);
            });
        }
        res.json({
            sorties,
            count: sorties.length,
            totalPages: Math.ceil(total / max),
            currentPage: page,
            lastPage: page >= Math.ceil(total / max),
        });
    }
    /**
     * List confirmed sorties with filtering
     */
    async listConfirmedSorties(req, res) {
        return this.fetchSortiesByStatus(req, res, "confirmed");
    }
    /**
     * Fetch sorties by status with multi-criteria filtering
     */
    async fetchSortiesByStatus(req, res, status) {
        const q = req.query;
        const page = Number(q.page) || 1;
        const max = Number(process.env.MAX_PER_PAGE) || 20;
        const where = { status };
        if (q.date)
            where.date = q.date;
        if (q.typeSortie)
            where.typeSortie = q.typeSortie;
        if (q.chantierId)
            where.chantier = { code: Number(q.chantierId) };
        if (q.depotId)
            where.depot = { id: Number(q.depotId) };
        if (q.compteId)
            where.compte = { id: Number(q.compteId) };
        if (q.id != undefined)
            where.id = Number(q.id);
        // ============ HANDLE ARTICLE FILTERING ============
        if (q.articleId) {
            const articleLines = await repositories_1.articleSortieRepository.find({
                where: { article: { id: Number(q.articleId) } },
                relations: { sortie: true },
            });
            const validIds = articleLines.map((line) => line.sortie.id);
            if (validIds.length === 0) {
                return res.json(this.emptyResponse());
            }
            where.id = (0, typeorm_1.In)(validIds);
        }
        // ============ EXECUTE QUERY ============
        const [sorties, total] = await repositories_1.sortieRepository.findAndCount({
            where,
            relations: {
                chantier: true,
                depot: true,
                compte: true,
                articleSorties: { article: true },
                documents: status === "confirmed",
            },
            order: { date: "DESC", id: "DESC" },
            skip: (page - 1) * max,
            take: max,
        });
        const totalPages = Math.ceil(total / max);
        return res.json({
            sorties,
            count: total,
            totalPages,
            currentPage: page,
            lastPage: page >= totalPages,
        });
    }
    emptyResponse() {
        return {
            sorties: [],
            count: 0,
            totalPages: 0,
            lastPage: true,
        };
    }
    /**
     * Confirm or deny a pending sortie
     */
    async confirmDenySortie(req, res) {
        const dto = req.body;
        const sortie = await repositories_1.sortieRepository.findOne({
            where: { id: dto.sortieId },
            relations: { articleSorties: { article: true } },
        });
        if (!sortie) {
            return res.status(404).json({ message: "Sortie introuvable" });
        }
        if (sortie.status !== "pending") {
            return res.status(400).json({ message: "Sortie déjà traitée" });
        }
        // ============ DENY ACTION ============
        if (dto.action === "deny") {
            await repositories_1.sortieRepository.remove(sortie);
            return res.json({ message: "Sortie refusée et supprimée" });
        }
        // ============ CONFIRM ACTION - DECREMENT STOCK ============
        const updatedArticles = [];
        for (const line of sortie.articleSorties) {
            const article = line.article;
            if (article.stockActuel < line.stockSortie) {
                return res.status(409).json({
                    message: `Stock insuffisant pour article ${article.nom}`,
                });
            }
            article.stockActuel =
                Number(article.stockActuel) - Number(line.stockSortie);
            await repositories_1.articlesRepositoy.save(article);
            updatedArticles.push(article);
        }
        sortie.status = "confirmed";
        await repositories_1.sortieRepository.save(sortie);
        // ============ CREATE STOCK NOTIFICATIONS ============
        const notifications = [];
        for (const article of updatedArticles) {
            const notification = await (0, notification_util_1.checkAndCreateStockNotification)(article);
            if (notification) {
                notifications.push({
                    id: notification.id,
                    type: notification.type,
                    message: notification.message,
                });
            }
        }
        // ============ GENERATE PDF DOCUMENT ============
        const sortieWithRelations = await repositories_1.sortieRepository.findOne({
            where: { id: sortie.id },
            relations: {
                chantier: true,
                depot: true,
                articleSorties: { article: { unite: true } },
            },
        });
        let documents = [];
        let pdfLabel = "";
        if (sortieWithRelations) {
            const isInterne = sortieWithRelations.typeSortie !== "externe";
            const pdfInfo = isInterne
                ? await (0, pdf_util_1.generateFicheExpeditionForSortie)(sortieWithRelations)
                : await (0, pdf_util_1.generateBonDeLivraisonForSortie)(sortieWithRelations);
            pdfLabel = isInterne ? "Fiche d'Expédition" : "Bon de Livraison";
            const baseUrl = process.env.API_BASE_URL || "";
            const doc = repositories_1.documentRepository.create({
                type: pdfInfo.type,
                filename: pdfInfo.filename,
                originalName: pdfInfo.filename,
                path: pdfInfo.path,
                mimeType: "application/pdf",
                size: pdfInfo.size,
                entree: null,
                demandeArticle: null,
                sortie: sortie,
            });
            await repositories_1.documentRepository.save(doc);
            documents = [
                {
                    id: doc.id,
                    type: doc.type,
                    downloadUrl: `${baseUrl}/api/documents/${doc.id}/download`,
                },
            ];
        }
        res.json({
            message: `Sortie confirmée, stock mis à jour, ${pdfLabel || "document"} généré`,
            sortie,
            documents,
            stockAlerts: notifications.length > 0 ? notifications : undefined,
        });
    }
    /**
     * Delete a sortie
     */
    async deleteSortie(req, res) {
        const id = Number(req.query.id);
        const sortie = await repositories_1.sortieRepository.findOneBy({ id });
        if (!sortie) {
            return res.status(404).json({ message: "Sortie introuvable" });
        }
        await repositories_1.sortieRepository.remove(sortie);
        return res.json({ message: "Sortie supprimée avec succès" });
    }
}
exports.SortieService = SortieService;
//# sourceMappingURL=sortie.service.js.map