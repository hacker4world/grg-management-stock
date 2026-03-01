"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesService = void 0;
const repositories_1 = require("../repository/repositories");
const fetch_util_1 = require("../utilities/fetch.util");
const Categorie_1 = require("../entity/Categorie");
require("dotenv/config");
const typeorm_1 = require("typeorm");
class CategoriesService {
    async ajouterCategorie(request, response) {
        const data = request.body;
        let sous_famille = null;
        if (data.sous_famille != "no-subfamily") {
            sous_famille = await repositories_1.sousFamillesRepository.findOne({
                where: { id: Number(data.sous_famille) },
                relations: ["famille"],
            });
            if (!sous_famille)
                return response.status(404).json({
                    message: "sous famille n'est pas trouvé",
                });
        }
        const categorie = new Categorie_1.Categorie();
        categorie.nom = data.nom;
        categorie.sous_famille = sous_famille;
        let newCategorie = await repositories_1.categoryRepository.save(categorie);
        return response.json({
            message: "Catégorie est crée",
            categorie: newCategorie,
        });
    }
    async listeCategories(request, response) {
        const { page, query, sousFamilleId } = request.query;
        const pageNum = page !== undefined ? Number(page) : 0;
        const maxPerPage = Number(process.env.MAX_PER_PAGE) || 20;
        let filterOptions = {};
        if (query)
            filterOptions.nom = (0, typeorm_1.Raw)((alias) => `Lower(${alias}) LIKE LOWER(:nom)`, {
                nom: `%${query}%`,
            });
        if (sousFamilleId) {
            if (sousFamilleId === "no-subfamily")
                filterOptions.sous_famille = (0, typeorm_1.IsNull)();
            else {
                const sf = await repositories_1.sousFamillesRepository.findOne({
                    where: { id: Number(sousFamilleId) },
                });
                if (sf)
                    filterOptions.sous_famille = sf;
            }
        }
        const findOptions = {
            where: filterOptions,
            relations: ["sous_famille", "sous_famille.famille"],
        };
        if (pageNum !== 0) {
            findOptions.skip = (pageNum - 1) * maxPerPage;
            findOptions.take = maxPerPage;
        }
        const [categories, total] = await repositories_1.categoryRepository.findAndCount(findOptions);
        const totalPages = pageNum === 0 ? 1 : Math.ceil(total / maxPerPage);
        response.json({
            categories,
            count: categories.length,
            totalPages,
            lastPage: pageNum === 0 ? true : pageNum >= totalPages,
        });
    }
    async modifierCategorie(request, response) {
        const data = request.body;
        const category = await (0, fetch_util_1.fetchCategory)(data.category_id);
        if (!category) {
            return response.status(404).json({
                message: "Categorie n'est pas trouvé",
            });
        }
        else {
            let sousFamille = null;
            if (data.sous_famille != "no-subfamily") {
                sousFamille = await repositories_1.sousFamillesRepository.findOne({
                    where: { id: Number(data.sous_famille) },
                    relations: ["famille"],
                });
                console.log(sousFamille);
                if (!sousFamille)
                    return response.status(404).json({
                        message: "sous famille n'est pas trouvé",
                    });
            }
            category.nom = data.nom;
            category.sous_famille = sousFamille;
            const updatedCategorie = await repositories_1.categoryRepository.save(category);
            return response.json({
                message: "Catégorie est modifié",
                categorie: updatedCategorie,
            });
        }
    }
    async supprimerCategorie(request, response) {
        const data = request.query;
        const categorie = await (0, fetch_util_1.fetchCategory)(Number(data.category_id));
        if (!categorie) {
            return response.status(404).json({
                message: "Categorie n'est pas trouvé",
            });
        }
        else {
            repositories_1.categoryRepository
                .delete(categorie)
                .then(() => {
                response.json({
                    message: "Categorie est supprimé",
                });
            })
                .catch((err) => {
                console.log(err);
                response.status(500).json({ message: "Un erreur est survenu" });
            });
        }
    }
}
exports.CategoriesService = CategoriesService;
//# sourceMappingURL=categories.service.js.map