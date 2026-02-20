import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AddCategorieModalComponent } from '../../../../components/addition-modals/add-categorie-modal/add-categorie-modal.component';
import { CategorieDetailsModalComponent } from '../../../../components/details-modals/categorie-details-modal/categorie-details-modal.component';
import { FilterCategorieModalComponent } from '../../../../components/filter-modals/filter-categorie-modal/filter-categorie-modal.component';
import { SortCategoriesModalComponent } from '../../../../components/sort-modals/sort-categories-modal/sort-categories-modal.component';
import {
  FamilleListResponseModel,
  FamilleModel,
} from '../../../../models/familles.model';
import { SousFamilleModel } from '../../../../models/sous-familles.model';
import {
  CategoriesService,
  FetchCategoriesOptions,
} from '../../../../services/categories.service';
import {
  CategoriesListResposne,
  Category,
  CreerCategorieResponse,
} from '../../../../models/categories.model';
import { FamillesService } from '../../../../services/familles.service';
import { AlertComponent } from '../../../../components/alert/alert.component';
import { ErrorComponent } from '../../../../components/error/error.component';
import { FilterOptions } from '../../../../services/sous-familles.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ExportModalComponent } from '../../../../components/export-modal/export-modal.component';
import { ExportService } from '../../../../services/export.service';
import { LoadingComponent } from '../../../../components/loading/loading.component';
import { rolePermissions } from '../../../../roles';
import { AuthenticationService } from '../../../../services/authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-categories',
  imports: [
    CommonModule,
    AddCategorieModalComponent,
    CategorieDetailsModalComponent,
    FilterCategorieModalComponent,
    AlertComponent,
    ErrorComponent,
    ReactiveFormsModule,
    ExportModalComponent,
    LoadingComponent,
  ],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css',
})
export class CategoriesComponent implements OnInit {
  public modalSettings: ModalSettings = {
    showAddModal: false,
    showDetailsModal: false,
    showFilterModal: false,
    showSortModal: false,
    showExportModal: false,
  };

  public setModals(options: ModalSettings) {
    Object.keys(options).forEach((key) => {
      let keyValue: boolean = options[key];
      this.modalSettings[key] = keyValue;
    });
  }

  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly famillesService: FamillesService,
    private readonly exportService: ExportService,
    private readonly categorieService: CategoriesService,
    private readonly authenticationService: AuthenticationService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    const currentUser = this.authenticationService.getCurrentUser();

    currentUser.subscribe({
      next: (user) => {
        if (rolePermissions[user.role].includes('classement')) {
          this.famillesService.listeFamilles().subscribe({
            next: (result: FamilleListResponseModel) => {
              this.familles = result.familles;
            },
            error: () => {
              this.error = {
                show: true,
                message: 'Un erreur est survenu',
              };
            },
          });

          this.fetchCategories();
        } else {
          this.router.navigate(['../../../login']);
        }
      },
    });
  }

  public error = {
    show: false,
    message: '',
  };

  public alert = {
    show: false,
    message: '',
  };

  public pagination = {
    page: 1,
    lastPage: false,
  };

  public listOptions = {
    searching: false,
    query: '',
    filtering: false,
    sousFamilleId: '',
  };

  public searchForm = new FormGroup({
    query: new FormControl(''),
  });

  public loading = false;

  public categories: Category[] = [];
  public familles: FamilleModel[] = [];

  public categorieDetails: Category = null;

  public getListingOptions(): FetchCategoriesOptions {
    let listingOptions: any = {};
    if (this.listOptions.filtering)
      listingOptions.sousFamilleId = this.listOptions.sousFamilleId;
    if (this.listOptions.searching)
      listingOptions.query = this.listOptions.query;

    return listingOptions;
  }

  public fetchCategories() {
    let options = this.getListingOptions();

    this.loading = true;
    this.categoriesService
      .fetchCategories(this.pagination.page, options)
      .subscribe({
        next: (result: CategoriesListResposne) => {
          this.loading = false;
          this.categories = [...this.categories, ...result.categories];
          this.pagination.lastPage = result.lastPage;
        },
        error: () => {
          this.loading = false;
          this.error = {
            show: true,
            message: 'Un erreur est survenu',
          };
        },
      });
  }

  public onSearch() {
    this.listOptions.searching = true;
    this.listOptions.query = this.searchForm.value.query;
    this.categories = [];
    this.pagination = {
      page: 1,
      lastPage: false,
    };
    this.alert = {
      show: true,
      message: 'Ce liste est filtré',
    };

    this.fetchCategories();
  }

  public onFilter(sousFamilleId: string) {
    this.setModals({ showFilterModal: false });
    this.listOptions.filtering = true;
    this.listOptions.sousFamilleId = sousFamilleId;
    this.categories = [];
    this.pagination = {
      page: 1,
      lastPage: false,
    };
    this.alert = {
      show: true,
      message: 'Ce liste est filtré',
    };

    this.fetchCategories();
  }

  public onRestore() {
    this.listOptions = {
      searching: false,
      filtering: false,
      query: '',
      sousFamilleId: '',
    };

    this.categories = [];
    this.pagination = {
      page: 1,
      lastPage: false,
    };

    this.alert = {
      show: false,
      message: '',
    };

    this.searchForm.setValue({
      query: '',
    });

    this.fetchCategories();
  }

  public onCreate(categorie: Category) {
    this.setModals({
      showAddModal: false,
    });
    this.categories.unshift(categorie);
  }

  public selectCategorie(id: number) {
    this.categorieDetails = this.categories.find((c) => c.id == id);
    this.setModals({
      showDetailsModal: true,
    });
  }

  public afficherPlus() {
    this.pagination.page++;
    this.fetchCategories();
  }

  public onUpdate(event: Category) {
    console.log(event);

    this.setModals({ showDetailsModal: false });
    this.categories = this.categories.map((c) => {
      if (c.id == event.id)
        return {
          ...c,
          nom: event.nom,
          sous_famille: event.sous_famille,
        };
      else return c;
    });
  }

  public onDelete(id: number) {
    this.setModals({ showDetailsModal: false });
    this.categories = this.categories.filter((c) => c.id != id);
  }

  public onExport(option: string) {
    this.setModals({ showExportModal: false });

    const categories = option == 'liste' ? this.categories : [];
  }
}

interface ModalSettings {
  showAddModal?: boolean;
  showDetailsModal?: boolean;
  showFilterModal?: boolean;
  showSortModal?: boolean;
  showExportModal?: boolean;
}
