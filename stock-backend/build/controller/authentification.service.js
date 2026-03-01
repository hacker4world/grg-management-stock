"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthentificationService = void 0;
const bcrypt_util_1 = require("../utilities/bcrypt.util");
const jwt_util_1 = require("../utilities/jwt.util");
const repositories_1 = require("../repository/repositories");
const middleware_1 = require("../middleware");
const Compte_1 = require("../entity/Compte");
const fetch_util_1 = require("../utilities/fetch.util");
require("dotenv/config");
const typeorm_1 = require("typeorm");
class AuthentificationService {
    async signup(request, response) {
        const data = request.body;
        const existingUser = await repositories_1.compteRepository.findOne({
            where: { nom_utilisateur: data.nom_utilisateur },
        });
        if (existingUser)
            return response.status(400).json({
                message: "Nom d'utilisateur deja existe",
            });
        const newAccount = new Compte_1.Compte();
        newAccount.nom = data.nom;
        newAccount.prenom = data.prenom;
        newAccount.nom_utilisateur = data.nom_utilisateur;
        newAccount.confirme = false;
        newAccount.motdepasse = await (0, bcrypt_util_1.hashPassword)(data.motdepasse);
        repositories_1.compteRepository
            .save(newAccount)
            .then(() => response.status(200).json({
            message: "Compte est crée",
        }))
            .catch((err) => {
            console.log(err);
            response.status(500).json({
                message: "Un erreur est survenu",
            });
        });
    }
    async login(request, response) {
        console.log("request received");
        const data = request.body;
        const account = await repositories_1.compteRepository.findOne({
            where: { nom_utilisateur: data.nom_utilisateur },
        });
        if (!account)
            return response.status(401).json({
                message: "Nom d'utilisateur ou mot de passe invalide",
            });
        let correct_password = await (0, bcrypt_util_1.comparePassword)(data.motdepasse, account.motdepasse);
        if (!correct_password)
            return response.status(401).json({
                message: "Nom d'utilisateur ou mot de passe invalide",
            });
        if (!account.confirme)
            return response.status(401).json({
                message: "Compte n'est pas vérifié",
            });
        let token = (0, jwt_util_1.generateToken)({
            user_id: account.id,
        });
        // Set cookie for web browsers
        response.cookie("token", token, {
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
            sameSite: "lax",
        });
        // Also return token in body for mobile apps
        return response.json({
            role: account.role,
            token: token, // For mobile apps
            account: {
                id: account.id,
                nom_utilisateur: account.nom_utilisateur,
                role: account.role,
            },
        });
    }
    async logout(request, response) {
        response.clearCookie("token", {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
        });
        response.json({
            message: "Logout successful",
        });
    }
    async refreshToken(request, response) {
        const token = (0, middleware_1.extractToken)(request);
        if (!token) {
            return response.status(401).json({ message: "Token requis" });
        }
        const result = (0, jwt_util_1.verifyExpiredToken)(token);
        if (!result.success) {
            return response.status(401).json({
                message: "Token invalide ou expiré depuis trop longtemps",
            });
        }
        const compte = await (0, fetch_util_1.fetchCompte)(result.payload.user_id);
        if (!compte || !compte.confirme) {
            return response.status(401).json({ message: "Compte introuvable ou désactivé" });
        }
        const newToken = (0, jwt_util_1.generateToken)({ user_id: compte.id });
        response.cookie("token", newToken, {
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
            sameSite: "lax",
        });
        return response.json({
            token: newToken,
            account: {
                id: compte.id,
                nom_utilisateur: compte.nom_utilisateur,
                role: compte.role,
            },
        });
    }
    async verifierCompte(request, response) {
        // authenticate middleware has already set req.user
        const compte = request.user;
        return response.json({
            role: compte.role,
            account: {
                id: compte.id,
                nom: compte.nom,
                prenom: compte.prenom,
                nom_utilisateur: compte.nom_utilisateur,
                role: compte.role,
                confirme: compte.confirme,
            },
        });
    }
    async accepterCompte(request, response) {
        const data = request.body;
        let compte = await (0, fetch_util_1.fetchCompte)(data.compte_id);
        if (!compte)
            return response.status(404).json({
                message: "Compte n'est pas trouvé",
            });
        if (compte.confirme)
            return response.status(400).json({
                message: "Compte déja accepté",
            });
        compte.confirme = true;
        compte.role = data.role;
        repositories_1.compteRepository
            .save(compte)
            .then(() => {
            response.json({
                message: "Compte est accepté",
            });
        })
            .catch((err) => {
            console.log(err);
            return response.status(500).json({
                message: "Un erreur est survenu",
            });
        });
    }
    async refuserCompte(request, response) {
        const data = request.body;
        let compte = await (0, fetch_util_1.fetchCompte)(data.compte_id);
        if (!compte)
            return response.status(404).json({
                message: "Compte n'est pas trouvé",
            });
        repositories_1.compteRepository
            .delete(compte)
            .then(() => {
            response.json({
                message: "Compte est supprimé",
            });
        })
            .catch((err) => {
            response.status(500).json({
                message: "Un erreur est survenu",
            });
        });
    }
    async listeComptes(request, response) {
        const data = request.query;
        /* 1. Read page – default to 1 for normal pagination */
        const rawPage = Number(data.page);
        const page = Number.isNaN(rawPage) ? 1 : rawPage;
        const maxPerPage = Number(process.env.MAX_PER_PAGE);
        /* 2. Build the WHERE clause (filters stay identical) */
        const options = { confirme: true };
        if (data.code)
            options.id = data.code;
        if (data.nom)
            options.nom = (0, typeorm_1.Raw)((alias) => `LOWER(${alias}) LIKE LOWER(:nom)`, {
                nom: `%${data.nom}%`,
            });
        if (data.prenom)
            options.prenom = (0, typeorm_1.Raw)((alias) => `LOWER(${alias}) LIKE LOWER(:prenom)`, {
                prenom: `%${data.prenom}%`,
            });
        if (data.nom_utilisateur)
            options.nom_utilisateur = (0, typeorm_1.Raw)((alias) => `LOWER(${alias}) LIKE LOWER(:nom_utilisateur)`, { nom_utilisateur: `%${data.nom_utilisateur}%` });
        if (data.role)
            options.role = (0, typeorm_1.Raw)((alias) => `LOWER(${alias}) LIKE LOWER(:role)`, {
                role: `%${data.role}%`,
            });
        /* 3. Decide whether to paginate or not */
        const shouldPaginate = page !== 0;
        const findOptions = {
            select: {
                id: true,
                nom: true,
                nom_utilisateur: true,
                prenom: true,
                role: true,
                confirme: true,
            },
            where: options,
        };
        if (shouldPaginate) {
            findOptions.skip = (page - 1) * maxPerPage;
            findOptions.take = maxPerPage;
        }
        /* 4. Run the query */
        const [comptes, total] = await repositories_1.compteRepository.findAndCount(findOptions);
        /* 5. Build the response */
        const totalPages = shouldPaginate ? Math.ceil(total / maxPerPage) : 1;
        response.json({
            comptes,
            count: comptes.length,
            totalPages,
            lastPage: shouldPaginate ? page >= totalPages : true,
        });
    }
    async listeComptesNonAccepté(request, response) {
        const data = request.query;
        const page = data.page !== undefined ? Number(data.page) : 0;
        const maxPerPage = Number(process.env.MAX_PER_PAGE) || 20;
        let options = { confirme: false };
        if (data.code)
            options.id = data.code;
        if (data.nom)
            options.nom = (0, typeorm_1.Raw)((alias) => `Lower(${alias}) LIKE LOWER(:nom)`, {
                nom: `%${data.nom}%`,
            });
        if (data.prenom)
            options.prenom = (0, typeorm_1.Raw)((alias) => `Lower(${alias}) LIKE LOWER(:prenom)`, {
                prenom: `%${data.prenom}%`,
            });
        if (data.role)
            options.role = (0, typeorm_1.Raw)((alias) => `Lower(${alias}) LIKE LOWER(:role)`, {
                role: `%${data.role}%`,
            });
        const findOptions = {
            select: {
                id: true,
                nom: true,
                nom_utilisateur: true,
                prenom: true,
                role: true,
                confirme: true,
            },
            where: options,
        };
        if (page !== 0) {
            findOptions.skip = (page - 1) * maxPerPage;
            findOptions.take = maxPerPage;
        }
        const [comptes, total] = await repositories_1.compteRepository.findAndCount(findOptions);
        const totalPages = page === 0 ? 1 : Math.ceil(total / maxPerPage);
        response.json({
            comptes,
            count: comptes.length,
            totalPages,
            lastPage: page === 0 ? true : page >= totalPages,
        });
    }
    async deleteCompte(request, response) {
        const { compte_id } = request.query;
        if (!compte_id) {
            return response.status(400).json({
                message: "compte_id est requis",
            });
        }
        try {
            const compte = await (0, fetch_util_1.fetchCompte)(Number(compte_id));
            if (!compte) {
                return response.status(404).json({
                    message: "Compte n'est pas trouvé",
                });
            }
            await repositories_1.compteRepository.delete(compte.id);
            return response.json({
                message: "Compte est supprimé",
            });
        }
        catch (err) {
            console.log(err);
            return response.status(500).json({
                message: "Un erreur est survenu",
            });
        }
    }
    async updateCompte(request, response) {
        const updateData = request.body;
        if (!updateData.code_compte) {
            return response.status(400).json({
                message: "compte_id est requis",
            });
        }
        try {
            const compte = await (0, fetch_util_1.fetchCompte)(Number(updateData.code_compte));
            if (!compte) {
                return response.status(404).json({
                    message: "Compte n'est pas trouvé",
                });
            }
            if (!compte.confirme) {
                return response.status(400).json({
                    message: "Compte n'est pas confirmé",
                });
            }
            // Update only allowed fields
            if (updateData.nom)
                compte.nom = updateData.nom;
            if (updateData.prenom)
                compte.prenom = updateData.prenom;
            if (updateData.nomUtilisateur)
                compte.nom_utilisateur = updateData.nomUtilisateur;
            if (updateData.role)
                compte.role = updateData.role;
            await repositories_1.compteRepository.save(compte);
            return response.json({
                message: "Compte est modifié",
                compte: {
                    id: compte.id,
                    nom: compte.nom,
                    prenom: compte.prenom,
                    nom_utilisateur: compte.nom_utilisateur,
                    role: compte.role,
                    confirme: compte.confirme,
                },
            });
        }
        catch (err) {
            console.log(err);
            return response.status(500).json({
                message: "Un erreur est survenu",
            });
        }
    }
}
exports.AuthentificationService = AuthentificationService;
//# sourceMappingURL=authentification.service.js.map