// sorties-en-attente.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SortieEnAttenteListResponse } from '../models/sorties-en-attente.model';

// Base interface for all sorties
export interface BaseSortieDto {
  articles: Array<{ articleId: number; stockSortie: number }>;
  observation?: string;
  compteId: number;
}

// Internal Depot Sortie
export interface CreateSortieInterneDepotDto extends BaseSortieDto {
  typeSortie: 'interne_depot';
  depotId: number;
  nomTransporteur: string;
  matriculeTransporteur: string;
}

// Internal Chantier Sortie
export interface CreateSortieInterneChantierDto extends BaseSortieDto {
  typeSortie: 'interne_chantier';
  chantierId: number;
  nomTransporteur: string;
  matriculeTransporteur: string;
}

// External Sortie with Transporter
export interface CreateSortieExterneAvecTransporteurDto extends BaseSortieDto {
  typeSortie: 'externe';
  sousTypeSortieExterne: 'avec_transporteur';
  nomEntreprise: string;
  adresseEntreprise: string;
  matriculeFiscalEntreprise: string;
  nomClient: string;
  nomTransporteur: string;
  matriculeTransporteur: string;
}

// External Sortie without Transporter
export interface CreateSortieExterneSansTransporteurDto extends BaseSortieDto {
  typeSortie: 'externe';
  sousTypeSortieExterne: 'sans_transporteur';
  nomEntreprise: string;
  adresseEntreprise: string;
  matriculeFiscalEntreprise: string;
  nomClient: string;
}

// Union type for all possible sorties
export type CreateSortieDto =
  | CreateSortieInterneDepotDto
  | CreateSortieInterneChantierDto
  | CreateSortieExterneAvecTransporteurDto
  | CreateSortieExterneSansTransporteurDto;

export interface SortieListOptions {
  searching: boolean;
  query: string;
  filtering: boolean;
  date?: string;
  chantierId?: number;
  compteId?: number;
  articleId?: number;
}

@Injectable({ providedIn: 'root' })
export class SortiesEnAttenteService {
  private readonly base = 'http://localhost:4000/api/sorties';

  constructor(private http: HttpClient) {}

  public ajouterSortie(
    dto: CreateSortieDto,
  ): Observable<{ message: string; sortie: any }> {
    return this.http.post<{ message: string; sortie: any }>(
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
      if (options.searching) url += `&query=${options.query}`;
      if (options.filtering) {
        if (options.date) url += `&date=${options.date}`;
        if (options.chantierId) url += `&chantierId=${options.chantierId}`;
        if (options.compteId) url += `&compteId=${options.compteId}`;
        if (options.articleId) url += `&articleId=${options.articleId}`;
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
