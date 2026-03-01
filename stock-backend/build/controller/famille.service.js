"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FamilleService = void 0;
require("dotenv/config");
const repositories_1 = require("../repository/repositories");
const Famille_1 = require("../entity/Famille");
const fetch_util_1 = require("../utilities/fetch.util");
const typeorm_1 = require("typeorm");
class FamilleService {
    async creerFamille(request, response) {
        const data = request.body;
        const existingFamille = await repositories_1.familleRepository.findOne({
            where: { nom: data.nom },
        });
        if (existingFamille) {
            response.status(400).json({
                message: "Famille avec ce nom deja existe",
            });
        }
        else {
            const nouveauFamille = new Famille_1.Famille();
            nouveauFamille.nom = data.nom;
            repositories_1.familleRepository
                .save(nouveauFamille)
                .then(() => {
                response.json({
                    message: "Famille est ajouté",
                    famille: nouveauFamille,
                });
            })
                .catch((err) => {
                console.log(err);
                response.status(500).json({
                    message: "Un erreur est survenu",
                });
            });
        }
    }
    async listeFamilles(request, response) {
        const page = request.query.page !== undefined ? Number(request.query.page) : 0;
        const maxPerPage = Number(process.env.MAX_PER_PAGE) || 20;
        const findOptions = {};
        if (page !== 0) {
            findOptions.skip = (page - 1) * maxPerPage;
            findOptions.take = maxPerPage;
        }
        const [familles, total] = await repositories_1.familleRepository.findAndCount(findOptions);
        const totalPages = page === 0 ? 1 : Math.ceil(total / maxPerPage);
        response.json({
            familles,
            count: familles.length,
            totalPages,
            lastPage: page === 0 ? true : page >= totalPages,
        });
    }
    async listAll(request, response) {
        const familles = await repositories_1.familleRepository.find();
        response.json({
            familles,
        });
    }
    async rechercherFamilles(request, response) {
        const { search, page } = request.query;
        const pageNum = page !== undefined ? Number(page) : 0;
        const maxPerPage = Number(process.env.MAX_PER_PAGE) || 20;
        const findOptions = {
            where: {
                nom: (0, typeorm_1.Raw)((alias) => `Lower(${alias}) LIKE LOWER(:nom)`, {
                    nom: `%${search}%`,
                }),
            },
        };
        if (pageNum !== 0) {
            findOptions.skip = (pageNum - 1) * maxPerPage;
            findOptions.take = maxPerPage;
        }
        const [familles, total] = await repositories_1.familleRepository.findAndCount(findOptions);
        const totalPages = pageNum === 0 ? 1 : Math.ceil(total / maxPerPage);
        response.json({
            familles,
            count: familles.length,
            totalPages,
            lastPage: pageNum === 0 ? true : pageNum >= totalPages,
        });
    }
    async modifierFamille(request, response) {
        const data = request.body;
        const existingFamille = await (0, fetch_util_1.fetchFamille)(data.famille_id);
        if (!existingFamille) {
            return response.status(404).json({
                message: "Famille n'est pas trouvé",
            });
        }
        else {
            existingFamille.nom = data.nom;
            repositories_1.familleRepository
                .save(existingFamille)
                .then(() => {
                response.json({
                    message: "Famille est modifié",
                });
            })
                .catch((err) => {
                console.log(err);
                response.status(500).json({ message: "Un erreur est survenu" });
            });
        }
    }
    async supprimerFamille(request, response) {
        const famille_id = Number(request.query.id);
        const cascade = request.query.cascade;
        const famille = await repositories_1.familleRepository.findOne({
            where: { id: famille_id },
            relations: ["sous_familles"],
        });
        if (!famille) {
            return response.status(404).json({
                message: "Famille n'est pas trouvé",
            });
        }
        if (cascade &&
            cascade.toLowerCase() != "yes" &&
            cascade.toLowerCase() != "no")
            return response.status(422).json({
                message: "Choix cascade invalide",
            });
        if (!cascade || cascade.toLowerCase() == "no") {
            repositories_1.familleRepository
                .delete(famille.id)
                .then(() => {
                response.json({
                    message: "Famille est supprimé",
                });
            })
                .catch((err) => {
                console.log(err);
                response.status(500).json({ message: "Un erreur est survenu" });
            });
        }
        else {
            console.log("cascade delete");
            console.log(famille);
            for (let sous_famille of famille.sous_familles) {
                await repositories_1.categoryRepository.delete({ sous_famille });
                await repositories_1.sousFamillesRepository.delete(sous_famille.id);
            }
            await repositories_1.familleRepository.delete(famille.id);
            return response.json({
                message: "Famille est supprimé",
            });
        }
    }
}
exports.FamilleService = FamilleService;
//# sourceMappingURL=famille.service.js.map