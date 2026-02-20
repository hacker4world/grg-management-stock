import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  CreateFamilleModel,
  ModifierFamilleModel,
} from '../models/familles.model';

@Injectable({
  providedIn: 'root',
})
export class FamillesService {
  private readonly url = 'http://localhost:4000/api/classement/familles';

  constructor(private readonly httpClient: HttpClient) {}

  public fetchFamilles(page: number) {
    return this.httpClient.get(`${this.url}/liste?page=${page}`, {
      withCredentials: true,
    });
  }

  public listeFamilles() {
    return this.httpClient.get(`${this.url}/tous`, {
      withCredentials: true,
    });
  }

  public chercherFamilles(page: number, search: string) {
    return this.httpClient.get(
      `${this.url}/recherche?page=${page}&search=${search}`,
      {
        withCredentials: true,
      }
    );
  }

  public ajouterFamille(data: CreateFamilleModel) {
    return this.httpClient.post(`${this.url}/creer`, data, {
      withCredentials: true,
    });
  }

  public modifierFamille(data: ModifierFamilleModel) {
    return this.httpClient.put(`${this.url}/modifier`, data, {
      withCredentials: true,
    });
  }

  public supprimerFamille(id: number, cascade: boolean) {
    return this.httpClient.delete(
      `${this.url}/supprimer?id=${id}&cascade=${cascade ? 'yes' : 'no'}`,
      {
        withCredentials: true,
      }
    );
  }
}
