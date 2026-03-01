"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetourService = void 0;
const repositories_1 = require("../repository/repositories");
const typeorm_1 = require("typeorm");
const pdf_util_1 = require("../utilities/pdf.util");
/* ---- helper: compute available stock per article in a chantier ---- */
async function getChantierAvailableStock(chantierCode) {
    // Confirmed sorties → delivered
    const sorties = await repositories_1.sortieRepository.find({
        where: { chantier: { code: chantierCode }, status: "confirmed" },
        relations: ["articleSorties", "articleSorties.article"],
    });
    const deliveredMap = new Map();
    for (const s of sorties) {
        for (const as of s.articleSorties) {
            const prev = deliveredMap.get(as.article.id) || 0;
            deliveredMap.set(as.article.id, prev + Number(as.stockSortie));
        }
    }
    // Confirmed + pending retours → already returned
    const retours = await repositories_1.retourRepository.find({
        where: {
            chantier: { code: chantierCode },
            status: (0, typeorm_1.In)(["confirmed", "pending"]),
        },
        relations: ["items", "items.article"],
    });
    const returnedMap = new Map();
    for (const r of retours) {
        for (const item of r.items) {
            const prev = returnedMap.get(item.article.id) || 0;
            returnedMap.set(item.article.id, prev + Number(item.quantite));
        }
    }
    // available = delivered - returned
    const availableMap = new Map();
    for (const [articleId, delivered] of deliveredMap) {
        const returned = returnedMap.get(articleId) || 0;
        const available = delivered - returned;
        if (available > 0) {
            availableMap.set(articleId, available);
        }
    }
    return availableMap;
}
class RetourService {
    /* ---------------------------------------------------- */
    /* 1. CREATE                                             */
    /* ---------------------------------------------------- */
    async createRetour(req, res) {
        const dto = req.body;
        // 1. chantier exists ?
        const chantier = await repositories_1.chantierRepository.findOneBy({
            code: dto.chantierId,
        });
        if (!chantier)
            return res.status(404).json({ message: "Chantier introuvable" });
        // 2. articles exist ?
        const articleIds = dto.items.map((i) => i.articleId);
        const articles = await repositories_1.articlesRepositoy.findBy({ id: (0, typeorm_1.In)(articleIds) });
        if (articles.length !== articleIds.length)
            return res
                .status(400)
                .json({ message: "Un ou plusieurs articles introuvables" });
        // 3. validate: articles must be available in the chantier with sufficient qty
        const availableStock = await getChantierAvailableStock(dto.chantierId);
        for (const item of dto.items) {
            const available = availableStock.get(item.articleId) || 0;
            const articleName = articles.find((a) => a.id === item.articleId)?.nom ||
                `#${item.articleId}`;
            if (available <= 0) {
                return res.status(400).json({
                    message: `L'article "${articleName}" n'est pas disponible dans ce chantier`,
                });
            }
            if (item.quantite > available) {
                return res.status(400).json({
                    message: `Quantité insuffisante pour "${articleName}": demandé ${item.quantite}, disponible ${available}`,
                });
            }
        }
        // 4. build entities
        const retour = repositories_1.retourRepository.create({
            date: new Date().toISOString().slice(0, 10),
            chantier,
            status: "pending",
            observation: dto.observation,
        });
        await repositories_1.retourRepository.save(retour);
        const items = dto.items.map((it) => repositories_1.retourArticleItemRepository.create({
            retour,
            article: { id: it.articleId },
            quantite: it.quantite,
            reason: it.reason,
        }));
        await repositories_1.retourArticleItemRepository.save(items);
        return res.json({ message: "retour ajouté" });
    }
    /* ---------------------------------------------------- */
    /* 2. LIST                                               */
    /* ---------------------------------------------------- */
    async listRetours(req, res) {
        const q = req.query;
        const page = Number(q.page) || 1;
        const max = Number(process.env.MAX_PER_PAGE) || 20;
        /* ---------- base conditions ---------- */
        const where = {};
        // Filter by Chantier
        if (q.chantierId)
            where.chantier = { code: q.chantierId };
        // Filter by Article
        if (q.articleId) {
            where.items = { article: { id: q.articleId } };
        }
        // Filter by ID - ignore if id = 0
        if (q.id != undefined) {
            where.id = q.id;
        }
        // Filter by Status (pending | confirmed | denied)
        if (q.status) {
            where.status = q.status;
        }
        if (q.date) {
            where.date = q.date;
        }
        const [retours, total] = await repositories_1.retourRepository.findAndCount({
            where,
            relations: {
                chantier: true,
                items: { article: true },
                documents: true,
            },
            order: { id: "DESC" },
            skip: (page - 1) * max,
            take: max,
        });
        res.json({
            retours,
            count: total,
            totalPages: Math.ceil(total / max),
            currentPage: page,
            lastPage: page >= Math.ceil(total / max),
        });
    }
    /* ---------------------------------------------------- */
    /* 3. APPROVE / DENY                                     */
    /* ---------------------------------------------------- */
    async approveDenyRetour(req, res) {
        const dto = req.body;
        // Load retour with items and articles
        const retour = await repositories_1.retourRepository.findOne({
            where: { id: dto.retourId },
            relations: { items: { article: true } },
        });
        if (!retour)
            return res.status(404).json({ message: "Retour introuvable" });
        if (dto.action === "approve") {
            // Update stock for each returned article (increment stock)
            for (const item of retour.items) {
                const article = await repositories_1.articlesRepositoy.findOneBy({
                    id: item.article.id,
                });
                if (article) {
                    article.stockActuel += item.quantite;
                    await repositories_1.articlesRepositoy.save(article);
                    console.log(`📦 Stock updated: ${article.nom} +${item.quantite} → ${article.stockActuel}`);
                }
            }
            retour.status = "confirmed";
            retour.nomTransporteur = dto.nomTransporteur || null;
            retour.matriculeTransporteur = dto.matriculeTransporteur || null;
            await repositories_1.retourRepository.save(retour);
            // Génération du Bon de Retour (BR) pour le retour approuvé
            const retourWithRelations = await repositories_1.retourRepository.findOne({
                where: { id: retour.id },
                relations: {
                    chantier: { compte: true },
                    items: { article: { unite: true } },
                },
            });
            let documents = [];
            if (retourWithRelations) {
                const brInfo = await (0, pdf_util_1.generateBonDeRetourForRetour)(retourWithRelations);
                const baseUrl = process.env.API_BASE_URL || "";
                const doc = repositories_1.documentRepository.create({
                    type: brInfo.type,
                    filename: brInfo.filename,
                    originalName: brInfo.filename,
                    path: brInfo.path,
                    mimeType: "application/pdf",
                    size: brInfo.size,
                    entree: null,
                    demandeArticle: null,
                    sortie: null,
                    retour: retour,
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
            return res.json({
                message: "Retour approuvé, stock mis à jour, Bon de Retour généré",
                documents,
            });
        }
        // deny → delete
        await repositories_1.retourRepository.remove(retour);
        return res.json({ message: "Retour refusé et supprimé" });
    }
}
exports.RetourService = RetourService;
//# sourceMappingURL=retour.service.js.map