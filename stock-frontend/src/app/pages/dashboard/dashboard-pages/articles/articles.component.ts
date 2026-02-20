import { Component, OnInit } from '@angular/core';
import { AddArticleModalComponent } from '../../../../components/addition-modals/add-article-modal/add-article-modal.component';
import { CommonModule } from '@angular/common';
import { ArticleDetailsModalComponent } from '../../../../components/details-modals/article-details-modal/article-details-modal.component';
import { FilterArticlesModalComponent } from '../../../../components/filter-modals/filter-articles-modal/filter-articles-modal.component';
import { SortArticlesModalComponent } from '../../../../components/sort-modals/sort-articles-modal/sort-articles-modal.component';
import { AlertComponent } from '../../../../components/alert/alert.component';
import { ErrorComponent } from '../../../../components/error/error.component';
import { ArticlesService } from '../../../../services/articles.service';
import {
  Article,
  ArticleListResponseModel,
} from '../../../../models/articles.model';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ExportModalComponent } from '../../../../components/export-modal/export-modal.component';
import { ExportService } from '../../../../services/export.service';
import { LoadingComponent } from '../../../../components/loading/loading.component';
import { ConfigurationService } from '../../../../services/configuration.service';
import { FournisseursListModalComponent } from '../../../../components/details-modals/fournisseurs-list-modal/fournisseurs-list-modal.component';
import { AuthenticationService } from '../../../../services/authentication.service';
import { Router } from '@angular/router';
import { rolePermissions } from '../../../../roles';

@Component({
  selector: 'app-articles',
  imports: [
    AddArticleModalComponent,
    CommonModule,
    ArticleDetailsModalComponent,
    FilterArticlesModalComponent,
    SortArticlesModalComponent,
    AlertComponent,
    ErrorComponent,
    ReactiveFormsModule,
    ExportModalComponent,
    LoadingComponent,
    FournisseursListModalComponent,
  ],
  templateUrl: './articles.component.html',
  styleUrl: './articles.component.css',
  standalone: true,
})
export class ArticlesComponent implements OnInit {
  public modalSettings: ModalSettings = {
    showAddModal: false,
    showDetailsModal: false,
    showFilterModal: false,
    showSortModal: false,
    showExportModal: false,
    showFournisseursModal: false,
  };

  public setModals(options: ModalSettings) {
    Object.keys(options).forEach((key) => {
      let keyValue: boolean = options[key as keyof ModalSettings]!;
      this.modalSettings[key as keyof ModalSettings] = keyValue;
    });
  }

  articles: Article[] = [];
  selectedArticle: Article | null = null;

  /* ---------- list state ---------- */
  pagination = { page: 1, lastPage: false };

  public role = '';

  public filtered = false; // true when a filter is active
  listOptions = {
    searching: false,
    query: '',
    filtering: false,
    prixMoyenne: '',
    stockActuel: '',
    stockMinimum: '',
    uniteId: '',
    categorieId: '',
    depotId: '',
  };

  loading = false;

  /* ---------- unites and depots ---------- */
  unites: any[] = [];
  depots: any[] = [];
  loadingInitialData = false;

  /* ---------- UI helpers ---------- */
  error = { show: false, message: '' };
  alert = { show: false, message: '' };

  searchForm = new FormGroup({ nom: new FormControl('') });

  constructor(
    private readonly articlesService: ArticlesService,
    private readonly exportService: ExportService,
    private readonly configurationService: ConfigurationService,
    private readonly authenticationService: AuthenticationService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    const currentUser = this.authenticationService.getCurrentUser();

    currentUser.subscribe({
      next: (user) => {
        this.role = user.role;

        if (rolePermissions[user.role].includes('articles')) {
          this.fetchArticles();
          this.fetchUnitesAndDepots();
        } else {
          this.router.navigate(['../../login']);
        }
      },
    });
  }

