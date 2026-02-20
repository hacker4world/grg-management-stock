import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  DemandeArticleListResponse,
  DemandeArticleModel,
} from '../models/demandes-articles.model';

@Injectable({ providedIn: 'root' })
export class DemandesArticlesService {
  private readonly url = 'http://localhost:4000/api/demandes-articles';

  constructor(private readonly http: HttpClient) {}

  fetchDemandes(page: number, options: ListOptions) {
    let base = `${this.url}/liste?page=${page}`;

    if (options.searching && options.searchQuery) {
      base += `&search=${encodeURIComponent(options.searchQuery)}`;
    } else if (options.filtering) {
      // Ensure we only add parameters that are not null/undefined
      if (options.chantierId) base += `&chantierId=${options.chantierId}`;
      if (options.date) base += `&date=${options.date}`;
      if (options.status) base += `&status=${options.status}`;
      if (options.articleId) base += `&articleId=${options.articleId}`;
    }

    console.log(base);

    return this.http.get<DemandeArticleListResponse>(base, {
      withCredentials: true,
    });
  }

  confirmDemande(demandeId: number) {
    return this.http.post(
      `${this.url}/traiter`,
      { demandeId, action: 'confirm' },
      { withCredentials: true },
    );
  }

  denyDemande(demandeId: number) {
    return this.http.post(
      `${this.url}/traiter`,
      { demandeId, action: 'deny' },
      { withCredentials: true },
    );
  }
}

export interface ListOptions {
  filtering: boolean;
  chantierId?: number;
  date?: string;
  status?: string; // Added
  articleId?: number; // Added
  searching?: boolean;
  searchQuery?: string;
}
