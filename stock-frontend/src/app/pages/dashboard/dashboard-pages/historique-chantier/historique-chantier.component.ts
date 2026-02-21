import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { SortieArticlesComponent } from '../../../../components/details-modals/sortie-articles/sortie-articles.component';
import { DemandeArticlesComponent } from '../demande-articles/demande-articles.component';
import { RetourArticlesListComponent } from '../../../../components/details-modals/retour-articles-list/retour-articles-list.component';
import { ArticlesListModalComponent } from '../../../../components/details-modals/articles-list-modal/articles-list-modal.component';
import { ExportModalComponent } from '../../../../components/export-modal/export-modal.component';
import { ExportService } from '../../../../services/export.service';
import { LoadingComponent } from "../../../../components/loading/loading.component";

@Component({
  selector: 'app-historique-chantier',
  standalone: true,
  imports: [
    CommonModule,
    SortieArticlesComponent,
    DemandeArticlesComponent,
    RetourArticlesListComponent,
    ArticlesListModalComponent,
    ExportModalComponent,
    LoadingComponent
],
  templateUrl: './historique-chantier.component.html',
  styleUrl: './historique-chantier.component.css',
})
export class HistoriqueChantierComponent implements OnInit {
  chantierData: any = null;
  loading: boolean = true;
  chantierId: any = null;

  modalSettings = {
    sortieArticlesModal: false,
    demandeArticlesModal: false,
    retourArticlesModal: false,
  };

  articlesDisplay: any[] = [];
  retour = null;

  exportLoading = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private exportService: ExportService,
  ) {}

  ngOnInit(): void {
    const chantierId = this.route.snapshot.paramMap.get('chantierId');
    this.chantierId = chantierId;
    if (chantierId) {
      this.fetchChantierSummary(chantierId);
    }
  }

  fetchChantierSummary(id: string): void {
    const url = `http://localhost:4000/api/chantier/summary/${id}`;
    this.http.get(url, { withCredentials: true }).subscribe({
      next: (data: any) => {
        this.chantierData = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching chantier summary', err);
        this.loading = false;
      },
    });
  }

  // Helper to join article names and quantities for the table cells
  formatArticles(items: any[]): string {
    if (!items) return '';
    return items
      .map((item) => `${item.article.nom} (x${item.quantite})`)
      .join(', ');
  }

  displaySortieArticles(sortie) {
    this.articlesDisplay = sortie.articleSorties;

    console.log(sortie);

    this.modalSettings = {
      sortieArticlesModal: true,
      demandeArticlesModal: false,
      retourArticlesModal: false,
    };
  }

  displayDemandeArticles(demande) {
    this.articlesDisplay = demande.items;
    this.modalSettings = {
      sortieArticlesModal: false,
      demandeArticlesModal: true,
      retourArticlesModal: false,
    };
  }

  displayRetourArticles(retour) {
    this.retour = retour;
    this.modalSettings = {
      sortieArticlesModal: false,
      demandeArticlesModal: false,
      retourArticlesModal: true,
    };
  }

  public onExport() {
    this.exportLoading = true;
    this.exportService.exportChantierDetails(this.chantierId).subscribe({
      next: (response: any) => {
        this.exportLoading = false;
        this.exportService.downloadFile(response, 'chantier.xlsx');
      },
      error: () => (this.exportLoading = false),
    });
  }
}
