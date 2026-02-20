import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EntreeEnAttenteModel {
  id: string;
  stockEntree: number;
  date: string;
  fournisseur: { nom: string };
  article: { nom: string };
}

export interface EntreeEnAttenteListResponse {
  entrees: EntreeEnAttenteModel[];
  lastPage: boolean;
}

@Injectable({ providedIn: 'root' })
export class EntreesEnAttenteService {
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
      date?: string;
      stock_entree?: number;
      fabriquant?: string;
      magazinier?: string;
    },
  ): Observable<EntreeEnAttenteListResponse> {
    const params: any = { page: page.toString() };

    if (options.searching && options.query) {
      params.code = options.query;
    }
    if (options.filtering) {
      if (options.fournisseur) params.fournisseurId = options.fournisseur;
      if (options.article) params.articleId = options.article;
      if (options.date) params.date = options.date;
      if (options.stock_entree) params.stockEntree = options.stock_entree;
      if (options.fabriquant) params.fabriquantId = options.fabriquant;
      if (options.magazinier) params.compteId = options.magazinier;
    }

    console.log(params);

    return this.http.get<EntreeEnAttenteListResponse>(
      `${this.base}/liste-pending`,
      {
        params,
        withCredentials: true,
      },
    );
  }

  fetchEntreesConfirmes(
    page: number,
    options: {
      searching?: boolean;
      query?: string;
      filtering?: boolean;
      code?: string;
      fournisseur?: string;
      article?: string;
      date?: string;
      stock_entree?: number;
      fabriquantId?: number;
    },
  ): Observable<EntreeEnAttenteListResponse> {
    const params: any = { page: page.toString() };

    if (options.searching && options.query) {
      params.code = options.query;
    }
    if (options.filtering) {
      if (options.fournisseur) params.fournisseurId = options.fournisseur;
      if (options.article) params.articleId = options.article;
      if (options.date) params.date = options.date;
      if (options.stock_entree) params.stockEntree = options.stock_entree;
    }

    console.log(params);

    return this.http.get<EntreeEnAttenteListResponse>(
      `${this.base}/liste-confirme`,
      {
        params,
        withCredentials: true,
      },
    );
  }

  ajouterEntree(
    data: {
      fournisseurId: number;
      fabriquantId: number;
      items: Array<{ articleId: number; stockEntree: number; prix: number }>;
      observation?: string;
      compteId: number;
    },
    bandeCommande: File,
    bandeLivraison: File,
  ): Observable<any> {
    const form = new FormData();

    form.append('fournisseurId', data.fournisseurId.toString());
    form.append('fabriquantId', data.fabriquantId.toString());
    form.append('compteId', String(data.compteId));

    // The backend expects a JSON string for the items array
    form.append('items', JSON.stringify(data.items));

    if (data.observation) form.append('observation', data.observation);

    form.append('bande_commande', bandeCommande);
    form.append('bande_livraison', bandeLivraison);

    return this.http.post(`${this.base}/ajouter`, form, {
      withCredentials: true,
    });
  }

  public modifierEntree(data: {
    code_entree: string;
    stock_entree: number;
    date: string;
    code_fournisseur: string;
    code_article: string;
  }): Observable<any> {
    return this.http.put(`${this.base}/modifier`, data, {
      withCredentials: true,
    });
  }

  public supprimerEntree(code: string): Observable<any> {
    return this.http.put(
      `${this.base}/traiter`,
      {
        entreeId: code,
        action: 'deny',
      },
      { withCredentials: true },
    );
  }

  public validerEntree(code: string) {
    return this.http.put(
      `${this.base}/traiter`,
      {
        entreeId: code,
        action: 'confirm',
      },
      { withCredentials: true },
    );
  }
}