  fetchUnitesAndDepots(): void {
    this.loadingInitialData = true;

    // Fetch unites
    this.configurationService.listUnites().subscribe({
      next: (response: any) => {
        this.unites = response.unites || [];
      },
      error: () => {
        this.error = {
          show: true,
          message: 'Erreur lors du chargement des unités',
        };
      },
    });

    // Fetch depots
    this.configurationService.listDepots().subscribe({
      next: (response: any) => {
        this.depots = response.depots || [];
        this.loadingInitialData = false;
      },
      error: () => {
        this.loadingInitialData = false;
        this.error = {
          show: true,
          message: 'Erreur lors du chargement des dépôts',
        };
      },
    });
  }

  fetchArticles() {
    this.loading = true;
    this.articlesService
      .fetchProducts(this.pagination.page, this.listOptions)
      .subscribe({
        next: (res: ArticleListResponseModel) => {
          this.loading = false;
          this.articles = [...this.articles, ...res.articles];
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
    this.fetchArticles();
  }

  restoreList() {
    this.pagination = { page: 1, lastPage: false };
    this.articles = [];
  }

  onSelectArticle(id: number) {
    this.selectedArticle = this.articles.find((a) => a.id === id) || null;
    this.setModals({ showDetailsModal: true });
  }

  onCreateArticle(newArticle: Article) {
    this.articles = [newArticle, ...this.articles]; // optimistic prepend
    this.setModals({ showAddModal: false });
  }

  // NEW: Handle article update
  onUpdateArticle(updatedData: {
    nom: string;
    stockMin: number;
    depotId: number;
    uniteId: number;
    categorieId: number;
  }) {
    this.setModals({ showDetailsModal: false });

    if (this.selectedArticle) {
      this.articles = this.articles.map((a) =>
        a.id === this.selectedArticle!.id
          ? {
              ...a,
              nom: updatedData.nom,
              stockMinimum: updatedData.stockMin,
              depot: this.depots.find((d) => d.id === updatedData.depotId),
              unite: this.unites.find((u) => u.id === updatedData.uniteId),
              categorie: {
                ...a.categorie,
                id: updatedData.categorieId,
              },
            }
          : a,
      );
    }
  }

  // NEW: Handle article deletion
  onDeleteArticle() {
    this.setModals({ showDetailsModal: false });
    if (this.selectedArticle) {
      this.articles = this.articles.filter(
        (a) => a.id !== this.selectedArticle!.id,
      );
    }
  }

  onExport(option: string) {
    this.setModals({ showExportModal: false });

    let articles = option == 'liste' ? this.articles : [];

    this.exportService.exportArticles(articles).subscribe({
      next: (response: any) =>
        this.exportService.downloadFile(response, 'articles.xlsx'),
    });
  }

  onFilter(filterPayload: any) {
    this.setModals({ showFilterModal: false });

    this.listOptions.filtering = true;

    this.listOptions.prixMoyenne = filterPayload.prixMoyenne;
    this.listOptions.stockActuel = filterPayload.stockActuel;
    this.listOptions.stockMinimum = filterPayload.stockMin;
    this.listOptions.uniteId = filterPayload.uniteId;
    this.listOptions.depotId = filterPayload.depotId;
    this.listOptions.categorieId = filterPayload.categorieId;

    this.alert = {
      show: true,
      message: 'La liste est filtrée',
    };

    this.restoreList();
    this.fetchArticles();
  }

  onSearch() {
    const nom = this.searchForm.value.nom?.trim() || '';
    this.listOptions.searching = nom !== '';
    this.listOptions.query = nom;
    this.alert.show = this.listOptions.searching || this.listOptions.filtering;
    this.alert.message = 'Cette liste est filtrée';
    this.restoreList();
    this.fetchArticles();
    this.alert = {
      show: true,
      message: 'Liste est filtée',
    };
  }

  /* reset the list to its original state */
  onRestore() {
    this.listOptions.filtering = false;
    this.restoreList();
    this.fetchArticles();
    this.alert = {
      show: false,
      message: '',
    };
  }

  public afficherFournisseurs(article) {
    this.modalSettings.showFournisseursModal = true;
    this.selectedArticle = article;
  }
}

interface ModalSettings {
  showAddModal?: boolean;
  showDetailsModal?: boolean;
  showFilterModal?: boolean;
  showSortModal?: boolean;
  showExportModal?: boolean;
  showFournisseursModal?: boolean;
}
