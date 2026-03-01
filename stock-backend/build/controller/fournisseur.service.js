"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FournisseurService = void 0;
require("dotenv/config");
const Fournisseur_1 = require("../entity/Fournisseur");
const repositories_1 = require("../repository/repositories");
const fetch_util_1 = require("../utilities/fetch.util");
const typeorm_1 = require("typeorm");
class FournisseurService {
    async creerFournisseur(request, response) {
        const fournisseurData = request.body;
        const nouveauFournisseur = new Fournisseur_1.Fournisseur();
        nouveauFournisseur.nom = fournisseurData.nom;
        nouveauFournisseur.adresse = fournisseurData.adresse;
        nouveauFournisseur.contact = fournisseurData.contact;
        repositories_1.fournisseurRepository
            .save(nouveauFournisseur)
            .then(() => {
            return response.status(201).json({
                message: "Fournisseur ajouté.",
                fournisseur: nouveauFournisseur,
            });
        })
            .catch((err) => {
            console.log(err);
            return response.status(500).json({
                message: "Un erreur est survenu.",
            });
        });
    }
    async listeFournisseurs(request, response) {
        const { page = 0, nom, contact, adresse } = request.query;
        const currentPage = Number(page);
        const maxPerPage = Number(process.env.MAX_PER_PAGE);
        const whereClause = {};
        if (nom) {
            whereClause.nom = (0, typeorm_1.Raw)((alias) => `LOWER(${alias}) LIKE LOWER(:nom)`, {
                nom: `%${nom}%`,
            });
        }
        if (contact) {
            whereClause.contact = (0, typeorm_1.Raw)((alias) => `LOWER(${alias}) LIKE LOWER(:contact)`, { contact: `%${contact}%` });
        }
        if (adresse) {
            whereClause.adresse = (0, typeorm_1.Raw)((alias) => `LOWER(${alias}) LIKE LOWER(:adresse)`, { adresse: `%${adresse}%` });
        }
        /* ----------  NEW LOGIC  ---------- */
        let fournisseurs;
        let total;
        if (currentPage === 0) {
            // fetch all rows, no pagination
            [fournisseurs, total] = await repositories_1.fournisseurRepository.findAndCount({
                where: whereClause,
            });
        }
        else {
            // classic paginated fetch
            [fournisseurs, total] = await repositories_1.fournisseurRepository.findAndCount({
                skip: (currentPage - 1) * maxPerPage,
                take: maxPerPage,
                where: whereClause,
            });
        }
        /* ---------------------------------- */
        const totalPages = currentPage === 0 ? 1 : Math.ceil(total / maxPerPage);
        return response.json({
            fournisseurs,
            count: fournisseurs.length,
            totalPages,
            lastPage: currentPage === 0 ? true : currentPage >= totalPages,
        });
    }
    async modifierFournisseur(request, response) {
        const data = request.body;
        (0, fetch_util_1.fetchFournisseurs)(data.code_fournisseur)
            .then((fournisseur) => {
            fournisseur.nom = data.nom;
            fournisseur.adresse = data.adresse;
            fournisseur.contact = data.contact;
            repositories_1.fournisseurRepository
                .save(fournisseur)
                .then(() => {
                response.json({
                    message: "Fournisseur est modifié",
                });
            })
                .catch((err) => {
                console.log(err);
                response.status(500).json({
                    message: "Un erreur est survenu.",
                });
            });
        })
            .catch((err) => {
            response.status(404).json({
                message: "Fournisseur n'est pas trouvé",
            });
        });
    }
    async supprimerFournisseur(request, response) {
        const fournisseurId = Number(request.query.code_fournisseur);
        repositories_1.fournisseurRepository
            .delete(fournisseurId)
            .then(() => {
            return response.json({
                message: "Fournisseur est supprimé",
            });
        })
            .catch((err) => {
            console.log(err);
            return response.status(500).json({
                message: "Un erreur est survenu.",
            });
        });
    }
}
exports.FournisseurService = FournisseurService;
//# sourceMappingURL=fournisseur.service.js.map