import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  CompteEnAttenteModel,
  CompteEnAttenteListResponse,
} from '../../../../models/comptes-en-attente.model';
import {
  ComptesEnAttenteService,
  ListOptions,
} from '../../../../services/comptes-en-attente.service';
import { AlertComponent } from '../../../../components/alert/alert.component';
import { ErrorComponent } from '../../../../components/error/error.component';
import { CompteEnAttenteDetailsModalComponent } from '../../../../components/details-modals/compte-en-attente-details-modal/compte-en-attente-details-modal.component';
import { FilterComptesEnAttenteModalComponent } from '../../../../components/filter-modals/filter-comptes-en-attente-modal/filter-comptes-en-attente-modal.component';
import { ExportModalComponent } from '../../../../components/export-modal/export-modal.component';
import { ExportService } from '../../../../services/export.service';
import { LoadingComponent } from '../../../../components/loading/loading.component';
import { AuthenticationService } from '../../../../services/authentication.service';
import { Router } from '@angular/router';
import { rolePermissions } from '../../../../roles';

@Component({
  selector: 'app-comptes-en-attente',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AlertComponent,
    ErrorComponent,
    CompteEnAttenteDetailsModalComponent,
    FilterComptesEnAttenteModalComponent,
    ExportModalComponent,
    LoadingComponent,
  ],
  templateUrl: './comptes-en-attente.component.html',
  styleUrl: './comptes-en-attente.component.css',
})
export class ComptesEnAttenteComponent {
  modalSettings = {
    showDetailsModal: false,
    showFilterModal: false,
    showExportModal: false,
  };
  comptes: CompteEnAttenteModel[] = [];
  compteDetails: CompteEnAttenteModel | null = null;

  error = { show: false, message: '' };
  alert = { show: false, message: '' };

  listOptions: any = {
    searching: false,
    query: '',
    filtering: false,
    code: '',
    prenom: '',
    nomUtilisateur: '',
    role: '',
  };

  pagination = { page: 1, lastPage: false };
  searchForm = new FormGroup({ nom: new FormControl('') });
  loading = false;

  constructor(
    private readonly service: ComptesEnAttenteService,
    private readonly exportService: ExportService,
    private readonly authenticationService: AuthenticationService,
    private readonly router: Router,
  ) {}

  ngOnInit() {
    const currentUser = this.authenticationService.getCurrentUser();

    currentUser.subscribe({
      next: (user) => {
        if (rolePermissions[user.role].includes('comptes')) {
          this.fetchComptesEnAttente();
        } else {
          this.router.navigate(['../../login']);
        }
      },
    });
  }

  setModals(
    opts: Partial<{
      showDetailsModal: boolean;
      showFilterModal: boolean;
      showExportModal: boolean;
    }>,
  ) {
    Object.assign(this.modalSettings, opts);
  }

  fetchComptesEnAttente() {
    this.loading = true;
    this.service
      .fetchComptesEnAttente(this.pagination.page, this.listOptions)
      .subscribe({
        next: (res: CompteEnAttenteListResponse) => {
          this.loading = false;
          this.comptes = [...this.comptes, ...res.comptes];
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
    this.fetchComptesEnAttente();
  }

  restoreList() {
    this.pagination = { page: 1, lastPage: false };
    this.comptes = [];
  }

  onSelectCompte(id: string) {
    this.compteDetails = this.comptes.find((c) => c.id === id) || null;
    this.setModals({ showDetailsModal: true });
  }

  onSearch() {
    const nom = this.searchForm.value.nom?.trim() || '';
    this.listOptions.searching = nom !== '';
    this.listOptions.query = nom;
    this.alert.show = this.listOptions.searching || this.listOptions.filtering;
    this.alert.message = 'Cette liste est filtrée'; 
    this.restoreList();
    this.fetchComptesEnAttente();
  }

  onRestore() {
    this.listOptions.searching = false;
    this.listOptions.filtering = false;
    this.alert.show = false;
    this.searchForm.reset();
    this.restoreList();
    this.fetchComptesEnAttente();
  }

  onFilter(data: any) {
    this.setModals({ showFilterModal: false });
    this.listOptions.filtering = true;
    this.listOptions.code = data.code;
    this.listOptions.prenom = data.prenom;
    this.listOptions.nomUtilisateur = data.nomUtilisateur;
    this.listOptions.role = data.role;
    this.alert = { show: true, message: 'Cette liste est filtrée' };
    this.restoreList();
    this.fetchComptesEnAttente();
  }

  onAccepted() {
    this.comptes = this.comptes.filter((c) => c.id !== this.compteDetails!.id);
    this.setModals({ showDetailsModal: false });
  }

  onRefused() {
    this.comptes = this.comptes.filter((c) => c.id !== this.compteDetails!.id);
    this.setModals({ showDetailsModal: false });
  }

  onExport(option: string) {
    this.setModals({ showExportModal: false });
    const comptesToExport = option === 'liste' ? this.comptes : [];

    this.exportService.exportComptes(comptesToExport, false).subscribe({
      next: (response: Blob) => {
        this.exportService.downloadFile(response, 'comptes_en_attente.xlsx');
      },
      error: (err) => {
        console.error('Export failed', err);
        this.error = { show: true, message: "Échec de l'exportation" };
      },
    });
  }
}
