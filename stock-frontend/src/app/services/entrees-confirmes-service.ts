import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EntreeConfirmeeListResponse } from '../models/entrees-confirmes.model';

@Injectable({ providedIn: 'root' })
export class EntreesConfirmesService {
  private readonly base = 'http://localhost:4000/api/entree';

  constructor(private http: HttpClient) {}

  fetchEntrees(
    page: number,
    options: {
      searching?: boolean;
      query?: string;
      filtering?: boolean;
      code?: string;
      fournisseur?: string;
      article?: string;
      fabriquant?: string;
      magazinier?: string;
      date?: string;
      stock_entree?: number;
    },
  ): Observable<EntreeConfirmeeListResponse> {
    const params: any = { page: page.toString() };

    if (options.searching && options.query) {
      params.code = options.query;
    }

    if (options.filtering) {
      if (options.fournisseur) params.fournisseurId = options.fournisseur;
      if (options.article) params.articleId = options.article;
      if (options.fabriquant) params.fabriquantId = options.fabriquant;
      if (options.magazinier) params.compteId = options.magazinier;
      if (options.date) params.date = options.date;
      if (options.stock_entree)
        params.stock_entree = Number(options.stock_entree);
    }

    console.log(params);

    return this.http.get<EntreeConfirmeeListResponse>(
      `${this.base}/liste-confirme`,
      { params, withCredentials: true },
    );
  }

  modifierEntree(data: {
    code_entree: string;
    stock_entree: number;
    date: string;
    code_fournisseur: string;
  }) {
    return this.http.put(`${this.base}/modifier`, data, {
      withCredentials: true,
    });
  }

  supprimerEntree(code: string) {
    return this.http.delete(`${this.base}/supprimer?code=${code}`, {
      withCredentials: true,
    });
  }
}
