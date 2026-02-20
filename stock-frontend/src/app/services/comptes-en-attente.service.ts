import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CompteEnAttenteListResponse } from '../models/comptes-en-attente.model';

@Injectable({ providedIn: 'root' })
export class ComptesEnAttenteService {
  private readonly url = 'http://localhost:4000/api/authentification';

  constructor(private readonly http: HttpClient) {}

  /* -------------- list / search / filter -------------- */
  fetchComptesEnAttente(page: number, options: ListOptions) {
    let base = `${this.url}/requettes?page=${page}`;
    if (options.searching) base += `&nom=${options.query}`;
    if (options.filtering) {
      if (options.code) base += `&code=${options.code}`;
      if (options.prenom) base += `&prenom=${options.prenom}`;
      if (options.nomUtilisateur)
        base += `&nom_utilisateur=${options.nomUtilisateur}`;
      if (options.role) base += `&role=${options.role}`;
    }
    return this.http.get<CompteEnAttenteListResponse>(base, {
      withCredentials: true,
    });
  }

  /* -------------- accept / refuse -------------- */
  accepterCompte(code: string, role: string) {
    return this.http.post(
      `${this.url}/accepter-compte`,
      { compte_id: code, role },
      { withCredentials: true },
    );
  }

  refuserCompte(code: string) {
    return this.http.delete(`${this.url}/supprimer?compte_id=${code}`, {
      withCredentials: true,
    });
  }
}

/* re-use the same interface */
export interface ListOptions {
  searching: boolean;
  query: string;
  filtering: boolean;
  code: string;
  prenom: string;
  nomUtilisateur: string;
  role: string;
}
