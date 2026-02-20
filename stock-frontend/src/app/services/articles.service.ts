import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Article, ArticleListResponseModel } from '../models/articles.model';

@Injectable({
  providedIn: 'root',
})
export class ArticlesService {
  private readonly url: string = 'http://localhost:4000/api/articles';

  constructor(private readonly httpClient: HttpClient) {}

  public fetchProducts(
    page: number,
    options?: any,
  ): Observable<ArticleListResponseModel> {
    let queryParams = `?page=${page}`;

    if (options) {
      if (options.searching && options.query) {
        queryParams += `&query=${options.query}`;
      }
      if (options.filtering) {
        if (options.depotId) queryParams += `&depotId=${options.depotId}`;
        if (options.categorieId)
          queryParams += `&categorieId=${options.categorieId}`;
        if (options.prixMoyenne)
          queryParams += `&prixMoyenne=${options.prixMoyenne}`;
        if (options.stockActuel)
          queryParams += `&stockActuel=${options.stockActuel}`;
        if (options.stockMinimum)
          queryParams += `&stockMinimum=${options.stockMinimum}`;
        if (options.uniteId) queryParams += `&uniteId=${options.uniteId}`;
      }
    }

    console.log(queryParams);

    return this.httpClient.get<ArticleListResponseModel>(
      `${this.url}/liste${queryParams}`,
      {
        withCredentials: true,
      },
    );
  }

  public creerArticle(payload: {
    nom: string;
    stockMin: number;
    depotId: number;
    uniteId: number;
    categorieId: number;
  }) {
    return this.httpClient.post<{ message: string; article: Article }>(
      `${this.url}/creer`,
      payload,
      { withCredentials: true },
    );
  }

  // NEW: Update article
  public modifierArticle(payload: {
    id: number;
    nom: string;
    stockMin: number;
    depotId: number;
    uniteId: number;
    categorieId: number;
  }) {
    return this.httpClient.put<{ message: string }>(
      `${this.url}/modifier`,
      payload,
      { withCredentials: true },
    );
  }

  // NEW: Delete article
  public supprimerArticle(id: number) {
    return this.httpClient.delete<{ message: string }>(
      `${this.url}/supprimer?id=${id}`,
      { withCredentials: true },
    );
  }

  public fetchFournisseurs(articleId: number) {
    return this.httpClient.get(
      `${this.url}/fournisseur-list?articleId=${articleId}`,
      { withCredentials: true },
    );
  }
}
