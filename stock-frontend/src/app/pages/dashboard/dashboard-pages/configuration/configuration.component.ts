import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddDepotModalComponent } from '../../../../components/addition-modals/add-depot-modal/add-depot-modal.component';
import { AddUniteModalComponent } from '../../../../components/addition-modals/add-unite-modal/add-unite-modal.component';
import { DepotDetailsModalComponent } from '../../../../components/details-modals/depot-details-modal/depot-details-modal.component';
import { UniteDetailsModalComponent } from '../../../../components/details-modals/unite-details-modal/unite-details-modal.component';
import {
  ConfigurationService,
  Depot,
  Unite,
} from '../../../../services/configuration.service';
import { AuthenticationService } from '../../../../services/authentication.service';
import { Router } from '@angular/router';
import { rolePermissions } from '../../../../roles';
import { ExportService } from '../../../../services/export.service';
import { ExportModalComponent } from "../../../../components/export-modal/export-modal.component";

@Component({
  selector: 'app-configuration',
  standalone: true,
  imports: [
    CommonModule,
    AddDepotModalComponent,
    AddUniteModalComponent,
    DepotDetailsModalComponent,
    UniteDetailsModalComponent,
    ExportModalComponent
],
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.css'],
})
export class ConfigurationComponent implements OnInit {
  public modalSettings = {
    showAddDepotModal: false,
    showDepotDetailsModal: false,
    showAddUniteModal: false,
    showUniteDetailsModal: false,
    showExportDepotModal: false, // Add this
    showExportUniteModal: false, // Add this
  };

  public depots: Depot[] = [];
  public unites: Unite[] = [];
  public selectedDepot: Depot | null = null;
  public selectedUnite: Unite | null = null;

  constructor(
    private configService: ConfigurationService,
    private readonly authenticationService: AuthenticationService,
    private readonly router: Router,
    private readonly exportService: ExportService,
  ) {}

  ngOnInit(): void {
    const currentUser = this.authenticationService.getCurrentUser();

    currentUser.subscribe({
      next: (user) => {
        if (rolePermissions[user.role].includes('notifications')) {
          this.loadDepots();
          this.loadUnites();
        } else {
          this.router.navigate(['../../../login']);
        }
      },
    });
  }

  /* --------------------  DEPOTS  -------------------- */
  loadDepots() {
    this.configService.listDepots().subscribe((list: any) => {
      console.log(list);

      this.depots = list.depots;
    });
  }

  onDepotAdded() {
    this.loadDepots();
    this.modalSettings.showAddDepotModal = false;
  }

  onDepotUpdated() {
    this.loadDepots();
    this.modalSettings.showDepotDetailsModal = false;
  }

  onDepotDeleted() {
    this.loadDepots();
    this.modalSettings.showDepotDetailsModal = false;
  }

  openDepotDetail(depot: Depot) {
    this.selectedDepot = depot;
    this.modalSettings.showDepotDetailsModal = true;
  }

  /* --------------------  UNITES  -------------------- */
  loadUnites() {
    this.configService.listUnites().subscribe((list: any) => {
      console.log(list);

      this.unites = list.unites;
    });
  }

  onUniteAdded() {
    this.loadUnites();
    this.modalSettings.showAddUniteModal = false;
  }

  onUniteUpdated() {
    this.loadUnites();
    this.modalSettings.showUniteDetailsModal = false;
  }

  onUniteDeleted() {
    this.loadUnites();
    this.modalSettings.showUniteDetailsModal = false;
  }

  openUniteDetail(unite: Unite) {
    this.selectedUnite = unite;
    this.modalSettings.showUniteDetailsModal = true;
  }

  onExportDepots(option: string) {
    this.modalSettings.showExportDepotModal = false;
    const depotsToExport = option === 'liste' ? this.depots : [];

    this.exportService.exportDepots(depotsToExport).subscribe({
        next: (response: any) => {
          this.exportService.downloadFile(response, 'depots.xlsx');
        },
        error: (err) => console.error('Export depots failed', err),
      });
  }

  onExportUnites(option: string) {
    this.modalSettings.showExportUniteModal = false;
    const unitesToExport = option === 'liste' ? this.unites : [];

    this.exportService.exportUnites(unitesToExport).subscribe({
        next: (response: any) => {
          this.exportService.downloadFile(response, 'unites.xlsx');
        },
        error: (err) => console.error('Export unites failed', err),
      });
  }
}
