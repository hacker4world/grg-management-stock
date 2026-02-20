import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';


export interface NotificationFilterOptions {
  filtering: boolean;
  articleId?: number;
  date?: string;
  type?: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly url = 'http://localhost:4000/api/notifications';

  constructor(private readonly httpClient: HttpClient) {}

  public listNotifications(page: number, options?: NotificationFilterOptions) {
    let endpoint = `${this.url}/liste?page=${page}`;

    if (options?.filtering) {
      if (options.articleId) endpoint += `&articleId=${options.articleId}`;
      if (options.date) endpoint += `&date=${options.date}`;
      if (options.type) endpoint += `&type=${options.type}`;
    }

    return this.httpClient.get(endpoint, {
      withCredentials: true,
    });
  }

  public deleteNotification(notificationId: number) {
    return this.httpClient.delete(
      `${this.url}/supprimer?id=${notificationId}`,
      {
        withCredentials: true,
      },
    );
  }
}
