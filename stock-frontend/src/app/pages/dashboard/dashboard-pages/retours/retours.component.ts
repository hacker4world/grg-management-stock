import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { RetourService } from '../../../../services/retour.service';
import {
  Retour,
  RetourListResponseModel,
} from '../../../../models/retour.model';
import { RetourDetailsModalComponent } from '../../../../components/details-modals/retour-details-modal/retour-details-modal.component';
import { FilterRetoursModalComponent } from '../../../../components/filter-modals/filter-retours-modal/filter-retours-modal.component';
import { RetourArticlesListComponent } from '../../../../components/details-modals/retour-articles-list/retour-articles-list.component';
import { LoadingComponent } from '../../../../components/loading/loading.component';
import { ErrorComponent } from '../../../../components/error/error.component';
import { AlertComponent } from '../../../../components/alert/alert.component';
import { AuthenticationService } from '../../../../services/authentication.service';
import { Router } from '@angular/router';
import { rolePermissions } from '../../../../roles';
import { ExportService } from '../../../../services/export.service';
import { ExportModalComponent } from '../../../../components/export-modal/export-modal.component';

@Component({
  selector: 'app-retours',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RetourDetailsModalComponent,
    FilterRetoursModalComponent,
    RetourArticlesListComponent,
    LoadingComponent,
    ErrorComponent,
    AlertComponent,
    ExportModalComponent,
  ],
  templateUrl: './retours.component.html',
  styleUrls: ['./retours.component.css'],
})
export class RetoursComponent implements OnInit {
  /* ---------- modals ---------- */
  modalSettings = {
    showDetailsModal: false,
    showFilterModal: false,
    showArticlesList: false,
    showExportModal: false,
  };
  setModals(options: Partial<typeof this.modalSettings>) {
    Object.assign(this.modalSettings, options);
  }

  /* ---------- data ---------- */
  retours: Retour[] = [];
  selectedRetour: Retour | null = null;

  /* ---------- list state ---------- */
  listOptions = {
    searching: false,
    query: '',
    filtering: false,
    date: '',
    chantierId: undefined as number | undefined,
    articleId: undefined as number | undefined, // Added
    status: undefined as string | undefined, // Added
    id: undefined as number | undefined, // ✅ ADD THIS LINE
  };
  pagination = { page: 1, lastPage: false };

  /* ---------- UI helpers ---------- */
  loading = false;
  error = { show: false, message: '' };
  alert = { show: false, message: '' };

  searchForm = new FormGroup({ query: new FormControl('') });

  constructor(
    private readonly retourService: RetourService,
    private readonly fb: FormBuilder,
    private readonly authenticationService: AuthenticationService,
    private readonly router: Router,
    private readonly exportService: ExportService,
  ) {}

  ngOnInit(): void {
    const currentUser = this.authenticationService.getCurrentUser();

    currentUser.subscribe({
      next: (user) => {
        if (rolePermissions[user.role].includes('retours')) {
          this.fetchRetours();
        } else {
          this.router.navigate(['../../../login']);
        }
      },
    });
  }

  /* ---------- core ---------- */
  fetchRetours() {
    this.loading = true;
    this.retourService
      .fetchRetours(this.pagination.page, this.listOptions)
      .subscribe({
        next: (res: RetourListResponseModel) => {
          this.loading = false;
          this.retours = [...this.retours, ...res.retours];
          this.pagination.lastPage = res.lastPage;
        },
        error: () => {
          this.loading = false;
          this.error = {
            show: true,
            message: 'Impossible de charger les retours',
          };
        },
      });
  }

  loadMore() {
    this.pagination.page++;
    this.fetchRetours();
  }

  restoreList() {
    this.pagination = { page: 1, lastPage: false };
    this.retours = [];
  }

  /* ---------- row click ---------- */
  onSelectRetour(id: number) {
    this.selectedRetour = this.retours.find((r) => r.id === id) ?? null;
    this.setModals({ showDetailsModal: true });
  }

