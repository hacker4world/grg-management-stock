"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepotService = void 0;
require("dotenv/config");
const repositories_1 = require("../repository/repositories");
const typeorm_1 = require("typeorm");
class DepotService {
    /* CREATE ------------------------------------------------------------- */
    async creerDepot(req, res) {
        const data = req.body;
        const nouveau = repositories_1.depotRepository.create({
            nom: data.nom,
            adresse: data.adresse || null,
        });
        await repositories_1.depotRepository.save(nouveau);
        res.json({ message: "Dépôt est ajouté", depot: nouveau });
    }
    /* LIST --------------------------------------------------------------- */
    async listeDepots(req, res) {
        const q = req.query;
        // Check if pagination is requested (page > 0)
        const isPaginationDisabled = !q.page || Number(q.page) === 0;
        const page = Number(q.page) || 1;
        const max = Number(process.env.MAX_PER_PAGE) || 20;
        const where = {};
        if (q.query)
            where.nom = (0, typeorm_1.Raw)((alias) => `LOWER(${alias}) LIKE LOWER(:nom)`, {
                nom: `%${q.query}%`,
            });
        // Define find options
        const findOptions = { where };
        // Apply pagination only if not disabled
        if (!isPaginationDisabled) {
            findOptions.skip = (page - 1) * max;
            findOptions.take = max;
        }
        const [depots, total] = await repositories_1.depotRepository.findAndCount(findOptions);
        // Count articles for each depot
        let depotsWithCount = depots;
        if (depots.length > 0) {
            const depotIds = depots.map((d) => d.id);
            const articleCounts = await repositories_1.articlesRepositoy
                .createQueryBuilder("article")
                .select("article.depotId", "depotId")
                .addSelect("COUNT(*)", "count")
                .where("article.depotId IN (:...ids)", { ids: depotIds })
                .groupBy("article.depotId")
                .getRawMany();
            depotsWithCount = depots.map((depot) => ({
                ...depot,
                nombreArticles: parseInt(articleCounts.find((ac) => ac.depotId === depot.id)?.count || "0", 10),
            }));
        }
        res.json({
            depots: depotsWithCount,
            count: total,
            resultsPerPage: isPaginationDisabled ? total : depots.length,
            totalPages: isPaginationDisabled ? 1 : Math.ceil(total / max),
            lastPage: isPaginationDisabled ? true : page >= Math.ceil(total / max),
        });
    }
    /* UPDATE ------------------------------------------------------------- */
    async modifierDepot(req, res) {
        const data = req.body;
        const depot = await repositories_1.depotRepository.findOneBy({ id: data.id });
        if (!depot)
            return res.status(404).json({ message: "Dépôt n'est pas trouvé" });
        depot.nom = data.nom;
        if (data.adresse !== undefined)
            depot.adresse = data.adresse || null;
        await repositories_1.depotRepository.save(depot);
        res.json({ message: "Dépôt est modifié" });
    }
    /* DELETE ------------------------------------------------------------- */
    async supprimerDepot(req, res) {
        const { id } = req.query;
        const exists = await repositories_1.depotRepository.exist({ where: { id } });
        if (!exists)
            return res.status(404).json({ message: "Dépôt introuvable" });
        await repositories_1.depotRepository.delete(id);
        res.json({ message: "Dépôt est supprimé" });
    }
}
exports.DepotService = DepotService;
//# sourceMappingURL=depot.service.js.map