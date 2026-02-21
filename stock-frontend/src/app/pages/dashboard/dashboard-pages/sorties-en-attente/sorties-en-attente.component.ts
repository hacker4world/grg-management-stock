import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';

import { ErrorComponent } from '../../../../components/error/error.component';
import { AlertComponent } from '../../../../components/alert/alert.component';
import { LoadingComponent } from '../../../../components/loading/loading.component';
import { ExportModalComponent } from '../../../../components/export-modal/export-modal.component';

import { SortieEnAttenteDetailsModalComponent } from '../../../../components/details-modals/sortie-en-attente-details-modal/sortie-en-attente-details-modal.component';
import { FilterSortieEnAttenteModalComponent } from '../../../../components/filter-modals/filter-sortie-en-attente-modal/filter-sortie-en-attente-modal.component';

import {
  SortieEnAttenteModel,
  SortieEnAttenteListResponse,
} from '../../../../models/sorties-en-attente.model';
import { SortiesEnAttenteService } from '../../../../services/sorties-en-attente.service';
import { ExportService } from '../../../../services/export.service';
import { SortieArticlesComponent } from '../../../../components/details-modals/sortie-articles/sortie-articles.component';
import { AuthenticationService } from '../../../../services/authentication.service';
import { Router } from '@angular/router';
import { rolePermissions } from '../../../../roles';

@Component({
  selector: 'app-sorties-en-attente',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ErrorComponent,
    AlertComponent,
    LoadingComponent,
    ExportModalComponent,
    SortieEnAttenteDetailsModalComponent,
    FilterSortieEnAttenteModalComponent,
    SortieArticlesComponent,
  ],
  templateUrl: './sorties-en-attente.component.html',
  styleUrls: ['./sorties-en-attente.component.css'],
})
export class SortiesEnAttenteComponent implements OnInit {
  modalSettings = {
    showDetailsModal: false,
    showFilterModal: false,
    showExportModal: false,
  };
  setModals(opts: Partial<typeof this.modalSettings>) {
    Object.assign(this.modalSettings, opts);
  }

  sorties: SortieEnAttenteModel[] = [];
  selectedSortie: SortieEnAttenteModel | null = null;

  listOptions: any = {
    // Or use the SortieListOptions interface
    searching: false,
    query: '',
    filtering: false,
    date: '',
    chantierId: undefined, // Changed from chantier
    compteId: undefined, // Changed from responsable
    articleId: undefined,
    id: undefined,
  };
  pagination = { page: 1, lastPage: false };

  /* ---------- UI ---------- */
  loading = false;
  error = { show: false, message: '' };
  alert = { show: false, message: '' };

  public showArticlesModal = false;
  public selectedArticles: any[] = [];

  searchForm = new FormGroup({ code: new FormControl('') });

  constructor(
    private readonly sortiesService: SortiesEnAttenteService,
    private readonly exportService: ExportService,
    private readonly authenticationService: AuthenticationService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    const currentUser = this.authenticationService.getCurrentUser();

    currentUser.subscribe({
      next: (user) => {
        if (rolePermissions[user.role].includes('sorties-en-attente')) {
          this.fetchSorties();
        } else {
          this.router.navigate(['../../login']);
        }
      },
    });
  }

  fetchSorties() {
    this.loading = true;
    // Pass this.listOptions here

    console.log(this.listOptions);

    this.sortiesService
      .fetchSorties(this.pagination.page, this.listOptions)
      .subscribe({
        next: (res: SortieEnAttenteListResponse) => {
          this.loading = false;
          this.sorties = [...this.sorties, ...res.sorties];
          this.pagination.lastPage = res.lastPage;
        },
        error: () => {
          this.loading = false;
          this.error = {
            show: true,
            message: 'Impossible de charger les sorties',
          };
        },
      });
  }

