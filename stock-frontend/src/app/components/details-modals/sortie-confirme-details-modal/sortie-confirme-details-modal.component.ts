import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorComponent } from '../../error/error.component';
import { SortieEnAttenteModel } from '../../../models/sorties-en-attente.model';
import { SortiesEnAttenteService } from '../../../services/sorties-en-attente.service';
import { SortiesConfirmesService } from '../../../services/sorties-confirmes.service';
import { SortieConfirmeModel } from '../../../models/sorties-confirmes.model';
import { ConfirmDeleteComponent } from '../../deletion-modals/confirm-delete/confirm-delete';

@Component({
  selector: 'app-sortie-confirme-details-modal',
  standalone: true,
  imports: [ErrorComponent, CommonModule, ConfirmDeleteComponent],
  templateUrl: './sortie-confirme-details-modal.component.html',
  styleUrl: './sortie-confirme-details-modal.component.css',
})
export class SortieConfirmeDetailsModalComponent {
  @Input() sortie!: SortieConfirmeModel;
  @Output() close = new EventEmitter<void>();
  @Output() approved = new EventEmitter<void>();
  @Output() denied = new EventEmitter<void>();

  @Output() delete = new EventEmitter<void>();

  public error = { show: false, message: '' };

  public showConfirmationModal = false;

  public loading = false;

  constructor(private sortiesService: SortiesConfirmesService) {}

  public onClose() {
    this.close.emit();
  }

  public isInterne(): boolean {
    return (
      this.sortie.typeSortie === 'interne_depot' ||
      this.sortie.typeSortie === 'interne_chantier'
    );
  }

  public isExterne(): boolean {
    return this.sortie.typeSortie === 'externe';
  }

  public hasTransporteur(): boolean {
    if (this.sortie.typeSortie === 'interne_depot') {
      return !!(
        this.sortie.nomTransporteurDepot ||
        this.sortie.matriculeTransporteurDepot
      );
    }
    if (this.sortie.typeSortie === 'interne_chantier') {
      return !!(
        this.sortie.nomTransporteurChantier ||
        this.sortie.matriculeTransporteurChantier
      );
    }
    if (this.sortie.typeSortie === 'externe') {
      return this.sortie.sousTypeSortieExterne === 'avec_transporteur';
    }
    return false;
  }

  public approveSortie() {
    this.loading = true;
    this.error.show = false;

    // Call your approve endpoint
    this.sortiesService.approveSortie(this.sortie.id).subscribe({
      next: () => {
        this.loading = false;
        this.approved.emit();
      },
      error: (err) => {
        this.loading = false;
        this.error = {
          show: true,
          message: "Une erreur est survenue lors de l'approbation.",
        };
      },
    });
  }

  public denySortie() {
    this.loading = true;
    this.error.show = false;

    // Call your deny endpoint
    this.sortiesService.denySortie(this.sortie.id).subscribe({
      next: () => {
        this.loading = false;
        this.denied.emit();
      },
      error: (err) => {
        this.loading = false;
        this.error = {
          show: true,
          message: 'Une erreur est survenue lors du refus.',
        };
      },
    });
  }

  public downloadBandeCommande() {
    if (this.sortie.documents.length == 0) {
      this.error = {
        show: true,
        message: "Cet sortie n'a pas une bon de livraison",
      };
      return;
    }

    const documentId = this.sortie.documents[0].id;

    this.sortiesService.openDocument(documentId);
  }

  public supprimerSortie() {
    this.showConfirmationModal = false;

    this.loading = true;

    this.sortiesService.supprimerSortie(this.sortie.id).subscribe({
      next: () => {
        this.loading = false;
        this.delete.emit();
      },
      error: () => {
        this.loading = false;
        this.error = {
          show: true,
          message: 'Erreur de supression',
        };
      },
    });
  }
}
