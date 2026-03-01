"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DemandeArticleService = void 0;
const fetch_util_1 = require("../utilities/fetch.util");
const repositories_1 = require("../repository/repositories");
const DemandeArticleItem_1 = require("../entity/DemandeArticleItem");
const pdf_util_1 = require("../utilities/pdf.util");
class DemandeArticleService {
    async createDemande(req, res) {
        const dto = req.body;
        // 1. chantier must exist
        const chantier = await repositories_1.chantierRepository.findOneBy({
            code: dto.chantierId,
        });
        if (!chantier)
            return res.status(404).json({ message: "Chantier introuvable" });
        // 2. all articles must exist
        const articleIds = dto.items.map((i) => i.articleId);
        const articles = await repositories_1.articlesRepositoy.findByIds(articleIds);
        if (articles.length !== articleIds.length)
            return res
                .status(400)
                .json({ message: "Un ou plusieurs articles introuvables" });
        // 3. build entity graph
        const demande = repositories_1.demandeArticlesRepository.create({
            date: new Date().toISOString().slice(0, 10),
            chantier,
            status: "pending",
            observation: dto.observation || undefined,
        });
        await repositories_1.demandeArticlesRepository.save(demande);
        const items = dto.items.map((it) => repositories_1.demandeArticlesRepository.manager.create(DemandeArticleItem_1.DemandeArticleItem, {
            demande,
            article: { id: it.articleId },
            quantite: it.quantity,
        }));
        await repositories_1.demandeArticlesRepository.manager.save(DemandeArticleItem_1.DemandeArticleItem, items);
        return res
            .status(201)
            .json({ message: "Demande créée", demande: { ...demande, items } });
    }
    async confirmOrDeny(req, res) {
        const { demandeId, action } = req.body;
        // Auth and role (magazinier/admin) are enforced by middleware
        const demande = await (0, fetch_util_1.fetchDemandeArticle)(demandeId);
        if (!demande)
            return res.status(404).json({ message: "Demande introuvable" });
        if (action === "deny") {
            await repositories_1.demandeArticlesRepository.remove(demande);
            return res.json({ message: "Demande refusée et supprimée" });
        }
        // confirm – NO stock decrease here (stock is decreased when the Sortie is confirmed)
        demande.status = "confirmed";
        await repositories_1.demandeArticlesRepository.save(demande);
        // Génération de la Fiche d'Expédition
        const demandeWithRelations = await repositories_1.demandeArticlesRepository.findOne({
            where: { id: demande.id },
            relations: {
                chantier: true,
                items: { article: { unite: true } },
            },
        });
        if (!demandeWithRelations) {
            return res.json({
                message: "Demande confirmée",
                demande,
                documents: [],
            });
        }
        const feInfo = await (0, pdf_util_1.generateFicheExpeditionForDemande)(demandeWithRelations);
        const baseUrl = process.env.API_BASE_URL || "";
        const doc = repositories_1.documentRepository.create({
            type: feInfo.type,
            filename: feInfo.filename,
            originalName: feInfo.filename,
            path: feInfo.path,
            mimeType: "application/pdf",
            size: feInfo.size,
            entree: null,
            demandeArticle: demande,
            sortie: null,
        });
        await repositories_1.documentRepository.save(doc);
        return res.json({
            message: "Demande confirmée, Fiche d'Expédition générée",
            demande,
            documents: [
                {
                    id: doc.id,
                    type: doc.type,
                    downloadUrl: `${baseUrl}/api/documents/${doc.id}/download`,
                },
            ],
        });
    }
    async listDemandes(req, res) {
        const filters = req.query;
        const page = filters.page || 1;
        const max = Number(process.env.MAX_PER_PAGE) || 20;
        // Initialize a single where object to ensure AND logic
        const where = {};
        if (filters.chantierId)
            where.chantier = { code: filters.chantierId };
        if (filters.date)
            where.date = filters.date;
        if (filters.status)
            where.status = filters.status;
        // Add id filter - ignore if id = 0
        if (filters.id != undefined) {
            where.id = filters.id;
        }
        // Merge the article filter into the same object
        if (filters.articleId) {
            where.items = {
                article: { id: filters.articleId },
            };
        }
        const [demandes, total] = await repositories_1.demandeArticlesRepository.findAndCount({
            where: where,
            relations: {
                chantier: true,
                items: { article: true },
                documents: true,
            },
            order: { date: "DESC" },
            skip: (page - 1) * max,
            take: max,
        });
        res.json({
            demandes,
            count: demandes.length,
            totalPages: Math.ceil(total / max),
            lastPage: page >= Math.ceil(total / max),
        });
    }
}
exports.DemandeArticleService = DemandeArticleService;
//# sourceMappingURL=demandeArticles.service.js.map