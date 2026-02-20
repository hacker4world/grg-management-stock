import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DemandeDetailsModalComponent } from '../../../../components/details-modals/demande-details-modal/demande-details-modal.component';
import { FilterDemandesModalComponent } from '../../../../components/filter-modals/filter-demandes-modal/filter-demandes-modal.component';
import { ArticlesListModalComponent } from '../../../../components/details-modals/articles-list-modal/articles-list-modal.component';
import { ErrorComponent } from '../../../../components/error/error.component';
import { AlertComponent } from '../../../../components/alert/alert.component';
import { LoadingComponent } from '../../../../components/loading/loading.component';
import { DemandeArticleModel } from '../../../../models/demandes-articles.model';
import { DemandesArticlesService } from '../../../../services/demande-article.service';
import { AuthenticationService } from '../../../../services/authentication.service';
import { Router } from '@angular/router';
import { rolePermissions } from '../../../../roles';
import { ExportService } from '../../../../services/export.service';
import { ExportModalComponent } from "../../../../components/export-modal/export-modal.component";

@Component({
  selector: 'app-demande-articles',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DemandeDetailsModalComponent,
    FilterDemandesModalComponent,
    ArticlesListModalComponent,
    ErrorComponent,
    AlertComponent,
    LoadingComponent,
    ExportModalComponent,
  ],
  templateUrl: './demande-articles.component.html',
  styleUrl: './demande-articles.component.css',
})
export class DemandeArticlesComponent implements OnInit {
  public modalSettings = {
    showDetailsModal: false,
    showFilterModal: false,
    showArticlesListModal: false,
    showExportModal: false, // Add this
  };

  public setModals(options: Partial<typeof this.modalSettings>) {
    Object.keys(options).forEach((k) => (this.modalSettings[k] = options[k]));
  }

  demandes: DemandeArticleModel[] = [];
  selectedDemande: DemandeArticleModel | null = null;
  selectedArticles: any[] = [];

  /* ---------- list state ---------- */
  listOptions = {
    filtering: false,
    searching: false,
    searchQuery: undefined as string | undefined,
    chantierId: undefined as number | undefined,
    date: undefined as string | undefined,
    status: undefined as string | undefined, // Added
    articleId: undefined as number | undefined, // Added
  };
  pagination = { page: 1, lastPage: false };

  loading = false;

  /* ---------- UI helpers ---------- */
  error = { show: false, message: '' };
  alert = { show: false, message: '' };

  searchForm = new FormGroup({ query: new FormControl('') });

  constructor(
    private readonly demandesService: DemandesArticlesService,
    private authenticationService: AuthenticationService,
    private readonly router: Router,
    private readonly exportService: ExportService,
  ) {}

  ngOnInit(): void {
    const currentUser = this.authenticationService.getCurrentUser();

    currentUser?.subscribe({
      next: (user) => {
        if (rolePermissions[user?.role]?.includes('demandes')) {
          this.fetchDemandes();
        } else {
          this.router.navigate(['../../../login']);
        }
      },
    });
  }

  fetchDemandes() {
    this.loading = true;
    this.demandesService
      .fetchDemandes(this.pagination.page, this.listOptions)
      .subscribe({
        next: (res) => {
          console.log(res);

          this.loading = false;
          // Replace results when searching, append when loading more
          if (this.pagination.page === 1 || this.listOptions.searching) {
            this.demandes = res.demandes;
          } else {
            this.demandes = [...this.demandes, ...res.demandes];
          }
          this.pagination.lastPage = res.lastPage;
        },
        error: () => {
          this.loading = false;
          this.error = { show: true, message: 'Une erreur est survenue' };
        },
      });
  }

  loadMore() {
    this.pagination.page++;
    this.fetchDemandes();
  }

  restoreList() {
    this.pagination = { page: 1, lastPage: false };
    this.demandes = [];
  }

  onSelectDemande(demande: DemandeArticleModel) {
    this.selectedDemande = demande;
    this.setModals({ showDetailsModal: true });
  }

  onShowArticles(demande: DemandeArticleModel) {
    this.selectedArticles = demande.items;
    this.setModals({ showArticlesListModal: true });
  }

  onConfirmDemande() {
    if (!this.selectedDemande) return;

    const demandeId = this.selectedDemande.id;

    this.demandesService.confirmDemande(demandeId).subscribe({
      next: () => {
        // 1. Update the status in the local list to reflect changes in the UI
        const index = this.demandes.findIndex((d) => d.id === demandeId);
        if (index !== -1) {
          this.demandes[index].status = 'confirmed';
        }

        // 2. Close the modal
        this.setModals({ showDetailsModal: false });

        // 3. Reset selectedDemande
        this.selectedDemande = null;
      },
      error: () => {
        this.error = { show: true, message: 'Erreur lors de la confirmation' };
      },
    });
  }

  onDeleteDemande() {
    if (!this.selectedDemande) return;

    this.demandesService.denyDemande(this.selectedDemande.id).subscribe({
      next: () => {
        // 1. Close the modal
        this.setModals({ showDetailsModal: false });

        // 2. Filter out the denied demande from the list
        this.demandes = this.demandes.filter(
          (d) => d.id !== this.selectedDemande!.id,
        );

        // Optional: Reset selectedDemande
        this.selectedDemande = null;
      },
      error: () => {
        this.error = { show: true, message: 'Erreur lors de la suppression' };
      },
    });
  }

  /* ---------- filter ---------- */
  onFilter(data: {
    chantierId?: number;
    date?: string;
    status?: string;
    articleId?: number;
  }) {
    this.setModals({ showFilterModal: false });
    this.listOptions.filtering = true;
    this.listOptions.chantierId = data.chantierId;
    this.listOptions.date = data.date;
    this.listOptions.status = data.status; // Added
    this.listOptions.articleId = data.articleId; // Added

    this.alert.show = true;
    this.alert.message = 'Cette liste est filtrée';
    this.restoreList();
    this.fetchDemandes();
  }

  onSearch() {
    const query = this.searchForm.get('query')?.value?.trim();

    // If search is empty, restore normal list
    if (!query) {
      this.onRestore();
      return;
    }

    // Set search state
    this.listOptions.searching = true;
    this.listOptions.searchQuery = query;
    this.listOptions.filtering = false; // Disable filtering when searching

    // Show alert with search term
    this.alert.show = true;
    this.alert.message = `Résultats de recherche pour: "${query}"`;

    // Reset list and fetch search results
    this.restoreList();
    this.fetchDemandes();
  }

  onRestore() {
    this.listOptions.filtering = false;
    this.listOptions.searching = false; // Add this
    this.listOptions.searchQuery = undefined; // Add this
    this.searchForm.reset({ query: '' }); // Clear search input
    this.alert.show = false;
    this.restoreList();
    this.fetchDemandes();
  }

  onExport(option: string) {
    this.setModals({ showExportModal: false });
    const listToExport = option === 'liste' ? this.demandes : [];

    this.exportService.exportDemandes(listToExport).subscribe({
      next: (blob) => {
        this.exportService.downloadFile(blob, 'demandes_articles.xlsx');
      },
      error: () => {
        this.error = { show: true, message: "Échec de l'exportation" };
      },
    });
  }
}
