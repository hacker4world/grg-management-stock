import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreerSousFamilleModel } from '../models/sous-familles.model';

@Injectable({
  providedIn: 'root',
})
export class SousFamillesService {
  private readonly url = 'http://localhost:4000/api/classement/sous-famille';

  constructor(private readonly httpClient: HttpClient) {}

  public fetchSousFamilles(page: number) {
    return this.httpClient.get(`${this.url}/liste?page=${page}`, {
      withCredentials: true,
    });
  }

  public filtrerSousFamilles(page: number, options: FilterOptions) {
    let filterUrl = `${this.url}/filtrer?page=${page}&`;
    if (options.query) filterUrl += `nom=${options.query}&`;
    if (options.familleId) filterUrl += `familleId=${options.familleId}`;

    console.log(filterUrl);

    return this.httpClient.get(filterUrl, {
      withCredentials: true,
    });
  }

  public creerSousFamille(sousFamilleData: CreerSousFamilleModel) {
    console.log(sousFamilleData);

    return this.httpClient.post(`${this.url}/creer`, sousFamilleData, {
      withCredentials: true,
    });
  }

  public modifierSousFamille(sousFamilleData: CreerSousFamilleModel) {
    return this.httpClient.put(`${this.url}/modifier`, sousFamilleData, {
      withCredentials: true,
    });
  }

  public supprimerSousFamille(id: number, cascade: boolean) {
    return this.httpClient.delete(
      `${this.url}/supprimer?id=${id}&cascade=${cascade ? 'yest' : 'no'}`,
      {
        withCredentials: true,
      }
    );
  }
}

export interface FilterOptions {
  familleId?: string;
  query?: string;
}
