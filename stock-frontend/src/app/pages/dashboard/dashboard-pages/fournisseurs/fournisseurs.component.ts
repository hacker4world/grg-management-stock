import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AddFournisseurModalComponent } from '../../../../components/addition-modals/add-fournisseur-modal/add-fournisseur-modal.component';
import { FourniseeurDetailsModalComponent } from '../../../../components/details-modals/fourniseeur-details-modal/fourniseeur-details-modal.component';
import { SortFournisseursModalComponent } from '../../../../components/sort-modals/sort-fournisseurs-modal/sort-fournisseurs-modal.component';
import {
  FournisseurListResponseModel,
  FournisseurModel,
} from '../../../../models/fournisseurs.model';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FournisseursService } from '../../../../services/fournisseurs.service';
import { FilterFournisseursModalComponent } from '../../../../components/filter-modals/filter-fournisseurs-modal/filter-fournisseurs-modal.component';
import { AlertComponent } from '../../../../components/alert/alert.component';
import { ExportModalComponent } from '../../../../components/export-modal/export-modal.component';
import { ExportService } from '../../../../services/export.service';
import { LoadingComponent } from '../../../../components/loading/loading.component';
import { AuthenticationService } from '../../../../services/authentication.service';
import { Router } from '@angular/router';
import { rolePermissions } from '../../../../roles';

@Component({
  selector: 'app-fournisseurs',
  imports: [
    CommonModule,
    AddFournisseurModalComponent,
    FourniseeurDetailsModalComponent,
    SortFournisseursModalComponent,
    ReactiveFormsModule,
    FilterFournisseursModalComponent,
    AlertComponent,
    ExportModalComponent,
    LoadingComponent,
  ],
  templateUrl: './fournisseurs.component.html',
  styleUrl: './fournisseurs.component.css',
})
export class FournisseursComponent {
  public modalSettings: ModalSettings = {
    showAddModal: false,
    showDetailsModal: false,
    showSortModal: false,
    showFilterModal: false,
    showExportModal: false,
  };

  public setModals(options: ModalSettings) {
    Object.keys(options).forEach((key) => {
      let keyValue: boolean = options[key];
      this.modalSettings[key] = keyValue;
    });
    console.log(this.modalSettings);
  }

  public pagination = { page: 1, lastPage: false };
  public fournisseurs: FournisseurModel[] = [];
  public fournisseurDetails: FournisseurModel | null = null;

  public loading = false;
  public error = { show: false, message: '' };
  public alert = { show: false, message: '' };

  public searchForm = new FormGroup({ search: new FormControl('') });

  public listOptions = {
    searching: false,
    query: '', // search string
    filtering: false, // true when a filter is active
    contact: '',
    adresse: '',
  };

  public onSearch(): void {
    this.listOptions.searching = true;
    this.listOptions.query = this.searchForm.value.search;

    this.resetListAndFetch();
  }

  public onFilterFournisseurs(criteria: {
    contact?: string;
    adresse?: string;
  }): void {
    this.setModals({ showFilterModal: false });

    this.listOptions.filtering = true;
    this.listOptions.contact = criteria.contact ?? '';
    this.listOptions.adresse = criteria.adresse ?? '';

    this.resetListAndFetch();
  }

  public onRestore(): void {
    this.listOptions = {
      searching: false,
      query: '',
      filtering: false,
      contact: '',
      adresse: '',
    };
    this.searchForm.reset({ search: '' });
    this.resetListAndFetch();
  }

  private resetListAndFetch(): void {
    this.fournisseurs = []; // clear current rows
    this.pagination = { page: 1, lastPage: false };
    this.loadPage(); // re-fetch with new options
  }

  constructor(
    private readonly fournisseursService: FournisseursService,
    private readonly exportService: ExportService,
    private readonly authenticationService: AuthenticationService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    const currentUser = this.authenticationService.getCurrentUser();

    currentUser.subscribe({
      next: (user) => {
        if (rolePermissions[user.role].includes('fournisseurs')) {
          this.loadPage();
        } else {
          this.router.navigate(['../../login']);
        }
      },
    });
  }

  public loadMore() {
    this.pagination.page++;
    this.loadPage();
  }

  private loadPage(): void {
    this.loading = true;

    let listOptions: any = {};

    if (this.listOptions.searching) listOptions.nom = this.listOptions.query;
    if (this.listOptions.filtering) {
      listOptions.adresse = this.listOptions.adresse;
      listOptions.contact = this.listOptions.contact;
    }

    this.fournisseursService
      .fetchFournisseurs(this.pagination.page, listOptions)
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          this.fournisseurs = [...this.fournisseurs, ...res.fournisseurs];
          this.pagination.lastPage = res.lastPage;
        },
        error: () => {
          this.loading = false;
          this.error = {
            show: true,
            message: 'Une erreur est survenu',
          };
        },
      });
  }

  public onFournisseurCreated(data: FournisseurModel) {
    this.fournisseurs.unshift(data);
    this.setModals({ showAddModal: false });
  }

  public selectFournisseur(code: number) {
    this.fournisseurDetails =
      this.fournisseurs.find((f) => f.code === code) ?? null;
    this.setModals({ showDetailsModal: true });
  }

  public onFournisseurUpdate(updated: FournisseurModel) {
    this.fournisseurs = this.fournisseurs.map((f) =>
      f.code === this.fournisseurDetails.code
        ? { code: this.fournisseurDetails.code, ...updated }
        : f,
    );
    this.setModals({ showDetailsModal: false });
  }

  public onFournisseurDelete() {
    this.fournisseurs = this.fournisseurs.filter(
      (f) => f.code !== this.fournisseurDetails.code,
    );
    this.setModals({ showDetailsModal: false });
  }

  public onExport(option: string) {
    this.setModals({ showExportModal: false });

    const fournisseurs = option == 'liste' ? this.fournisseurs : [];

    console.log(fournisseurs);

    this.exportService.exportFournisseurs(fournisseurs).subscribe({
      next: (response: any) =>
        this.exportService.downloadFile(response, 'fournisseurs.xlsx'),
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
