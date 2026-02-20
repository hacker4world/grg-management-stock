import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { ErrorComponent } from '../../../../components/error/error.component';
import { AlertComponent } from '../../../../components/alert/alert.component';
import { LoadingComponent } from '../../../../components/loading/loading.component';
import { ExportModalComponent } from '../../../../components/export-modal/export-modal.component';

import { EntreeEnAttenteDetailsModalComponent } from '../../../../components/details-modals/entree-en-attente-details-modal/entree-en-attente-details-modal.component';
import { FilterEntreesEnAttenteModalComponent } from '../../../../components/filter-modals/filter-entrees-en-attente-modal/filter-entrees-en-attente-modal.component';
import { EntreeArticlesComponent } from '../../../../components/details-modals/entree-articles/entree-articles.component';

import {
  EntreeEnAttenteListResponse,
  EntreeEnAttenteModel,
} from '../../../../models/entrees-confirmes.model';
import { EntreesEnAttenteService } from '../../../../services/entree-en-attente.service';
import { ExportService } from '../../../../services/export.service';

import { ArticlesService } from '../../../../services/articles.service';
import { FournisseursService } from '../../../../services/fournisseurs.service';
import { FabriquantsService } from '../../../../services/fabriquants.service';
import { Article } from '../../../../models/articles.model';
import { FournisseurModel } from '../../../../models/fournisseurs.model';
import { FabriquantModel } from '../../../../models/fabriquants.model';
import { AuthenticationService } from '../../../../services/authentication.service';
import { Router } from '@angular/router';
import { rolePermissions } from '../../../../roles';

@Component({
  selector: 'app-entrees-en-attente',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ErrorComponent,
    AlertComponent,
    LoadingComponent,
    ExportModalComponent,
    EntreeEnAttenteDetailsModalComponent,
    FilterEntreesEnAttenteModalComponent,
    EntreeArticlesComponent,
  ],
  templateUrl: './entrees-en-attente.component.html',
  styleUrls: ['./entrees-en-attente.component.css'],
})
export class EntreesEnAttenteComponent implements OnInit {
  /* ---------- modals ---------- */
  modalSettings: ModalSettings = {
    showDetailsModal: false,
    showFilterModal: false,
    showExportModal: false,
  };

  setModals(options: ModalSettings) {
    Object.keys(options).forEach((k) => (this.modalSettings[k] = options[k]));
  }

  /* ---------- data ---------- */
  entrees: EntreeEnAttenteModel[] = [];
  selectedEntree: EntreeEnAttenteModel | null = null;

  // Reference data for filters
  articles: Article[] = [];
  fournisseurs: FournisseurModel[] = [];
  fabriquants: FabriquantModel[] = [];

  /* ---------- list state ---------- */
  listOptions = {
    searching: false,
    query: '',
    filtering: false,
    code: '',
    fournisseur: '',
    article: '',
    date: '',
    stock_entree: undefined as number | undefined,
    fabriquant: '',
    magazinier: '',
  };
  pagination = { page: 1, lastPage: false };

  loading = false;

  /* ---------- UI helpers ---------- */
  error = { show: false, message: '' };
  alert = { show: false, message: '' };

  // Articles modal state
  public showArticlesModal = false;
  public selectedArticles: any[] = [];

  searchForm = new FormGroup({ code: new FormControl('') });

  constructor(
    private readonly entreesService: EntreesEnAttenteService,
    private readonly exportService: ExportService,
    private readonly articlesService: ArticlesService,
    private readonly fournisseursService: FournisseursService,
    private readonly fabriquantsService: FabriquantsService,
    private readonly authenticationService: AuthenticationService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    const currentUser = this.authenticationService.getCurrentUser();

    currentUser.subscribe({
      next: (user) => {
        if (rolePermissions[user.role].includes('entrees-en-attente')) {
          this.fetchEntrees();
          this.loadArticles();
          this.loadFournisseurs();
          this.loadFabriquants();
        } else {
          this.router.navigate(['../../login']);
        }
      },
    });
  }

  // Load articles
  loadArticles() {
    this.articlesService
      .fetchProducts(0, { searching: false, filtering: false })
      .subscribe({
        next: (res) => {
          this.articles = res.articles;
        },
        error: () => {
          console.error('Impossible de charger les articles');
        },
      });
  }

