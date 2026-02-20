import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  CreateFournisseurModel,
  ModifierFournisseurModel,
} from '../models/fournisseurs.model';

@Injectable({ providedIn: 'root' })
export class FournisseursService {
  private readonly url = 'http://localhost:4000/api/fournisseurs';

  constructor(private readonly http: HttpClient) {}

  public fetchFournisseurs(page: number, options: ListOptions) {
    let baseUrl = `${this.url}/liste?page=${page}`;
    if (options.adresse) baseUrl += `&adresse=${options.adresse}`;
    if (options.contact) baseUrl += `&contact=${options.contact}`;
    if (options.nom) baseUrl += `&nom=${options.nom}`;

    console.log(baseUrl);

    return this.http.get(baseUrl, {
      withCredentials: true,
    });
  }

  public ajouterFournisseur(data: CreateFournisseurModel) {
    return this.http.post(`${this.url}/ajouter`, data, {
      withCredentials: true,
    });
  }

  public modifierFournisseur(data: ModifierFournisseurModel) {
    return this.http.put(`${this.url}/modifier`, data, {
      withCredentials: true,
    });
  }

  public supprimerFournisseur(id: number) {
    return this.http.delete(`${this.url}/supprimer?code_fournisseur=${id}`, {
      withCredentials: true,
    });
  }
}

export interface ListOptions {
  nom?: string;
  contact?: string;
  adresse?: string;
}
