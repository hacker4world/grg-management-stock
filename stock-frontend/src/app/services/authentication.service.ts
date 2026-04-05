import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginModel, SignupModel } from '../models/authentication.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { environement } from '../../../environement';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private readonly url: string =
    `${environement.api_url}/authentification`;

  private currentUser = new BehaviorSubject<any>(null);

  constructor(private readonly httpClient: HttpClient) {}

  public login(loginData: LoginModel) {
    return this.httpClient.post(`${this.url}/login`, loginData);
  }

  public signup(signupData: SignupModel) {
    return this.httpClient.post(`${this.url}/signup`, signupData);
  }

  public logout() {
    this.setCurrentUser(null);

    return this.httpClient.post(
      `${this.url}/logout`,
      {},
      { withCredentials: true },
    );
  }

  public verifyCompte() {

    console.log(`${this.url}/verify`);
    

    return this.httpClient.get(`${this.url}/verify`, {
      withCredentials: true,
    });
  }

  public getCurrentUser() {
    return this.currentUser.asObservable();
  }

  public setCurrentUser(user: any) {
    this.currentUser.next(user);
  }

  public fetchResponsables() {
    return this.httpClient.get<any>(
      `${this.url}/liste?role=responsable-chantier&page=0`,
      { withCredentials: true },
    );
  }

  public fetchMagaziniers(): Observable<{ comptes: any[] }> {
    return this.httpClient.get<{ comptes: any[] }>(
      `${this.url}/liste?page=0&role=magazinier`,
      { withCredentials: true },
    );
  }
}
