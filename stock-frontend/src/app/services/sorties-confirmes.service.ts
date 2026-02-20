import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SortieConfirmeeListResponse } from '../models/sorties-confirmes.model';
import { SortieListOptions } from './sorties-en-attente.service';

@Injectable({ providedIn: 'root' })
export class SortiesConfirmesService {
  private readonly base = 'http://localhost:4000/api/sorties';

  constructor(private http: HttpClient) {}

  fetchSorties(
    page: number,
    options?: SortieListOptions,
  ): Observable<SortieConfirmeeListResponse> {
    let url = `${this.base}/list-confirme?page=${page}`;

    if (options) {
      if (options.searching) url += `&query=${options.query}`;
      if (options.filtering) {
        if (options.date) url += `&date=${options.date}`;
        if (options.chantierId) url += `&chantierId=${options.chantierId}`;
        if (options.compteId) url += `&compteId=${options.compteId}`;
        if (options.articleId) url += `&articleId=${options.articleId}`;
      }
    }

    console.log(url);

    return this.http.get<SortieConfirmeeListResponse>(url, {
      withCredentials: true,
    });
  }

  public supprimerSortie(id: number): Observable<any> {
    return this.http.delete(`${this.base}/supprimer`, {
      params: { id: id.toString() },
      withCredentials: true,
    });
  }
}
