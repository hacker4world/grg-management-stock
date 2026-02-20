import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ErrorComponent } from '../../error/error.component';
import { SortieEnAttenteModel } from '../../../models/sorties-en-attente.model';
import { ChantiersService } from '../../../services/chantiers.service';
import { ChantierModel } from '../../../models/chantier.model';
import { SortiesEnAttenteService } from '../../../services/sorties-en-attente.service';
import { ConfirmDeleteComponent } from '../../deletion-modals/confirm-delete/confirm-delete';
import { SortiesConfirmesService } from '../../../services/sorties-confirmes.service';

@Component({
  selector: 'app-sortie-en-attente-details-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ErrorComponent,
    ConfirmDeleteComponent,
  ],
  templateUrl: './sortie-en-attente-details-modal.component.html',
  styleUrls: ['./sortie-en-attente-details-modal.component.css'],
})
export class SortieEnAttenteDetailsModalComponent {
  @Input() sortie!: SortieEnAttenteModel;
  @Output() close = new EventEmitter<void>();
  @Output() delete = new EventEmitter();

  confirmationModal = false;

  error = {
    show: false,
    message: '',
  };

  constructor(
    private readonly sortiesEnAttenteService: SortiesEnAttenteService,
  ) {}

  confirmer() {
    this.sortiesEnAttenteService
      .confirmDeny(this.sortie.id, 'confirm')
      .subscribe({
        next: () => {
          this.delete.emit();
        },
        error: (err) => {
          console.log(err);
          
          this.error = {
            show: true,
            message: err.error?.message || 'Erreur lors de la confirmation de la sortie',
          };
        },
      });
  }

  refuser() {
    this.sortiesEnAttenteService.confirmDeny(this.sortie.id, 'deny').subscribe({
      next: () => {
        this.delete.emit();
      },
      error: () => {
        this.error = {
          show: true,
          message: 'Erreur lors du refus de la sortie',
        };
      },
    });
  }

  onClose(): void {
    this.close.emit();
  }
}
