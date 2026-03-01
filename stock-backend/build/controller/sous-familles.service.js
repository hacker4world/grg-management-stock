"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SousFamillesService = void 0;
require("dotenv/config");
const fetch_util_1 = require("../utilities/fetch.util");
const SousFamille_1 = require("../entity/SousFamille");
const repositories_1 = require("../repository/repositories");
const typeorm_1 = require("typeorm");
class SousFamillesService {
    async creerSousFamille(request, response) {
        const data = request.body;
        let famille = null;
        if (data.famille_id) {
            famille = await (0, fetch_util_1.fetchFamille)(data.famille_id);
            if (!famille) {
                return response.status(404).json({
                    message: "Famille n'est pas trouvé",
                });
            }
        }
        const nouveauSousFamille = new SousFamille_1.SousFamille();
        nouveauSousFamille.nom = data.nom;
        nouveauSousFamille.famille = famille;
        repositories_1.sousFamillesRepository
            .save(nouveauSousFamille)
            .then((sf) => {
            response.json({
                message: "Sous famille est creé",
                sous_famille: sf,
            });
        })
            .catch((err) => {
            console.log(err);
            response.status(500).json({ message: "Un erreur est survenu" });
        });
    }
    async listeSousFamilles(request, response) {
        const page = request.query.page !== undefined ? Number(request.query.page) : 0;
        const maxPerPage = Number(process.env.MAX_PER_PAGE) || 20;
        const findOptions = { relations: ["famille"] };
        if (page !== 0) {
            findOptions.skip = (page - 1) * maxPerPage;
            findOptions.take = maxPerPage;
        }
        const [sousFamilles, total] = await repositories_1.sousFamillesRepository.findAndCount(findOptions);
        const totalPages = page === 0 ? 1 : Math.ceil(total / maxPerPage);
        response.json({
            sousFamilles,
            count: sousFamilles.length,
            totalPages,
            lastPage: page === 0 ? true : page >= totalPages,
        });
    }
    async filtrerSousFamilles(request, response) {
        let { familleId, page, nom } = request.query;
        const pageNum = page !== undefined ? Number(page) : 0;
        const maxPerPage = Number(process.env.MAX_PER_PAGE) || 20;
        let filterOptions = {};
        if (familleId && familleId !== "no-family")
            filterOptions.famille = { id: Number(familleId) };
        if (familleId === "no-family")
            filterOptions.famille = (0, typeorm_1.IsNull)();
        if (nom)
            filterOptions.nom = (0, typeorm_1.Raw)((alias) => `Lower(${alias}) LIKE LOWER(:nom)`, {
                nom: `%${nom}%`,
            });
        const findOptions = {
            where: filterOptions,
            relations: ["famille"],
        };
        if (pageNum !== 0) {
            findOptions.skip = (pageNum - 1) * maxPerPage;
            findOptions.take = maxPerPage;
        }
        const [sousFamilles, total] = await repositories_1.sousFamillesRepository.findAndCount(findOptions);
        const totalPages = pageNum === 0 ? 1 : Math.ceil(total / maxPerPage);
        response.json({
            sousFamilles,
            count: sousFamilles.length,
            totalPages,
            lastPage: pageNum === 0 ? true : pageNum >= totalPages,
        });
    }
    async modifierSousFamille(request, response) {
        const data = request.body;
        const sousFamille = await (0, fetch_util_1.fetchSousFamilles)(data.sous_famille_id);
        if (!sousFamille) {
            return response.status(404).json({
                message: "Sous famille n'est pas trouvé",
            });
        }
        else {
            let famille = null;
            if (data.famille_id != null) {
                famille = await (0, fetch_util_1.fetchFamille)(data.famille_id);
                if (!famille) {
                    return response.status(404).json({
                        message: "Famille n'est pas trouvé",
                    });
                }
            }
            sousFamille.nom = data.nom;
            sousFamille.famille = famille;
            repositories_1.sousFamillesRepository
                .save(sousFamille)
                .then(() => {
                response.json({
                    message: "Sous famille est modifié",
                });
            })
                .catch((err) => {
                console.log(err);
                response.status(500).json({ message: "Un erreur est survenu" });
            });
        }
    }
    async supprimerSousFamille(request, response) {
        const data = request.query;
        const sousFamille = await (0, fetch_util_1.fetchSousFamilles)(Number(data.id));
        if (!sousFamille) {
            return response.status(404).json({
                message: "Sous famille n'est pas trouvé",
            });
        }
        else {
            let cascade = data.cascade;
            if (!cascade || cascade.toLowerCase() == "no") {
                repositories_1.sousFamillesRepository
                    .delete(sousFamille)
                    .then(() => {
                    response.json({
                        message: "Sous famille est supprimé",
                    });
                })
                    .catch((err) => {
                    console.log(err);
                    response.status(500).json({ message: "Un erreur est survenu" });
                });
            }
            else {
                let categories = await repositories_1.categoryRepository.find({
                    where: { sous_famille: sousFamille },
                });
                for (let category of categories) {
                    await repositories_1.categoryRepository.delete(category.id);
                }
                await repositories_1.sousFamillesRepository.delete(sousFamille.id);
                response.json({
                    message: "Sous famille est supprimé",
                });
            }
        }
    }
}
exports.SousFamillesService = SousFamillesService;
//# sourceMappingURL=sous-familles.service.js.map