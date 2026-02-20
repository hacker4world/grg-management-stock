import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ChantierListResponse,
  ChantierModel,
  CreateChantierModel,
  ModifierChantier,
} from '../models/chantier.model';

@Injectable({ providedIn: 'root' })
export class ChantiersService {
  private readonly url = 'http://localhost:4000/api/chantier';

  constructor(private readonly http: HttpClient) {}

  fetchChantiers(page: number, options?: ListOptions) {
    let base = `${this.url}/liste?page=${page}`;
    if (options) {
      if (options.searching) base += `&query=${options.query}`;
      if (options.filtering) {
        if (options.adresse) base += `&adresse=${options.adresse}`;
        if (options.compteId) base += `&compteId=${options.compteId}`;
      }
    }

    return this.http.get<ChantierListResponse>(base, { withCredentials: true });
  }

  ajouterChantier(data: CreateChantierModel) {
    return this.http.post<{ chantier: ChantierModel }>(
      `${this.url}/ajouter`,
      data,
      { withCredentials: true },
    );
  }

  modifierChantier(data: ModifierChantier) {
    return this.http.put(`${this.url}/modifier`, data, {
      withCredentials: true,
    });
  }

  deleteChantier(code: string) {
    return this.http.delete(`${this.url}/supprimer?code_chantier=${code}`, {
      withCredentials: true,
    });
  }

  exportChantiers(chantiers: ChantierModel[]) {
    return this.http.post(
      `${this.url}/export-chantiers`,
      { chantierList: chantiers },
      { withCredentials: true, responseType: 'blob' },
    );
  }
}

export interface ListOptions {
  searching: boolean;
  query: string;
  filtering: boolean;
  code: string;
  adresse: string;
  compteId?: number;
}