  onShowArticles(id: number) {
    this.selectedRetour = this.retours.find((r) => r.id === id) ?? null;
    this.setModals({ showArticlesList: true });
  }

  /* ---------- confirm/deny actions ---------- */
  onConfirmRetour(transporteur) {
    if (!this.selectedRetour) return;

    this.retourService
      .traiterRetour({ retourId: this.selectedRetour.id, action: 'approve', ...transporteur })
      .subscribe({
        next: (response: any) => {
          this.setModals({ showDetailsModal: false });

          // Update the retour in the local list with the response data
          this.retours = this.retours.map((r) =>
            r.id === this.selectedRetour!.id
              ? {
                  ...r,
                  status: 'confirmed',
                  documents: response.documents || [], // ATTACH DOCUMENTS
                }
              : r,
          );

          // Update selectedRetour to reflect the new documents
          if (this.selectedRetour) {
            this.selectedRetour = {
              ...this.selectedRetour,
              status: 'confirmed',
              documents: response.documents || [],
            };
          }

          this.selectedRetour = null;
        },
        error: () => {
          this.error = {
            show: true,
            message: 'Erreur lors de la confirmation du retour',
          };
        },
      });
  }

  onDenyRetour() {
    if (!this.selectedRetour) return;

    this.retourService
      .traiterRetour({ retourId: this.selectedRetour.id, action: 'deny' })
      .subscribe({
        next: () => {
          this.setModals({ showDetailsModal: false });
          // Remove the retour from the local list
          this.retours = this.retours.filter(
            (r) => r.id !== this.selectedRetour!.id,
          );
          this.selectedRetour = null;
        },
        error: () => {
          this.error = {
            show: true,
            message: 'Erreur lors du refus du retour',
          };
        },
      });
  }

  /* ---------- search ---------- */
  onSearch() {
    const q = this.searchForm.value.query?.trim() ?? '';

    // If search is empty, restore normal list
    if (!q) {
      this.onRestore();
      return;
    }

    // Check if the input is a number (ID search)
    const isNumeric = /^\d+$/.test(q);

    if (isNumeric) {
      // Search by ID (including 0)
      this.listOptions.searching = false;
      this.listOptions.query = '';
      this.listOptions.filtering = true;
      this.listOptions.id = Number(q); // This will correctly convert "0" to 0

      this.alert.show = true;
      this.alert.message = `Recherche par ID: ${q}`;
    } else {
      // Search by code/query (text search)
      this.listOptions.searching = true;
      this.listOptions.query = q;
      this.listOptions.filtering = false;
      this.listOptions.id = undefined;

      this.alert.show = true;
      this.alert.message = 'Cette liste est filtrée';
    }

    this.restoreList();
    this.fetchRetours();
  }

  /* ---------- filter ---------- */
  onFilter(data: any) {
    this.setModals({ showFilterModal: false });
    this.listOptions.filtering = true;
    this.listOptions.date = data.date ?? '';
    this.listOptions.chantierId = data.chantierId;
    this.listOptions.articleId = data.articleId; // Added
    this.listOptions.status = data.status; // Added

    this.alert.show = true;
    this.alert.message = 'Cette liste est filtrée';
    this.restoreList();
    this.fetchRetours();
  }

  onRestore() {
    Object.assign(this.listOptions, {
      searching: false,
      filtering: false,
      query: '',
      date: '',
      chantierId: undefined,
      articleId: undefined,
      status: undefined,
      id: undefined, // ✅ ADD THIS LINE
    });
    this.alert.show = false;
    this.restoreList();
    this.fetchRetours();
  }

  onExport(option: string) {
    this.setModals({ showExportModal: false });
    const listToExport = option === 'liste' ? this.retours : [];

    this.exportService.exportRetours(listToExport).subscribe({
      next: (blob) => {
        this.exportService.downloadFile(blob, 'retours_articles.xlsx');
      },
      error: () => {
        this.error = { show: true, message: "Erreur lors de l'exportation" };
      },
    });
  }
}
