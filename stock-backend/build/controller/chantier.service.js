"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChantierService = void 0;
require("dotenv/config");
const fetch_util_1 = require("../utilities/fetch.util");
const repositories_1 = require("../repository/repositories");
const typeorm_1 = require("typeorm");
class ChantierService {
    async creerChantier(req, res) {
        const data = req.body;
        const compte = await repositories_1.compteRepository.findOneBy({ id: data.compteId });
        if (!compte)
            return res.status(404).json({ message: "Compte introuvable" });
        if (!compte.confirme)
            return res.status(403).json({ message: "Compte non vérifié" });
        if (compte.role !== "responsable-chantier")
            return res.status(403).json({ message: "Rôle invalide" });
        const nouveau = repositories_1.chantierRepository.create({
            nom: data.nom,
            adresse: data.adresse,
            compte,
        });
        await repositories_1.chantierRepository.save(nouveau);
        res.json({ message: "Chantier est ajouté", chantier: nouveau });
    }
    async listeChantiers(req, res) {
        const q = req.query;
        const page = q.page !== undefined ? Number(q.page) : 0; // Default to 0 (all)
        const max = Number(process.env.MAX_PER_PAGE) || 20;
        const where = {};
        if (q.query)
            where.nom = (0, typeorm_1.Raw)((alias) => `LOWER(${alias}) LIKE LOWER(:nom)`, {
                nom: `%${q.query}%`,
            });
        if (q.adresse)
            where.adresse = (0, typeorm_1.Raw)((alias) => `LOWER(${alias}) LIKE LOWER(:adr)`, {
                adr: `%${q.adresse}%`,
            });
        if (q.code)
            where.code = (0, typeorm_1.Raw)((alias) => `LOWER(${alias}) LIKE LOWER(:code)`, {
                code: `%${q.code}%`,
            });
        if (q.compteId)
            where.compte = { id: Number(q.compteId) };
        const findOptions = {
            where,
            relations: { compte: true },
        };
        if (page !== 0) {
            findOptions.skip = (page - 1) * max;
            findOptions.take = max;
        }
        const [chantiers, total] = await repositories_1.chantierRepository.findAndCount(findOptions);
        res.json({
            chantiers,
            count: chantiers.length,
            totalPages: page === 0 ? 1 : Math.ceil(total / max),
            lastPage: page === 0 ? true : page >= Math.ceil(total / max),
        });
    }
    async modifierChantier(req, res) {
        const data = req.body;
        const chantier = await (0, fetch_util_1.fetchChantier)(data.code_chantier);
        if (!chantier)
            return res.status(404).json({ message: "Chantier n'est pas trouvé" });
        if (data.compteId !== undefined) {
            const compte = await repositories_1.compteRepository.findOneBy({ id: data.compteId });
            if (!compte)
                return res.status(404).json({ message: "Compte introuvable" });
            chantier.compte = compte;
        }
        chantier.nom = data.nom;
        chantier.adresse = data.adresse;
        await repositories_1.chantierRepository.save(chantier);
        res.json({ message: "Chantier est modifié" });
    }
    async supprimerChantier(req, res) {
        let { code_chantier } = req.query;
        code_chantier = Number(code_chantier);
        const exists = await repositories_1.chantierRepository.exist({
            where: { code: code_chantier },
        });
        if (!exists) {
            return res.status(404).json({ message: "Chantier introuvable" });
        }
        await repositories_1.chantierRepository.delete(code_chantier);
        res.json({ message: "Chantier est supprimé" });
    }
    async affecterChantier(req, res) {
        const data = req.body;
        const chantier = await (0, fetch_util_1.fetchChantier)(data.code_chantier);
        if (!chantier) {
            return res.status(404).json({ message: "Chantier introuvable" });
        }
        const compte = await (0, fetch_util_1.fetchCompte)(data.compte_id);
        if (!compte) {
            return res.status(404).json({ message: "Compte introuvable" });
        }
        if (!compte.confirme) {
            return res.status(403).json({ message: "Le compte n'est pas vérifié" });
        }
        if (compte.role !== "responsable-chantier") {
            return res.status(403).json({
                message: "Le compte doit avoir le rôle 'responsable-chantier'",
            });
        }
        chantier.compte = compte;
        await repositories_1.chantierRepository.save(chantier);
        res.json({
            message: "Chantier affecté avec succès",
            chantier: {
                code: chantier.code,
                nom: chantier.nom,
                adresse: chantier.adresse,
                compte: {
                    id: compte.id,
                    nom: compte.nom,
                    prenom: compte.prenom,
                    nom_utilisateur: compte.nom_utilisateur,
                },
            },
        });
    }
    async getMesChantiers(req, res) {
        const compte = req.user;
        const q = req.query;
        const page = q.page !== undefined ? Number(q.page) : 0;
        const max = Number(process.env.MAX_PER_PAGE) || 20;
        const where = {};
        if (compte.role !== "admin")
            where.compte = { id: compte.id };
        if (q.query) {
            where.nom = (0, typeorm_1.Raw)((alias) => `LOWER(${alias}) LIKE LOWER(:nom)`, {
                nom: `%${q.query}%`,
            });
        }
        const findOptions = {
            where,
            relations: { compte: true },
        };
        if (page !== 0) {
            findOptions.skip = (page - 1) * max;
            findOptions.take = max;
        }
        const [chantiers, total] = await repositories_1.chantierRepository.findAndCount(findOptions);
        res.json({
            chantiers,
            count: chantiers.length,
            totalPages: page === 0 ? 1 : Math.ceil(total / max),
            lastPage: page === 0 ? true : page >= Math.ceil(total / max),
        });
    }
    async getChantierSummary(req, res) {
        const { chantierId } = req.params;
        const code = Number(chantierId);
        const chantier = await repositories_1.chantierRepository.findOne({
            where: { code },
            relations: { compte: true },
        });
        if (!chantier) {
            return res.status(404).json({ message: "Chantier introuvable" });
        }
        // Fetch all related movements
        const sorties = await repositories_1.sortieRepository.find({
            where: { chantier: { code } },
            relations: ["articleSorties", "articleSorties.article", "compte"],
        });
        const demandes = await repositories_1.demandeArticlesRepository.find({
            where: { chantier: { code } },
            relations: ["items", "items.article"],
        });
        const retours = await repositories_1.retourRepository.find({
            where: { chantier: { code } },
            relations: ["items", "items.article"],
        });
        res.json({
            chantier,
            summary: {
                sorties,
                demandes,
                retours,
            },
        });
    }
    /* ---------------------------------------------------- */
    /* STOCK PAR CHANTIER                                    */
    /* Returns articles available in a chantier:             */
    /*   delivered (confirmed sorties) - returned (confirmed */
    /*   + pending retours)                                  */
    /* ---------------------------------------------------- */
    async getChantierStock(req, res) {
        const { chantierId } = req.params;
        const code = Number(chantierId);
        // 1. Verify chantier exists
        const chantier = await repositories_1.chantierRepository.findOneBy({ code });
        if (!chantier) {
            return res.status(404).json({ message: "Chantier introuvable" });
        }
        // 2. Get all confirmed sorties (deliveries) for this chantier
        const sorties = await repositories_1.sortieRepository.find({
            where: { chantier: { code }, status: "confirmed" },
            relations: [
                "articleSorties",
                "articleSorties.article",
                "articleSorties.article.unite",
                "articleSorties.article.categorie",
                "articleSorties.article.depot",
            ],
        });
        // 3. Get retours for this chantier (separate confirmed vs pending)
        const retours = await repositories_1.retourRepository.find({
            where: { chantier: { code }, status: (0, typeorm_1.In)(["confirmed", "pending"]) },
            relations: ["items", "items.article"],
        });
        // 4. Calculate total delivered per article
        const deliveredMap = new Map();
        for (const sortie of sorties) {
            for (const as of sortie.articleSorties) {
                const existing = deliveredMap.get(as.article.id);
                if (existing) {
                    existing.delivered += Number(as.stockSortie);
                }
                else {
                    deliveredMap.set(as.article.id, {
                        article: as.article,
                        delivered: Number(as.stockSortie),
                    });
                }
            }
        }
        // 5. Calculate returned per article: split confirmed vs pending
        const confirmedReturnMap = new Map();
        const pendingReturnMap = new Map();
        for (const retour of retours) {
            const targetMap = retour.status === "confirmed" ? confirmedReturnMap : pendingReturnMap;
            for (const item of retour.items) {
                const prev = targetMap.get(item.article.id) || 0;
                targetMap.set(item.article.id, prev + Number(item.quantite));
            }
        }
        // 6. Build result: only articles with available stock > 0
        const stock = [];
        for (const [articleId, { article, delivered }] of deliveredMap) {
            const confirmed = confirmedReturnMap.get(articleId) || 0;
            const pending = pendingReturnMap.get(articleId) || 0;
            const available = delivered - confirmed - pending;
            if (available > 0) {
                stock.push({
                    article,
                    quantiteDisponible: available,
                    totalLivre: delivered,
                    totalRetourne: confirmed, // only confirmed retours
                    enAttenteRetour: pending, // pending retours shown separately
                });
            }
        }
        res.json({
            chantier: {
                code: chantier.code,
                nom: chantier.nom,
                adresse: chantier.adresse,
            },
            stock,
        });
    }
}
exports.ChantierService = ChantierService;
//# sourceMappingURL=chantier.service.js.map