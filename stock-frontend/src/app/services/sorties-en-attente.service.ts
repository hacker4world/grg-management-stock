import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SortieEnAttenteListResponse } from '../models/sorties-en-attente.model';

export interface CreateSortieDto {
  articles: Array<{ articleId: number; stockSortie: number }>;
  observation?: string;
  chantierId?: number;
  compteId: number;
}

export interface SortieListOptions {
  searching: boolean;
  query: string;
  filtering: boolean;
  date?: string;
  typeSortie?: string;
  chantierId?: number;
  depotId?: number;
  compteId?: number;
  articleId?: number;
  id?: number; // ✅ ADD THIS LINE
}


@Injectable({ providedIn: 'root' })
export class SortiesEnAttenteService {
  private readonly base = 'http://localhost:4000/api/sorties';

  constructor(private http: HttpClient) {}

  public ajouterSortie(
    dto: CreateSortieDto,
  ): Observable<{ message: string; sortieId: number }> {
    return this.http.post<{ message: string; sortieId: number }>(
      `${this.base}/create`,
      dto,
      { withCredentials: true },
    );
  }

  public fetchSorties(
    page: number,
    options?: SortieListOptions,
  ): Observable<SortieEnAttenteListResponse> {
    let url = `${this.base}/list-pending?page=${page}`;
    console.log(options);

    if (options) {
      if (options.filtering) {
        if (options.date) url += `&date=${options.date}`;
        if (options.typeSortie) url += `&typeSortie=${options.typeSortie}`;
        if (options.chantierId) url += `&chantierId=${options.chantierId}`;
        if (options.depotId) url += `&depotId=${options.depotId}`;
        if (options.compteId) url += `&compteId=${options.compteId}`;
        if (options.articleId) url += `&articleId=${options.articleId}`;
        if (options.id != undefined) url += `&id=${options.id}`; // ✅ ADD THIS LINE
      }
    }

    console.log(url);

    return this.http.get<SortieEnAttenteListResponse>(url, {
      withCredentials: true,
    });
  }

  confirmDeny(sortieId: number, action: 'confirm' | 'deny') {
    return this.http.put<{ message: string }>(
      `${this.base}/confirm-deny`,
      {
        sortieId,
        action,
      },
      { withCredentials: true },
    );
  }
}
