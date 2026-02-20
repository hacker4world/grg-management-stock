import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  private baseUrl = 'http://localhost:4000/api/export';

  constructor(private http: HttpClient) {}

  // Generic export method
  private exportData(endpoint: string, body: any): Observable<Blob> {
    return this.http.post(`${this.baseUrl}/${endpoint}`, body, {
      responseType: 'blob',
      withCredentials: true,
    });
  }

  // Article export
  exportArticles(articleList: any[]): Observable<Blob> {
    let body = {};
    if (articleList.length > 0)
      body = {
        articleList,
      };
    return this.exportData('export-articles', body);
  }

  exportFournisseurs(fournisseurList: any[]): Observable<Blob> {
    let body = {};
    if (fournisseurList.length > 0)
      body = {
        fournisseurList,
      };
    return this.exportData('export-fournisseurs', body);
  }

  exportFabriquants(fabriquantList: any[]) {
    let body = {};
    if (fabriquantList.length > 0)
      body = {
        fabriquantList,
      };
    return this.exportData('export-fabriquants', body);
  }

  exportChantiers(chantierList: any[]) {
    let body = {};
    if (chantierList.length > 0)
      body = {
        chantierList: chantierList,
      };
    return this.exportData('export-chantiers', body);
  }

  exportEntrees(entreeList: any[], confirme: boolean): Observable<Blob> {
    let body: any = { confirme };
    if (entreeList.length > 0) {
      body.entreeList = entreeList;
    }
    return this.exportData('export-entrees', body);
  }

  exportSorties(entreeList: any[], confirme: boolean): Observable<Blob> {
    let body: any = { confirme };
    if (entreeList.length > 0) {
      body.entreeList = entreeList;
    }
    return this.exportData('export-sorties', body);
  }

  exportDemandes(demandeList: any[]): Observable<Blob> {
    let body = {};
    if (demandeList.length > 0) {
      body = { demandeList };
    }
    return this.exportData('export-demandes', body);
  }

  exportRetours(retourList: any[]): Observable<Blob> {
    let body = {};
    if (retourList.length > 0) {
      body = { retourList };
    }
    return this.exportData('export-retours', body);
  }

  exportNotifications(notificationList: any[]): Observable<Blob> {
    let body = {};
    if (notificationList.length > 0) {
      body = {
        notificationList, // Matches the requested field name
      };
    }
    return this.exportData('export-notifications', body);
  }

  exportDepots(depotList: any[]): Observable<Blob> {
    let body = {};
    if (depotList.length > 0) {
      body = { depotList };
    }
    return this.exportData('export-depots', body);
  }

  exportUnites(uniteList: any[]): Observable<Blob> {
    let body = {};
    if (uniteList.length > 0) {
      body = { uniteList };
    }
    return this.exportData('export-unites', body);
  }

  exportComptes(compteList: any[], confirme: boolean): Observable<Blob> {
    let body: any = { confirme };
    if (compteList.length > 0) {
      body.compteList = compteList;
    }
    return this.exportData('export-comptes', body);
  }

  /**
   * Helper method to download the blob file
   * @param blob The blob response from the export
   * @param filename The default filename for the download
   */
  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Helper method to get suggested filename from response headers
   * @param headers The HTTP response headers
   */
  getFilenameFromHeaders(headers: any): string {
    const contentDisposition = headers.get('content-disposition');
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(
        /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/,
      );
      if (filenameMatch && filenameMatch[1]) {
        return filenameMatch[1].replace(/['"]/g, '');
      }
    }
    return 'export.xlsx'; // Default filename
  }
}