  public openArticlesModal(event: Event, sortie: any): void {
    event.stopPropagation(); // Prevent triggering row click (onSelectSortie)
    this.selectedArticles = sortie.articleSorties;
    this.showArticlesModal = true;
  }

  public closeArticlesModal(): void {
    this.showArticlesModal = false;
    this.selectedArticles = [];
  }

  loadMore() {
    this.pagination.page++;
    this.fetchSorties();
  }

  restoreList() {
    this.pagination = { page: 1, lastPage: false };
    this.sorties = [];
  }

  /* ---------- row click ---------- */
  onSelectSortie(id: number) {
    this.selectedSortie = this.sorties.find((s) => s.id == id) || null;
    this.setModals({ showDetailsModal: true });
  }

  /* ---------- search ---------- */
  /* ---------- search ---------- */
  onSearch() {
    const code = this.searchForm.value.code?.trim() || '';

    // Check if the input is a number (ID search)
    const isNumeric = /^\d+$/.test(code);

    if (isNumeric) {
      // Search by ID (including 0)
      this.listOptions.searching = true;
      this.listOptions.query = '';
      this.listOptions.filtering = true;
      this.listOptions.id = Number(code); // This will correctly convert "0" to 0
    } else if (code !== '') {
      // Search by code/query (only if not empty)
      this.listOptions.searching = true;
      this.listOptions.query = code;
      this.listOptions.filtering = false;
      this.listOptions.id = undefined;
    } else {
      // Empty search - reset
      this.listOptions.searching = false;
      this.listOptions.query = '';
      this.listOptions.filtering = false;
      this.listOptions.id = undefined;
    }

    this.alert.show = this.listOptions.searching || this.listOptions.filtering;
    this.alert.message = 'Cette liste est filtrée';
    this.restoreList();
    this.fetchSorties();
  }

  /* ---------- filter ---------- */
  onFilter(data: any) {
    this.setModals({ showFilterModal: false });
    this.listOptions.filtering = true;
    this.listOptions.date = data.date;
    this.listOptions.typeSortie = data.typeSortie || undefined;

    // Only set chantierId if provided
    this.listOptions.chantierId = data.chantierId
      ? Number(data.chantierId)
      : undefined;

    // Only set depotId if provided
    this.listOptions.depotId = data.depotId ? Number(data.depotId) : undefined;

    this.listOptions.compteId = data.compteId
      ? Number(data.compteId)
      : undefined;

    this.listOptions.articleId = data.articleId
      ? Number(data.articleId)
      : undefined;

    this.alert.show = true;
    this.alert.message = 'Cette liste est filtrée';
    this.restoreList();
    this.fetchSorties();
  }

  onRestore() {
    this.listOptions.searching = false;
    this.listOptions.filtering = false;
    this.listOptions.id = undefined; // ✅ ADD THIS LINE
    this.alert.show = false;
    this.restoreList();
    this.fetchSorties();
  }

  /* ---------- after validate/deny ---------- */
  onValidateOrDeny() {
    this.setModals({ showDetailsModal: false });
    if (this.selectedSortie) {
      this.sorties = this.sorties.filter(
        (s) => s.id !== this.selectedSortie!.id,
      );
      this.selectedSortie = null;
    }
  }

  getTypeSortieLabel(type: string): string {
    const labels: { [key: string]: string } = {
      interne_depot: 'Interne Dépôt',
      interne_chantier: 'Interne Chantier',
      externe: 'Externe',
    };
    return labels[type] || type;
  }

  onExport(option: string) {
    this.setModals({ showExportModal: false });

    // If option is 'liste', send the current array, otherwise send empty array for 'all'
    const sortiesToExport = option === 'liste' ? this.sorties : [];

    this.exportService.exportSorties(sortiesToExport, false).subscribe({
      next: (response) =>
        this.exportService.downloadFile(response, 'sorties_en_attente.xlsx'),
      error: (err) => {
        this.error = { show: true, message: "Erreur lors de l'exportation" };
      },
    });
  }
}
