import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AddChantierModalComponent } from '../../../../components/addition-modals/add-chantier-modal/add-chantier-modal.component';
import { ChantierDetailsModalComponent } from '../../../../components/details-modals/chantier-details-modal/chantier-details-modal.component';
import { SortChantiersModalComponent } from '../../../../components/sort-modals/sort-chantiers-modal/sort-chantiers-modal.component';
import { FilterChantiersModalComponent } from '../../../../components/filter-modals/filter-chantiers-modal/filter-chantiers-modal.component';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ErrorComponent } from '../../../../components/error/error.component';
import { AlertComponent } from '../../../../components/alert/alert.component';
import {
  ChantierListResponse,
  ChantierModel,
} from '../../../../models/chantier.model';
import { ChantiersService } from '../../../../services/chantiers.service';
import { ExportService } from '../../../../services/export.service';
import { ExportModalComponent } from '../../../../components/export-modal/export-modal.component';
import { LoadingComponent } from '../../../../components/loading/loading.component';
import { AuthenticationService } from '../../../../services/authentication.service';
import { Router } from '@angular/router';
import { rolePermissions } from '../../../../roles';

@Component({
  selector: 'app-chantiers',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AddChantierModalComponent,
    ChantierDetailsModalComponent,
    FilterChantiersModalComponent,
    ErrorComponent,
    AlertComponent,
    ExportModalComponent,
    LoadingComponent,
  ],
  templateUrl: './chantiers.component.html',
  styleUrl: './chantiers.component.css',
})
export class ChantiersComponent implements OnInit {
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

  chantiers: ChantierModel[] = [];
  selectedChantier: ChantierModel | null = null;

  responsables: any[] = [];

  /* ---------- list state ---------- */
  listOptions = {
    searching: false,
    query: '',
    filtering: false,
    code: '',
    adresse: '',
    compteId: undefined as number | undefined,
  };
  pagination = { page: 1, lastPage: false };

  loading = false;

  /* ---------- UI helpers ---------- */
  error = { show: false, message: '' };
  alert = { show: false, message: '' };

  searchForm = new FormGroup({ nom: new FormControl('') });

  constructor(
    private readonly chantiersService: ChantiersService,
    private readonly exportService: ExportService,
    private readonly authService: AuthenticationService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();

    currentUser.subscribe({
      next: (user) => {
        if (rolePermissions[user.role].includes('classement')) {
          this.fetchChantiers();
          this.loadResponsables();
        } else {
          this.router.navigate(['../../../login']);
        }
      },
    });
  }

  loadResponsables() {
    this.authService.fetchResponsables().subscribe({
      next: (res) => (this.responsables = res.comptes),
      error: () => console.error('Impossible de charger les responsables'),
    });
  }

  fetchChantiers() {
    this.loading = true;
    this.chantiersService
      .fetchChantiers(this.pagination.page, this.listOptions)
      .subscribe({
        next: (res: ChantierListResponse) => {
          this.loading = false;
          this.chantiers = [...this.chantiers, ...res.chantiers];
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
    this.fetchChantiers();
  }

  restoreList() {
    this.pagination = { page: 1, lastPage: false };
    this.chantiers = [];
  }

  onSelectChantier(code: string) {
    this.selectedChantier = this.chantiers.find((c) => c.code === code) || null;
    this.setModals({ showDetailsModal: true });
  }

  onCreateChantier(newChantier: ChantierModel) {
    this.chantiers = [newChantier, ...this.chantiers];
    this.setModals({ showAddModal: false });
  }

  onUpdateChantier(data: { nom: string; adresse: string; compteId: number }) {
    this.setModals({ showDetailsModal: false });

    this.chantiers = this.chantiers.map((c) =>
      c.code === this.selectedChantier!.code
        ? {
            ...c,
            nom: data.nom,
            adresse: data.adresse,
            compte: this.responsables.find(
              (compte) => compte.id == data.compteId,
            ),
          }
        : c,
    );
  }

  onDeleteChantier() {
    this.setModals({ showDetailsModal: false });
    this.chantiers = this.chantiers.filter(
      (c) => c.code !== this.selectedChantier!.code,
    );
  }

  /* ---------- search ---------- */
  onSearch() {
    const nom = this.searchForm.value.nom?.trim() || '';
    this.listOptions.searching = nom !== '';
    this.listOptions.query = nom;
    this.alert.show = this.listOptions.searching || this.listOptions.filtering;
    this.alert.message = 'Cette liste est filtrée';
    this.restoreList();
    this.fetchChantiers();
  }

  /* ---------- filter ---------- */
  onFilter(data: { adresse: string; compteId: number | undefined }) {
    this.setModals({ showFilterModal: false });
    this.listOptions.filtering = true;
    this.listOptions.adresse = data.adresse;
    this.listOptions.compteId = data.compteId;
    this.alert.show = true;
    this.alert.message = 'Cette liste est filtrée';
    this.restoreList();
    this.fetchChantiers();
  }

  onRestore() {
    this.listOptions.searching = false;
    this.listOptions.filtering = false;
    this.alert.show = false;
    this.restoreList();
    this.fetchChantiers();
  }

  onExport(option: string) {
    this.setModals({ showExportModal: false });

    const chantiersToExport = option === 'liste' ? this.chantiers : [];

    console.log(chantiersToExport);

    this.exportService.exportChantiers(chantiersToExport).subscribe({
      next: (response: any) => {
        this.exportService.downloadFile(response, 'chantiers.xlsx');
      },
      error: (err) => {
        console.error('Export failed', err);
        this.error = { show: true, message: "Échec de l'exportation" };
      },
    });
  }

  chantierDetails(chantierId: string) {
    this.router.navigate([`/dashboard/historique-chantier/${chantierId}`]);
  }
}

interface ModalSettings {
  showAddModal?: boolean;
  showDetailsModal?: boolean;
  showFilterModal?: boolean;
  showSortModal?: boolean;
  showExportModal?: boolean;
}
