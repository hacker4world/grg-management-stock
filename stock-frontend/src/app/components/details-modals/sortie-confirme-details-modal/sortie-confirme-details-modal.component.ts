// sortie-confirme-details-modal.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ErrorComponent } from '../../error/error.component';
import { ConfirmDeleteComponent } from '../../deletion-modals/confirm-delete/confirm-delete';
import { CommonModule } from '@angular/common';
import { SortiesConfirmesService } from '../../../services/sorties-confirmes.service';
import { SortieConfirmeeModel } from '../../../models/sorties-confirmes.model';

@Component({
  selector: 'app-sortie-confirme-details-modal',
  standalone: true, // Ensure standalone is true
  imports: [ErrorComponent, ConfirmDeleteComponent, CommonModule],
  templateUrl: './sortie-confirme-details-modal.component.html',
  styleUrl: './sortie-confirme-details-modal.component.css',
})
export class SortieConfirmeDetailsModalComponent {
  @Input() sortie!: SortieConfirmeeModel;
  @Output() close = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  public confirmationModal = false;
  public error = { show: false, message: '' };

  constructor(private sortiesService: SortiesConfirmesService) {}

  public onClose() {
    this.close.emit();
  }

  public supprimer() {
    this.sortiesService.supprimerSortie(this.sortie.id).subscribe({
      next: () => {
        this.confirmationModal = false;
        this.delete.emit(); // Notify parent to remove from list
      },
      error: () => {
        this.error = {
          show: true,
          message: 'Une erreur est survenue lors de la suppression.',
        };
        this.confirmationModal = false;
      },
    });
  }

  public downloadFile() {
    window.open(
      `http://localhost:4000/api/documents/${this.sortie.documents[0].id}/download`,
      '_blank',
    );
  }
}
