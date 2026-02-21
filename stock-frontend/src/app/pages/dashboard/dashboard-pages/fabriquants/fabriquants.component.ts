import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AddFabriquantModalComponent } from '../../../../components/addition-modals/add-fabriquant-modal/add-fabriquant-modal.component';
import { FabriquantDetailsModalComponent } from '../../../../components/details-modals/fabriquant-details-modal/fabriquant-details-modal.component';
import { FilterFabriquantModalComponent } from '../../../../components/filter-modals/filter-fabriquant-modal/filter-fabriquant-modal.component';
import {
  FabriquantListResponse,
  FabriquantModel,
} from '../../../../models/fabriquants.model';
import { FabriquantsService } from '../../../../services/fabriquants.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ErrorComponent } from '../../../../components/error/error.component';
import { AlertComponent } from '../../../../components/alert/alert.component';
import { ExportModalComponent } from '../../../../components/export-modal/export-modal.component';
import { ExportService } from '../../../../services/export.service';
import { LoadingComponent } from '../../../../components/loading/loading.component';
import { AuthenticationService } from '../../../../services/authentication.service';
import { rolePermissions } from '../../../../roles';
import { Router } from '@angular/router';
@Component({
  selector: 'app-fabriquants',
  imports: [
    CommonModule,
    AddFabriquantModalComponent,
    FabriquantDetailsModalComponent,
    FilterFabriquantModalComponent,
    ReactiveFormsModule,
    ErrorComponent,
    AlertComponent,
    ExportModalComponent,
    LoadingComponent,
  ],
  templateUrl: './fabriquants.component.html',
  styleUrl: './fabriquants.component.css',
})
export class FabriquantsComponent implements OnInit {
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
    console.log(this.modalSettings);
  }

  public fabriquants: FabriquantModel[] = [];
  public fabriquantDetails: FabriquantModel = null;

  public error = {
    show: false,
    message: '',
  };

  public alert = {
    show: false,
    message: '',
  };

  public listOptions = {
    searching: false,
    query: '',
    filtering: false,
    code: '',
    adresse: '',
    contact: '',
  };

  public pagination = {
    page: 1,
    lastPage: false,
  };

  public searchForm = new FormGroup({
    nom: new FormControl(''),
  });

  public loading = false;

  constructor(
    private readonly fabriquantsService: FabriquantsService,
    private readonly exportService: ExportService,
    private readonly authenticationService: AuthenticationService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    const currentUser = this.authenticationService.getCurrentUser();

    currentUser.subscribe({
      next: (user) => {
        if (rolePermissions[user.role].includes('fabriquants')) {
          this.fetchFabriquants();
        } else {
          this.router.navigate(['../../login']);
        }
      },
    });
  }

  public fetchFabriquants() {
    this.loading = true;
    this.fabriquantsService
      .fetchFabriquants(this.pagination.page, this.listOptions)
      .subscribe({
        next: (response: FabriquantListResponse) => {
          this.loading = false;
          this.fabriquants = [...this.fabriquants, ...response.fabriquants];
          this.pagination.lastPage = response.lastPage;
        },
        error: () => {
          this.loading = false;
          this.error = {
            show: true,
            message: 'Une erreur est survenue',
          };
        },
      });
  }

  public loadMore() {
    this.pagination.page++;
    this.fetchFabriquants();
  }

  public restoreList() {
    this.pagination = {
      page: 1,
      lastPage: false,
    };
    this.fabriquants = [];
  }

  public onSelectFabriquant(code: string) {
    this.fabriquantDetails = this.fabriquants.find((f) => f.code == code);
    this.setModals({ showDetailsModal: true });
  }

  public onUpdate(data) {
    this.setModals({
      showDetailsModal: false,
    });
    this.fabriquants = this.fabriquants.map((f) => {
      if (f.code == this.fabriquantDetails.code)
        return {
          ...f,
          nom: data.nom,
          adresse: data.adresse,
          contact: data.contact,
        };
      return f;
    });
  }

  public onDelete() {
    this.setModals({
      showDetailsModal: false,
    });
    this.fabriquants = this.fabriquants.filter(
      (f) => f.code != this.fabriquantDetails.code,
    );
  }

  public onSearch() {
    let nom = this.searchForm.value.nom;

    if (nom.trim() == '') {
      this.listOptions.searching = false;
      if (!this.listOptions.filtering) {
        this.alert = {
          show: false,
          message: '',
        };
      }
    } else {
      this.listOptions.searching = true;
      this.listOptions.query = nom;
      this.alert = {
        show: true,
        message: 'Cette liste est filtrée',
      };
    }
    this.restoreList();
    this.fetchFabriquants();
  }

  public onRestore() {
    this.listOptions.searching = false;
    this.listOptions.filtering = false;
    this.alert.show = false;
    this.restoreList();
    this.fetchFabriquants();
  }

  public onFilter(data) {
    this.setModals({
      showFilterModal: false,
    });
    this.listOptions.filtering = true;
    this.listOptions.adresse = data.adresse;
    this.listOptions.code = data.code;
    this.listOptions.contact = data.contact;
    this.alert = {
      show: true,
      message: 'Cette liste est filtrée',
    };
    this.restoreList();
    this.fetchFabriquants();
  }

  public onCreateFabriquant(newFabriquant: FabriquantModel): void {
    this.fabriquants = [newFabriquant, ...this.fabriquants];
    this.setModals({ showAddModal: false });
  }

  onExport(option: string) {
    this.setModals({ showExportModal: false });

    const fabriquants = option == 'liste' ? this.fabriquants : [];

    this.exportService.exportFabriquants(fabriquants).subscribe({
      next: (response) =>
        this.exportService.downloadFile(response, 'fabriquants.xlsx'),
    });
  }
}

interface ModalSettings {
  showAddModal?: boolean;
  showDetailsModal?: boolean;
  showFilterModal?: boolean;
  showSortModal?: boolean;
  showExportModal?: boolean;
}
