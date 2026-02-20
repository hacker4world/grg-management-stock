import { Component, OnInit } from '@angular/core';
import { AddFamilyModalComponent } from '../../../../components/addition-modals/add-family-modal/add-family-modal.component';
import { FamilyDetailsModalComponent } from '../../../../components/details-modals/family-details-modal/family-details-modal.component';
import { CommonModule } from '@angular/common';
import { FamillesService } from '../../../../services/familles.service';
import {
  FamilleListResponseModel,
  FamilleModel,
} from '../../../../models/familles.model';
import { ErrorComponent } from '../../../../components/error/error.component';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AlertComponent } from '../../../../components/alert/alert.component';
import { ExportModalComponent } from '../../../../components/export-modal/export-modal.component';
import { ExportService } from '../../../../services/export.service';
import { LoadingComponent } from '../../../../components/loading/loading.component';
import { AuthenticationService } from '../../../../services/authentication.service';
import { Router } from '@angular/router';
import { rolePermissions } from '../../../../roles';

@Component({
  selector: 'app-familles',
  imports: [
    CommonModule,
    AddFamilyModalComponent,
    FamilyDetailsModalComponent,
    ErrorComponent,
    ReactiveFormsModule,
    AlertComponent,
    ExportModalComponent,
    LoadingComponent,
  ],
  templateUrl: './familles.component.html',
  styleUrl: './familles.component.css',
})
export class FamillesComponent implements OnInit {
  public modalSettings: ModalSettings = {
    showAddModal: false,
    showDetailsModal: false,
    showExportModal: false,
  };

  public pagination = {
    page: 1,
    lastPage: false,
  };

  public familles: FamilleModel[] = [];
  public familleDetails: FamilleModel = null;

  public loading = false;

  public error = {
    show: false,
    message: '',
  };

  public alert = {
    show: false,
    message: '',
  };

  public searchForm = new FormGroup({
    search: new FormControl(''),
  });

  constructor(
    private readonly famillesService: FamillesService,
    private readonly exportService: ExportService,
    private readonly authenticationService: AuthenticationService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    const currentUser = this.authenticationService.getCurrentUser();

    currentUser.subscribe({
      next: (user) => {
        if (rolePermissions[user.role].includes('classement')) {
          this.loading = true;

          this.famillesService.fetchFamilles(this.pagination.page).subscribe({
            next: (response: FamilleListResponseModel) => {
              this.familles = response.familles;
              this.pagination.lastPage = response.lastPage;
              this.loading = false;
            },
            error: (error) => {
              this.loading = false;
              this.error = {
                show: true,
                message: 'Un erreur est survenu',
              };
            },
          });
        } else {
          this.router.navigate(['../../../login']);
        }
      },
    });
  }

  public onFamilyCreated(data: FamilleModel) {
    this.familles.unshift(data);
    console.log(this.familles);
    this.setModals({
      showAddModal: false,
    });
  }

  public setModals(options: ModalSettings) {
    Object.keys(options).forEach((key) => {
      let keyValue: boolean = options[key];
      this.modalSettings[key] = keyValue;
    });
  }

  public fetchMore() {
    if (this.pagination.lastPage) return;

    this.loading = true;
    this.pagination.page++;

    if (this.alert.show) {
      alert('fetch more search results');
      this.famillesService
        .chercherFamilles(this.pagination.page, this.searchForm.value.search)
        .subscribe({
          next: (response: FamilleListResponseModel) => {
            this.familles = [...this.familles, ...response.familles];
            this.pagination.lastPage = response.lastPage;
            this.loading = false;
          },
          error: (error) => {
            this.loading = false;
            this.error = {
              show: true,
              message: 'Un erreur est survenu',
            };
          },
        });
    } else {
      this.famillesService.fetchFamilles(this.pagination.page).subscribe({
        next: (response: FamilleListResponseModel) => {
          this.familles = [...this.familles, ...response.familles];
          this.pagination.lastPage = response.lastPage;
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.error = {
            show: true,
            message: 'Un erreur est survenu',
          };
        },
      });
    }
  }

  public selectFamille(id: number) {
    let famille = this.familles.find((f) => f.id == id);
    console.log(famille);

    this.familleDetails = famille;
    this.setModals({
      showDetailsModal: true,
    });
  }

  public onFamilleUpdate(data: FamilleModel) {
    console.log(data);

    this.familles = this.familles.map((f) => {
      if (f.id === data.id) return { ...f, nom: data.nom };
      return f;
    });

    this.setModals({
      showDetailsModal: false,
    });
  }

  public onFamilleDelete(id: number) {
    this.familles = this.familles.filter((f) => f.id != id);
    this.setModals({
      showDetailsModal: false,
    });
  }

  public onSearch() {
    let searchQuery = this.searchForm.value.search;

    if (searchQuery.trim().length == 0) {
      this.pagination = {
        page: 0,
        lastPage: false,
      };

      this.alert = {
        message: '',
        show: false,
      };

      this.fetchMore();
    } else {
      this.pagination = {
        page: 1,
        lastPage: false,
      };

      this.famillesService
        .chercherFamilles(this.pagination.page, searchQuery)
        .subscribe({
          next: (response: FamilleListResponseModel) => {
            this.familles = response.familles;
            this.pagination.lastPage = response.lastPage;
            this.alert = {
              show: true,
              message: `Resultats du recherche : ${searchQuery}`,
            };
          },
          error: (err) => {
            console.log(err);
            this.error = {
              show: true,
              message: 'Un erreur est survenu',
            };
          },
        });
    }
  }

  public onRestore() {
    this.pagination = {
      page: 0,
      lastPage: false,
    };

    this.alert = {
      message: '',
      show: false,
    };

    this.searchForm.setValue({
      search: '',
    });

    this.familles = [];

    this.fetchMore();
  }

  public onExport(option: string) {
    this.setModals({ showExportModal: false });

    const familles = option == 'liste' ? this.familles : [];
  }
}

interface ModalSettings {
  showAddModal?: boolean;
  showDetailsModal?: boolean;
  showExportModal?: boolean;
}
