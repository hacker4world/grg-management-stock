import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AddSubfamilyModalComponent } from '../../../../components/addition-modals/add-subfamily-modal/add-subfamily-modal.component';
import { SubfamilyDetailsModalComponent } from '../../../../components/details-modals/subfamily-details-modal/subfamily-details-modal.component';
import { FilterSubfamilyModalComponent } from '../../../../components/filter-modals/filter-subfamily-modal/filter-subfamily-modal.component';
import { SortSubfamilyModalComponent } from '../../../../components/sort-modals/sort-subfamily-modal/sort-subfamily-modal.component';
import {
  SousFamilleModel,
  SousFamillesListModel,
} from '../../../../models/sous-familles.model';
import { ErrorComponent } from '../../../../components/error/error.component';
import { AlertComponent } from '../../../../components/alert/alert.component';
import {
  FilterOptions,
  SousFamillesService,
} from '../../../../services/sous-familles.service';
import {
  FamilleListResponseModel,
  FamilleModel,
} from '../../../../models/familles.model';
import { FamillesService } from '../../../../services/familles.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ExportModalComponent } from '../../../../components/export-modal/export-modal.component';
import { ExportService } from '../../../../services/export.service';
import { LoadingComponent } from '../../../../components/loading/loading.component';
import { AuthenticationService } from '../../../../services/authentication.service';
import { Router } from '@angular/router';
import { rolePermissions } from '../../../../roles';

@Component({
  selector: 'app-sous-familles',
  imports: [
    CommonModule,
    AddSubfamilyModalComponent,
    SubfamilyDetailsModalComponent,
    FilterSubfamilyModalComponent,
    ErrorComponent,
    AlertComponent,
    ReactiveFormsModule,
    ExportModalComponent,
    LoadingComponent,
  ],
  templateUrl: './sous-familles.component.html',
  styleUrl: './sous-familles.component.css',
})
export class SousFamillesComponent implements OnInit {
  public modalSettings: ModalSettings = {
    showAddModal: false,
    showDetailsModal: false,
    showFilterModal: false,
    showExportModal: false,
  };

  public setModals(options: ModalSettings) {
    Object.keys(options).forEach((key) => {
      let keyValue: boolean = options[key];
      this.modalSettings[key] = keyValue;
    });
  }

  public sous_familles: SousFamilleModel[] = [];
  public familles: FamilleModel[] = [];

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
    familleId: '',
  };

  public loading = false;

  public searchForm = new FormGroup({
    search: new FormControl(''),
  });

  public sousFamilleDetails: SousFamilleModel = null;

  constructor(
    private readonly sousFamillesService: SousFamillesService,
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
          this.famillesService.listeFamilles().subscribe({
            next: (response: FamilleListResponseModel) => {
              this.loading = false;
              this.familles = response.familles;
            },
            error: () => {
              this.loading = false;
              this.error = {
                show: true,
                message: 'Un erreur est survenu',
              };
            },
          });

          this.fetchSousFamilles();
        } else {
          this.router.navigate(['../../../login']);
        }
      },
    });
  }

  public onCreate(sf: SousFamilleModel) {
    this.setModals({
      showAddModal: false,
    });

    this.sous_familles.unshift(sf);
  }

  public selectSousFamille(sousFamille: SousFamilleModel) {
    this.sousFamilleDetails = sousFamille;
    this.setModals({
      showDetailsModal: true,
    });
  }

  public onUpdate(data) {
    this.setModals({
      showDetailsModal: false,
    });

    this.sous_familles = this.sous_familles.map((sf) => {
      if (sf.id == data.id) {
        let famille = this.familles.find((f) => f.id == data.famille);
        return { ...sf, nom: data.nom, famille };
      }
      return sf;
    });
  }

  public onDelete() {
    this.sous_familles = this.sous_familles.filter(
      (sf) => sf.id != this.sousFamilleDetails.id,
    );
    this.setModals({
      showDetailsModal: false,
    });
  }

  public getListingOptions(): FilterOptions {
    let listingOptions: any = {};
    if (this.listOptions.filtering)
      listingOptions.familleId = this.listOptions.familleId;
    if (this.listOptions.searching)
      listingOptions.query = this.listOptions.query;

    return listingOptions;
  }

  public onFilter($event) {
    this.setModals({
      showFilterModal: false,
    });

    this.alert = {
      message: 'Ce liste est filtré',
      show: true,
    };
    this.listOptions.filtering = true;
    this.listOptions.familleId = $event;
    this.pagination = {
      page: 1,
      lastPage: false,
    };
    this.sous_familles = [];
    this.fetchSousFamilles();
  }

  public onSearch() {
    this.alert = {
      message: 'Ce liste est filtré',
      show: true,
    };
    this.listOptions.searching = true;
    this.listOptions.query = this.searchForm.value.search;
    this.pagination = {
      page: 1,
      lastPage: false,
    };

    this.sous_familles = [];
    this.fetchSousFamilles();
  }

  public onRestore() {
    this.listOptions = {
      filtering: false,
      searching: false,
      familleId: '',
      query: '',
    };
    this.sous_familles = [];
    this.pagination = {
      lastPage: false,
      page: 1,
    };
    this.alert = {
      message: '',
      show: false,
    };

    this.fetchSousFamilles();
  }

  public showMore() {
    this.pagination.page++;
    this.fetchSousFamilles();
  }

  public retry() {
    this.error.show = false;
    this.fetchSousFamilles();
  }

  public fetchSousFamilles() {
    this.loading = true;
    this.sousFamillesService
      .filtrerSousFamilles(this.pagination.page, this.getListingOptions())
      .subscribe({
        next: (response: SousFamillesListModel) => {
          this.loading = false;
          this.sous_familles = [
            ...this.sous_familles,
            ...response.sousFamilles,
          ];
          this.pagination.lastPage = response.lastPage;
        },
        error: () => {
          this.loading = false;
          this.error = {
            message: 'Un erreur est survenu',
            show: true,
          };
        },
      });
  }

  public onExport(option: string) {
    this.setModals({ showExportModal: false });

    const sf = option == 'liste' ? this.sous_familles : [];
  }
}

interface ModalSettings {
  showAddModal?: boolean;
  showDetailsModal?: boolean;
  showFilterModal?: boolean;
  showExportModal?: boolean;
}
