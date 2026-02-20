import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ModifierCompteConfirme } from '../models/comptes-confirmes.model';

@Injectable({
  providedIn: 'root',
})
export class ComptesConfirmesService {
  private readonly url = 'http://localhost:4000/api/authentification';

  constructor(private readonly httpClient: HttpClient) {}

  public fetchComptesConfirmes(page: number, options: ListOptions) {
    let baseUrl = `${this.url}/liste?page=${page}`;
    if (options.searching) baseUrl += `&nom=${options.query}`;
    if (options.filtering) {
      if (options.code) baseUrl += `&code=${options.code}`;
      if (options.prenom) baseUrl += `&prenom=${options.prenom}`;
      if (options.nomUtilisateur)
        baseUrl += `&nom_utilisateur=${options.nomUtilisateur}`;
      if (options.role) baseUrl += `&role=${options.role}`;
    }

    console.log(baseUrl);

    return this.httpClient.get(baseUrl, {
      withCredentials: true,
    });
  }

  public modifierCompteConfirme(data: ModifierCompteConfirme) {
    console.log(data);

    return this.httpClient.put(`${this.url}/modifier`, data, {
      withCredentials: true,
    });
  }

  public deleteCompteConfirme(code: string) {
    return this.httpClient.delete(`${this.url}/supprimer?compte_id=${code}`, {
      withCredentials: true,
    });
  }
}

export interface ListOptions {
  searching: boolean;
  query: string;
  filtering: boolean;
  code: string;
  prenom: string;
  nomUtilisateur: string;
  role: string;
}
