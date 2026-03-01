"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniteService = void 0;
require("dotenv/config");
const repositories_1 = require("../repository/repositories");
const typeorm_1 = require("typeorm");
class UniteService {
    /* CREATE ------------------------------------------------------------- */
    async creerUnite(req, res) {
        const data = req.body;
        const nouvelle = repositories_1.uniteRepository.create({ nom: data.nom });
        await repositories_1.uniteRepository.save(nouvelle);
        res.json({ message: "Unité est ajoutée", unite: nouvelle });
    }
    /* LIST --------------------------------------------------------------- */
    /* LIST --------------------------------------------------------------- */
    async listeUnites(req, res) {
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
        const [unites, total] = await repositories_1.uniteRepository.findAndCount(findOptions);
        let unitesWithCount = unites;
        if (unites.length > 0) {
            const uniteIds = unites.map((u) => u.id);
            const articleCounts = await repositories_1.articlesRepositoy
                .createQueryBuilder("article")
                .select("article.uniteId", "uniteId")
                .addSelect("COUNT(*)", "count")
                .where("article.uniteId IN (:...ids)", { ids: uniteIds })
                .groupBy("article.uniteId")
                .getRawMany();
            unitesWithCount = unites.map((unite) => ({
                ...unite,
                nombreArticles: parseInt(articleCounts.find((ac) => ac.uniteId === unite.id)?.count || "0", 10),
            }));
        }
        res.json({
            unites: unitesWithCount,
            count: total,
            resultsPerPage: isPaginationDisabled ? total : unites.length,
            totalPages: isPaginationDisabled ? 1 : Math.ceil(total / max),
            lastPage: isPaginationDisabled ? true : page >= Math.ceil(total / max),
        });
    }
    /* UPDATE ------------------------------------------------------------- */
    async modifierUnite(req, res) {
        const data = req.body;
        const unite = await repositories_1.uniteRepository.findOneBy({ id: data.id });
        if (!unite)
            return res.status(404).json({ message: "Unité n'est pas trouvée" });
        unite.nom = data.nom;
        await repositories_1.uniteRepository.save(unite);
        res.json({ message: "Unité est modifiée" });
    }
    /* DELETE ------------------------------------------------------------- */
    async supprimerUnite(req, res) {
        const { id } = req.query;
        const exists = await repositories_1.uniteRepository.exist({ where: { id } });
        if (!exists)
            return res.status(404).json({ message: "Unité introuvable" });
        await repositories_1.uniteRepository.delete(id);
        res.json({ message: "Unité est supprimée" });
    }
}
exports.UniteService = UniteService;
//# sourceMappingURL=unite.service.js.map