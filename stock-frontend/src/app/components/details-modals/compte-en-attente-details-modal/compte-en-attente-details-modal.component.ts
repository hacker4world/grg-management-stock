import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CompteEnAttenteModel } from '../../../models/comptes-en-attente.model';
import { ComptesEnAttenteService } from '../../../services/comptes-en-attente.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ErrorComponent } from '../../error/error.component';
import { CommonModule } from '@angular/common';
import { LoadingComponent } from '../../loading/loading.component';
import { ConfirmDeleteComponent } from '../../deletion-modals/confirm-delete/confirm-delete';

@Component({
  selector: 'app-compte-en-attente-details-modal',
  imports: [
    ErrorComponent,
    CommonModule,
    ReactiveFormsModule,
    LoadingComponent,
    ConfirmDeleteComponent,
  ],
  templateUrl: './compte-en-attente-details-modal.component.html',
  styleUrl: './compte-en-attente-details-modal.component.css',
})
export class CompteEnAttenteDetailsModalComponent implements OnInit {
  @Input() compte!: CompteEnAttenteModel;
  @Output() close = new EventEmitter<void>();
  @Output() accepted = new EventEmitter<void>();
  @Output() refused = new EventEmitter<void>();

  loadingState = {
    confirm: false,
    delete: false,
  };

  public confirmationModal = false;

  constructor(private readonly service: ComptesEnAttenteService) {}

  public form = new FormGroup({
    nom: new FormControl(''),
    prenom: new FormControl(''),
    nom_utilisateur: new FormControl(''),
    role: new FormControl(''),
  });

  public error = {
    show: false,
    message: '',
  };

  ngOnInit(): void {
    this.form.setValue({
      nom: this.compte.nom,
      prenom: this.compte.prenom,
      nom_utilisateur: this.compte.nom_utilisateur,
      role: this.compte.role,
    });
  }

  accepter() {

    const value = this.form.value;

    this.loadingState.confirm = true;

    this.service.accepterCompte(this.compte.id, value.role).subscribe({
      next: () => {
        this.loadingState.confirm = false;
        this.accepted.emit();
      },
      error: () => {
        this.loadingState.confirm = false;
        this.error = {
          show: true,
          message: 'Une erreur est survenu',
        };
      },
    });
  }

  refuser() {
    this.confirmationModal = false;
    this.loadingState.delete = true;

    this.service.refuserCompte(this.compte.id).subscribe({
      next: () => {
        this.loadingState.delete = false;
        this.refused.emit();
      },
      error: () => {
        this.loadingState.delete = false;
        this.error = {
          show: true,
          message: 'Une erreur est survenu',
        };
      },
    });
  }

  onClose() {
    this.close.emit();
  }
}
