import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  CreateFabriquantModel,
  ModifierFabriquant,
} from '../models/fabriquants.model';

@Injectable({
  providedIn: 'root',
})
export class FabriquantsService {
  private readonly url = 'http://localhost:4000/api/fabriquants';

  constructor(private readonly httpClient: HttpClient) {}

  public fetchFabriquants(page: number, options: ListOptions) {
    let baseUrl = `${this.url}/liste?page=${page}`;

    if (options.searching) baseUrl += `&query=${options.query}`;
    if (options.filtering) {
      if (options.code) baseUrl += `&code=${options.code}`;
      if (options.adresse) baseUrl += `&adresse=${options.adresse}`;
      if (options.contact) baseUrl += `&contact=${options.contact}`;
    }

    return this.httpClient.get(baseUrl, {
      withCredentials: true,
    });
  }

  public ajouterFabriquant(data: CreateFabriquantModel) {
    return this.httpClient.post(`${this.url}/ajouter`, data, {
      withCredentials: true,
    });
  }

  public modifierFabriquant(data: ModifierFabriquant) {
    console.log(data);

    return this.httpClient.put(`${this.url}/modifier`, data, {
      withCredentials: true,
    });
  }

  public deleteFabriquant(code: string) {
    console.log(`${this.url}/supprimer?code=${code}`);

    return this.httpClient.delete(`${this.url}/supprimer?code=${code}`, {
      withCredentials: true,
    });
  }
}

export interface ListOptions {
  searching: boolean;
  query: string;
  filtering: boolean;
  code: string;
  adresse: string;
  contact: string;
}