  // Load fournisseurs
  loadFournisseurs() {
    this.fournisseursService.fetchFournisseurs(0, {}).subscribe({
      next: (res: any) => {
        this.fournisseurs = res.fournisseurs;
      },
      error: () => {
        console.error('Impossible de charger les fournisseurs');
      },
    });
  }

  // Load fabriquants
  loadFabriquants() {
    this.fabriquantsService
      .fetchFabriquants(0, {
        searching: false,
        query: '',
        filtering: false,
        code: '',
        adresse: '',
        contact: '',
      })
      .subscribe({
        next: (res: any) => {
          this.fabriquants = res.fabriquants;
        },
        error: () => {
          console.error('Impossible de charger les fabriquants');
        },
      });
  }

  /* ---------- core fetch ---------- */
  fetchEntrees() {
    this.loading = true;
    this.entreesService
      .fetchEntrees(this.pagination.page, this.listOptions)
      .subscribe({
        next: (res: EntreeEnAttenteListResponse) => {
          this.loading = false;
          this.entrees = [...this.entrees, ...res.entrees];
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
    this.fetchEntrees();
  }

  restoreList() {
    this.pagination = { page: 1, lastPage: false };
    this.entrees = [];
  }

  /* ---------- row click ---------- */
  onSelectEntree(code: string) {
    this.selectedEntree = this.entrees.find((e) => e.id === code) || null;
    this.setModals({ showDetailsModal: true });
  }

  /* ---------- articles modal ---------- */
  public openArticlesModal(event: Event, entree: EntreeEnAttenteModel): void {
    event.stopPropagation();
    this.selectedArticles = entree.entreeArticleItems || [];
    this.showArticlesModal = true;
  }

  public closeArticlesModal(): void {
    this.showArticlesModal = false;
    this.selectedArticles = [];
  }

  /* ---------- search ---------- */
  onSearch() {
    const code = this.searchForm.value.code?.trim() || '';

    // If search is empty, restore the list
    if (code === '') {
      this.onRestore();
      return;
    }

    this.listOptions.searching = true;
    this.listOptions.query = code;
    this.listOptions.code = code; // Add this line
    this.alert.show = true;
    this.alert.message = 'Cette liste est filtrée';
    this.restoreList();
    this.fetchEntrees();
  }

  /* ---------- filter ---------- */
  onFilter(data: {
    fournisseur: string;
    article: string;
    date: string;
    fabriquant: string;
    stock_entree: number | undefined;
    magazinier: string;
  }) {
    this.setModals({ showFilterModal: false });
    this.listOptions.filtering = true;
    this.listOptions.fournisseur = data.fournisseur;
    this.listOptions.article = data.article;
    this.listOptions.date = data.date;
    this.listOptions.fabriquant = data.fabriquant;
    this.listOptions.stock_entree = data.stock_entree;
    this.listOptions.magazinier = data.magazinier;
    this.alert.show = true;
    this.alert.message = 'Cette liste est filtrée';
    this.restoreList();
    this.fetchEntrees();
  }

  onRestore() {
    this.listOptions.searching = false;
    this.listOptions.filtering = false;
    this.listOptions.query = '';
    this.listOptions.code = '';
    this.searchForm.reset(); // Clear the search input
    this.alert.show = false;
    this.restoreList();
    this.fetchEntrees();
  }

  onValidateOrDeny() {
    this.setModals({ showDetailsModal: false });

    if (this.selectedEntree) {
      this.entrees = this.entrees.filter(
        (e) => e.id !== this.selectedEntree!.id,
      );
      this.selectedEntree = null;
    }
  }

  onExport(option: string) {
    this.setModals({ showExportModal: false });

    const listToExport = option === 'liste' ? this.entrees : [];

    this.exportService.exportEntrees(listToExport, false).subscribe({
      next: (response) =>
        this.exportService.downloadFile(response, 'entrees_en_attente.xlsx'),
      error: (err) => console.error('Export failed', err),
    });
  }
}

interface ModalSettings {
  showDetailsModal?: boolean;
  showFilterModal?: boolean;
  showExportModal?: boolean;
}
