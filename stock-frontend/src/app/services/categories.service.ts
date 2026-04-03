import { Injectable } from '@angular/core';
import { FilterOptions } from './sous-familles.service';
import { HttpClient } from '@angular/common/http';
import {
  CreerCategorieModel,
  ModifierCategorieModel,
} from '../models/categories.model';
import { environement } from '../../../environement';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  private readonly url =
    `${environement.api_url}/classement/categorie`;

  constructor(private readonly httpClient: HttpClient) {}

  public fetchCategories(page: number, options: FetchCategoriesOptions) {
    let baseUrl = `${this.url}/liste?page=${page}`;
    if (options.query) baseUrl += `&query=${options.query.toLowerCase()}`;
    if (options.sousFamilleId)
      baseUrl += `&sousFamilleId=${options.sousFamilleId}`;

    return this.httpClient.get(baseUrl, {
      withCredentials: true,
    });
  }

  public creerCatégorie(data: CreerCategorieModel) {
    return this.httpClient.post(`${this.url}/creer`, data, {
      withCredentials: true,
    });
  }

  public modifierCategorie(data: ModifierCategorieModel) {
    return this.httpClient.put(`${this.url}/modifier`, data, {
      withCredentials: true,
    });
  }

  public deleteCategorie(id: number) {
    return this.httpClient.delete(`${this.url}/supprimer?category_id=${id}`, {
      withCredentials: true,
    });
  }
}

export interface FetchCategoriesOptions {
  query?: string;
  sousFamilleId?: string;
}
