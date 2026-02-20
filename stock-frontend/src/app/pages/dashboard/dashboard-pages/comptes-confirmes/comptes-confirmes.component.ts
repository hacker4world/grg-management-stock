import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CompteConfirmeDetailsModalComponent } from '../../../../components/details-modals/compte-confirme-details-modal/compte-confirme-details-modal.component';
import { FilterComptesConfirmesModalComponent } from '../../../../components/filter-modals/filter-comptes-confirmes-modal/filter-comptes-confirmes-modal.component';
import {
  CompteConfirmeListResponse,
  CompteConfirmeModel,
} from '../../../../models/comptes-confirmes.model';
import {
  ComptesConfirmesService,
  ListOptions,
} from '../../../../services/comptes-confirmes.service';
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
  selector: 'app-comptes-confirmes',
  imports: [
    CommonModule,
    CompteConfirmeDetailsModalComponent,
    FilterComptesConfirmesModalComponent,
    ReactiveFormsModule,
    ErrorComponent,
    AlertComponent,
    ExportModalComponent,
    LoadingComponent,
  ],
  templateUrl: './comptes-confirmes.component.html',
  styleUrl: './comptes-confirmes.component.css',
})
export class ComptesConfirmesComponent {
  public modalSettings: ModalSettings = {
    showDetailsModal: false,
    showFilterModal: false,
    showExportModal: false,
  };

  public comptes: CompteConfirmeModel[] = [];
  public compteDetails: CompteConfirmeModel = null;

  public error = {
    show: false,
    message: '',
  };

  public alert = {
    show: false,
    message: '',
  };

  public listOptions: ListOptions = {
    searching: false,
    query: '',
    filtering: false,
    code: '',
    prenom: '',
    nomUtilisateur: '',
    role: '',
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
    private readonly comptesService: ComptesConfirmesService,
    private readonly exportService: ExportService,
    private readonly authenticationService: AuthenticationService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    const currentUser = this.authenticationService.getCurrentUser();

    currentUser.subscribe({
      next: (user) => {
        if (rolePermissions[user.role].includes('comptes')) {
          this.fetchComptesConfirmes();
        } else {
          this.router.navigate(['../../login']);
        }
      },
    });
  }

  public setModals(options: ModalSettings) {
    Object.keys(options).forEach((key) => {
      let keyValue: boolean = options[key];
      this.modalSettings[key] = keyValue;
    });
  }

  public fetchComptesConfirmes() {
    this.loading = true;
    this.comptesService
      .fetchComptesConfirmes(this.pagination.page, this.listOptions)
      .subscribe({
        next: (response: CompteConfirmeListResponse) => {
          this.loading = false;
          this.comptes = [...this.comptes, ...response.comptes];
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
    this.fetchComptesConfirmes();
  }

  public restoreList() {
    this.pagination = {
      page: 1,
      lastPage: false,
    };
    this.comptes = [];
  }

  public onSelectCompte(code: string) {
    this.compteDetails = this.comptes.find((c) => c.id == code);
    this.setModals({ showDetailsModal: true });
  }

  public onUpdate(data) {
    this.setModals({
      showDetailsModal: false,
    });
    this.comptes = this.comptes.map((c) => {
      if (c.id == this.compteDetails.id)
        return {
          ...c,
          nom: data.nom,
          prenom: data.prenom,
          nom_utilisateur: data.nomUtilisateur,
          role: data.role,
        };
      return c;
    });
  }

  public onDelete() {
    this.setModals({
      showDetailsModal: false,
    });
    this.comptes = this.comptes.filter((c) => c.id != this.compteDetails.id);
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
    this.fetchComptesConfirmes();
  }

  public onRestore() {
    this.listOptions.searching = false;
    this.listOptions.filtering = false;
    this.alert.show = false;
    this.restoreList();
    this.fetchComptesConfirmes();
  }

  public onFilter(data) {
    this.setModals({
      showFilterModal: false,
    });
    this.listOptions.filtering = true;
    this.listOptions.code = data.code;
    this.listOptions.prenom = data.prenom;
    this.listOptions.nomUtilisateur = data.nomUtilisateur;
    this.listOptions.role = data.role;
    this.alert = {
      show: true,
      message: 'Cette liste est filtrée',
    };
    this.restoreList();
    this.fetchComptesConfirmes();
  }

  public onExport(option: string) {
    this.setModals({ showExportModal: false });
    const comptesToExport = option === 'liste' ? this.comptes : [];

    this.exportService.exportComptes(comptesToExport, true).subscribe({
      next: (response: Blob) => {
        this.exportService.downloadFile(response, 'comptes_confirmes.xlsx');
      },
      error: (err) => {
        console.error('Export failed', err);
        this.error = { show: true, message: "Échec de l'exportation" };
      },
    });
  }
}

interface ModalSettings {
  showDetailsModal?: boolean;
  showFilterModal?: boolean;
  showExportModal?: boolean;
}
