import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Depot {
  id: number;
  nom: string;
  adresse: string; // Add this line
  nombreArticles?: number;
}

export interface Unite {
  id: number;
  nom: string;
  nombreArticles?: number;
}

@Injectable({ providedIn: 'root' })
export class ConfigurationService {
  private readonly base = 'http://localhost:4000/api';

  constructor(private http: HttpClient) {}

  /* ---------------  DEPOTS  --------------- */
  listDepots(): Observable<Depot[]> {
    return this.http.get<Depot[]>(`${this.base}/depots/liste`, {
      withCredentials: true,
    });
  }

  addDepot(nom: string, adresse: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.base}/depots/ajouter`,
      { nom, adresse },
      { withCredentials: true },
    );
  }

  updateDepot(
    id: number,
    nom: string,
    adresse: string,
  ): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(
      `${this.base}/depots/modifier`,
      { id, nom, adresse },
      { withCredentials: true },
    );
  }

  deleteDepot(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.base}/depots/supprimer?id=${id}`,
      { withCredentials: true },
    );
  }

  listUnites(): Observable<Unite[]> {
    return this.http.get<Unite[]>(`${this.base}/unites/liste`, {
      withCredentials: true,
    });
  }

  addUnite(nom: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.base}/unites/creer`,
      { nom },
      { withCredentials: true },
    );
  }

  updateUnite(id: number, nom: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(
      `${this.base}/unites/modifier`,
      { id, nom },
      { withCredentials: true },
    );
  }

  deleteUnite(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.base}/unites/supprimer?id=${id}`,
      { withCredentials: true },
    );
  }
}
