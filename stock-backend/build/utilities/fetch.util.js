"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchArticle = fetchArticle;
exports.fetchChantier = fetchChantier;
exports.fetchFabriquant = fetchFabriquant;
exports.fetchFournisseurs = fetchFournisseurs;
exports.fetchCompte = fetchCompte;
exports.fetchCategory = fetchCategory;
exports.fetchFamille = fetchFamille;
exports.fetchSousFamilles = fetchSousFamilles;
exports.fetchDemandeArticle = fetchDemandeArticle;
const repositories_1 = require("../repository/repositories");
async function fetchArticle(id) {
    return repositories_1.articlesRepositoy.findOne({
        where: { id },
        relations: {
            depot: true,
            unite: true,
            categorie: true,
        },
    });
}
function fetchChantier(code) {
    return repositories_1.chantierRepository.findOne({
        where: { code },
        relations: { compte: true },
    });
}
function fetchFabriquant(code) {
    return repositories_1.fabriquantRepository.findOne({ where: { code } });
}
function fetchFournisseurs(id) {
    return repositories_1.fournisseurRepository.findOne({ where: { code: id } });
}
function fetchCompte(id) {
    return repositories_1.compteRepository.findOne({ where: { id } });
}
function fetchCategory(id) {
    return repositories_1.categoryRepository.findOne({ where: { id } });
}
function fetchFamille(id) {
    return repositories_1.familleRepository.findOne({
        where: { id },
    });
}
function fetchSousFamilles(id) {
    return repositories_1.sousFamillesRepository.findOne({ where: { id } });
}
async function fetchDemandeArticle(id) {
    return repositories_1.demandeArticlesRepository.findOne({
        where: { id },
        relations: { chantier: true, items: { article: true } },
    });
}
//# sourceMappingURL=fetch.util.js.map