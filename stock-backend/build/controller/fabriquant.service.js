"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FabriquantService = void 0;
require("dotenv/config");
const fetch_util_1 = require("../utilities/fetch.util");
const Fabriquant_1 = require("../entity/Fabriquant");
const repositories_1 = require("../repository/repositories");
const typeorm_1 = require("typeorm");
class FabriquantService {
    async ajouterFabriquant(request, response) {
        const data = request.body;
        const nouveauFabriquant = new Fabriquant_1.Fabriquant();
        nouveauFabriquant.nom = data.nom;
        nouveauFabriquant.adresse = data.adresse;
        nouveauFabriquant.contact = data.contact;
        repositories_1.fabriquantRepository
            .save(nouveauFabriquant)
            .then(() => {
            response.json({
                message: "Fabriquant est ajouté",
                fabriquant: nouveauFabriquant,
            });
        })
            .catch(() => {
            response.status(500).json({
                message: "Un erreur est survenu",
            });
        });
    }
    async listeFabriquants(request, response) {
        const data = request.query;
        const pageNum = Number(data.page);
        const page = Number.isNaN(pageNum) ? 1 : pageNum;
        let options = {};
        if (data.query)
            options.nom = (0, typeorm_1.Raw)((alias) => `Lower(${alias}) LIKE LOWER(:nom)`, {
                nom: `%${data.query}%`,
            });
        if (data.adresse)
            options.adresse = (0, typeorm_1.Raw)((alias) => `Lower(${alias}) LIKE LOWER(:adresse)`, {
                adresse: `%${data.adresse}%`,
            });
        if (data.contact) {
            options.contact = (0, typeorm_1.Raw)((alias) => `Lower(${alias}) LIKE LOWER(:contact)`, {
                contact: `%${data.contact}%`,
            });
        }
        if (data.code)
            options.code = Number(data.code);
        /* ---------------  NEW LOGIC --------------- */
        if (page === 0) {
            // return everything, no pagination
            const fabriquants = await repositories_1.fabriquantRepository.find({
                where: options,
            });
            return response.json({ fabriquants, count: fabriquants.length });
        }
        /* ------------------------------------------ */
        const maxPerPage = Number(process.env.MAX_PER_PAGE) || 20;
        const [fabriquants, total] = await repositories_1.fabriquantRepository.findAndCount({
            skip: (page - 1) * maxPerPage,
            take: maxPerPage,
            where: options,
        });
        const totalPages = Math.ceil(total / maxPerPage);
        response.json({
            fabriquants,
            count: fabriquants.length,
            totalPages,
            lastPage: page >= totalPages,
        });
    }
    async modifierFabriquant(request, response) {
        const data = request.body;
        (0, fetch_util_1.fetchFabriquant)(data.code_fabriquant)
            .then((fournisseur) => {
            fournisseur.nom = data.nom;
            fournisseur.adresse = data.adresse;
            fournisseur.contact = data.contact;
            repositories_1.fabriquantRepository
                .save(fournisseur)
                .then(() => {
                response.json({
                    message: "Fabriquant est modifié",
                });
            })
                .catch((err) => {
                console.log(err);
                response.status(500).json({
                    message: "Un erreur est survenu.",
                });
            });
        })
            .catch(() => {
            response.status(404).json({
                message: "Fabriquant n'est pas trouvé",
            });
        });
    }
    async supprimerFabriquant(request, response) {
        const { code } = request.query;
        repositories_1.fabriquantRepository
            .delete(code)
            .then(() => {
            response.json({
                message: "Fabriquant est supprimé",
            });
        })
            .catch((err) => {
            console.log(err);
            response.status(500).json({
                message: "Un erreur est survenu.",
            });
        });
    }
}
exports.FabriquantService = FabriquantService;
//# sourceMappingURL=fabriquant.service.js.map