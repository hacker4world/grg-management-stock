import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SortieConfirmeListResponse } from '../models/sorties-confirmes.model';
import { SortieListOptions } from './sorties-en-attente.service';

@Injectable({ providedIn: 'root' })
export class SortiesConfirmesService {
  private readonly base = 'http://localhost:4000/api/sorties';

  constructor(private http: HttpClient) {}

  fetchSorties(
    page: number,
    options?: SortieListOptions,
  ): Observable<SortieConfirmeListResponse> {
    let url = `${this.base}/list-confirme?page=${page}`;

    console.log(options);

    if (options) {
      if (options.filtering) {
        if (options.date) url += `&date=${options.date}`;
        if (options.chantierId) url += `&chantierId=${options.chantierId}`;
        if (options.compteId) url += `&compteId=${options.compteId}`;
        if (options.articleId) url += `&articleId=${options.articleId}`;
        if (options.typeSortie) url += `&typeSortie=${options.typeSortie}`;
        if (options.depotId) url += `&depotId=${options.depotId}`;
        if (options.id != undefined) url += `&id=${options.id}`; // ✅ ADD THIS LINE
      }
    }

    console.log(url);

    return this.http.get<SortieConfirmeListResponse>(url, {
      withCredentials: true,
    });
  }

  public supprimerSortie(id: number): Observable<any> {
    return this.http.delete(`${this.base}/supprimer`, {
      params: { id: id.toString() },
      withCredentials: true,
    });
  }

  public approveSortie(id: number): Observable<any> {
    return this.http.post(
      `${this.base}/approve`,
      { id },
      { withCredentials: true },
    );
  }

  public denySortie(id: number): Observable<any> {
    return this.http.post(
      `${this.base}/deny`,
      { id },
      { withCredentials: true },
    );
  }
}
