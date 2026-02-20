import { Article } from "../entity/Article";
import { Categorie } from "../entity/Categorie";
import { Chantier } from "../entity/Chantier";
import { Fabriquant } from "../entity/Fabriquant";
import { Famille } from "../entity/Famille";
import { Fournisseur } from "../entity/Fournisseur";
import { SousFamille } from "../entity/SousFamille";
import {
  articlesRepositoy,
  categoryRepository,
  chantierRepository,
  compteRepository,
  demandeArticlesRepository,
  fabriquantRepository,
  familleRepository,
  fournisseurRepository,
  sousFamillesRepository,
} from "../repository/repositories";

export async function fetchArticle(id: number): Promise<Article | null> {
  return articlesRepositoy.findOne({
    where: { id },
    relations: {
      depot: true,
      unite: true,
      categorie: true,
    },
  });
}

export function fetchChantier(code: number): Promise<Chantier> {
  return chantierRepository.findOne({
    where: { code },
    relations: { compte: true },
  });
}

export function fetchFabriquant(code: number): Promise<Fabriquant> {
  return fabriquantRepository.findOne({ where: { code } });
}

export function fetchFournisseurs(id: number): Promise<Fournisseur> {
  return fournisseurRepository.findOne({ where: { code: id } });
}

export function fetchCompte(id: number) {
  return compteRepository.findOne({ where: { id } });
}

export function fetchCategory(id: number): Promise<Categorie> {
  return categoryRepository.findOne({ where: { id } });
}

export function fetchFamille(id: number): Promise<Famille> {
  return familleRepository.findOne({
    where: { id },
  });
}

export function fetchSousFamilles(id: number): Promise<SousFamille> {
  return sousFamillesRepository.findOne({ where: { id } });
}

export async function fetchDemandeArticle(id: number) {
  return demandeArticlesRepository.findOne({
    where: { id },
    relations: { chantier: true, items: { article: true } },
  });
}
