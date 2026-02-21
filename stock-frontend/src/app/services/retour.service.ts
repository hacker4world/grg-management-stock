import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  RetourListResponseModel,
  TraiterRetourRequest,
} from '../models/retour.model';

@Injectable({
  providedIn: 'root',
})
export class RetourService {
  private readonly url: string = 'http://localhost:4000/api/retours';

  constructor(private readonly httpClient: HttpClient) {}

  public fetchRetours(
    page: number,
    options?: any,
  ): Observable<RetourListResponseModel> {
    let queryParams = `?page=${page}`;

    if (options) {
      if (options.searching && options.query) {
        queryParams += `&code=${options.query}`;
      }
      if (options.filtering) {
        if (options.date) queryParams += `&date=${options.date}`;
        if (options.chantierId)
          queryParams += `&chantierId=${options.chantierId}`;
        if (options.articleId) queryParams += `&articleId=${options.articleId}`;
        if (options.status) queryParams += `&status=${options.status}`;
        if (options.id !== undefined) queryParams += `&id=${options.id}`; // ✅ ADD THIS LINE
      }
    }

    console.log(queryParams);

    return this.httpClient.get<RetourListResponseModel>(
      `${this.url}/liste${queryParams}`,
      { withCredentials: true },
    );
  }
  public traiterRetour(data: TraiterRetourRequest): Observable<any> {
    console.log(data);

    return this.httpClient.put(`${this.url}/traiter`, data, {
      withCredentials: true,
    });
  }
}
