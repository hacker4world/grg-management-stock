import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { ErrorComponent } from '../../../../components/error/error.component';
import { AlertComponent } from '../../../../components/alert/alert.component';
import { FilterSortiesModalComponent } from '../../../../components/filter-modals/filter-sorties-modal/filter-sorties-modal.component';
import { SortSortiesModalComponent } from '../../../../components/sort-modals/sort-sorties-modal/sort-sorties-modal.component';
import { SortieDetailsModalComponent } from '../../../../components/details-modals/sortie-details-modal/sortie-details-modal.component';

import {
  SortieConfirmeeModel,
  SortieConfirmeeListResponse,
} from '../../../../models/sorties-confirmes.model';
import { SortiesConfirmesService } from '../../../../services/sorties-confirmes.service';
import { ExportModalComponent } from '../../../../components/export-modal/export-modal.component';
import { SortieConfirmeDetailsModalComponent } from '../../../../components/details-modals/sortie-confirme-details-modal/sortie-confirme-details-modal.component';
import { SortieArticlesComponent } from '../../../../components/details-modals/sortie-articles/sortie-articles.component';
import { AuthenticationService } from '../../../../services/authentication.service';
import { Router } from '@angular/router';
import { rolePermissions } from '../../../../roles';
import { ExportService } from '../../../../services/export.service';
import { FilterSortieEnAttenteModalComponent } from '../../../../components/filter-modals/filter-sortie-en-attente-modal/filter-sortie-en-attente-modal.component';

@Component({
  selector: 'app-verification-sortie',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ErrorComponent,
    AlertComponent,
    FilterSortiesModalComponent,
    SortSortiesModalComponent,
    SortieDetailsModalComponent,
    ExportModalComponent,
    SortieConfirmeDetailsModalComponent,
    SortieArticlesComponent,
    FilterSortieEnAttenteModalComponent,
  ],
  templateUrl: './verification-sortie.component.html',
  styleUrl: './verification-sortie.component.css',
})
export class SortiesConfirmesComponent implements OnInit {
  /* --------------  DATA & STATE  -------------- */
  public sorties: SortieConfirmeeModel[] = [];
  public loading = false;
  public pagination = {
    page: 1,
    lastPage: false,
  };
  public error = {
    show: false,
    message: '',
  };

  /* --------------  MODALS  -------------- */
  public modalSettings: ModalSettings = {
    showAddModal: false,
    showDetailsModal: false,
    showFilterModal: false,
    showSortModal: false,
    showExportModal: false,
    showArticlesModal: false,
  };

  listOptions = {
    searching: false,
    query: '',
    filtering: false,
    date: '',
    chantierId: undefined as number | undefined,
    compteId: undefined as number | undefined,
    articleId: undefined as number | undefined,
  };

  searchForm = new FormGroup({
    code: new FormControl(''),
  });

  alert = { show: false, message: '' };

  public onViewArticles(event: Event, sortie: SortieConfirmeeModel) {
    event.stopPropagation(); // Prevent opening the details modal
    this.selectedSortie = sortie;
    this.setModals({ showArticlesModal: true });
  }

  constructor(
    private sortiesService: SortiesConfirmesService,
    private readonly authenticationService: AuthenticationService,
    private readonly router: Router,
    private readonly exportService: ExportService,
  ) {}

  ngOnInit(): void {
    const currentUser = this.authenticationService.getCurrentUser();

    currentUser.subscribe({
      next: (user) => {
        if (rolePermissions[user.role].includes('sorties-confirme')) {
          this.loadSorties();
        } else {
          this.router.navigate(['../../login']);
        }
      },
    });
  }

  public loadSorties(): void {
    if (this.loading) return;

    this.loading = true;
    this.error.show = false;

    this.sortiesService
      .fetchSorties(this.pagination.page, this.listOptions)
      .subscribe({
        next: (response: SortieConfirmeeListResponse) => {
          this.sorties = [...this.sorties, ...response.sorties];
          this.pagination.lastPage = response.lastPage;
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          this.error.show = true;
          this.error.message =
            'Une erreur est survenue lors du chargement des sorties.';
        },
      });
  }

  public loadMore(): void {
    if (!this.pagination.lastPage) {
      this.pagination.page++;
      this.loadSorties();
    }
  }

  public setModals(options: ModalSettings) {
    Object.keys(options).forEach((key) => {
      const k = key as keyof ModalSettings;
      this.modalSettings[k] = options[k] as boolean;
    });
  }

  public selectedSortie: SortieConfirmeeModel | null = null;

  public onSelectSortie(sortie: SortieConfirmeeModel) {
    this.selectedSortie = sortie;
    this.setModals({ showDetailsModal: true });
  }

  public onDeleteSuccess() {
    if (this.selectedSortie) {
      this.sorties = this.sorties.filter(
        (s) => s.id !== this.selectedSortie!.id,
      );
      this.selectedSortie = null;
    }
    this.setModals({ showDetailsModal: false });
  }

  onExport(option: string) {
    this.setModals({ showExportModal: false });

    const sortiesToExport = option === 'liste' ? this.sorties : [];

    this.exportService.exportSorties(sortiesToExport, true).subscribe({
      next: (response) =>
        this.exportService.downloadFile(response, 'sorties_confirmees.xlsx'),
      error: (err) => {
        this.error = { show: true, message: "Erreur lors de l'exportation" };
      },
    });
  }

  public onSearch() {
    const code = this.searchForm.value.code?.trim() || '';
    this.listOptions.searching = code !== '';
    this.listOptions.query = code;

    this.alert.show = this.listOptions.searching || this.listOptions.filtering;
    this.alert.message = 'Cette liste est filtrée';

    this.restoreList();
    this.loadSorties();
  }

  // 4. Update onFilter to handle numeric IDs and articleId
  onFilter(data: any) {
    this.setModals({ showFilterModal: false });
    this.listOptions.filtering = true;
    this.listOptions.date = data.date;

    this.listOptions.chantierId = data.chantierId
      ? Number(data.chantierId)
      : undefined;
    this.listOptions.compteId = data.compteId
      ? Number(data.compteId)
      : undefined;
    this.listOptions.articleId = data.articleId
      ? Number(data.articleId)
      : undefined;

    this.alert.show = true;
    this.alert.message = 'Cette liste est filtrée';
    this.restoreList();
    this.loadSorties();
  }

  // 5. Ensure onRestore clears everything
  onRestore() {
    this.listOptions.searching = false;
    this.listOptions.filtering = false;
    this.listOptions.query = '';
    this.searchForm.reset(); // Clear the search input
    this.alert.show = false;
    this.restoreList();
    this.loadSorties();
  }

  restoreList() {
    this.pagination = { page: 1, lastPage: false };
    this.sorties = [];
  }
}

interface ModalSettings {
  showAddModal?: boolean;
  showDetailsModal?: boolean;
  showFilterModal?: boolean;
  showSortModal?: boolean;
  showExportModal?: boolean;
  showArticlesModal?: boolean;
}
