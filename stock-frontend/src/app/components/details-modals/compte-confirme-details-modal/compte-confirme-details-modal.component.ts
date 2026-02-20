import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CompteConfirmeModel } from '../../../models/comptes-confirmes.model';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ComptesConfirmesService } from '../../../services/comptes-confirmes.service';
import { CommonModule } from '@angular/common';
import { ErrorComponent } from '../../error/error.component';
import { LoadingComponent } from '../../loading/loading.component';
import { ConfirmDeleteComponent } from '../../deletion-modals/confirm-delete/confirm-delete';

@Component({
  selector: 'app-compte-confirme-details-modal',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ErrorComponent,
    LoadingComponent,
    ConfirmDeleteComponent,
  ],
  templateUrl: './compte-confirme-details-modal.component.html',
  styleUrl: './compte-confirme-details-modal.component.css',
  standalone: true,
})
export class CompteConfirmeDetailsModalComponent {
  @Input() compte: CompteConfirmeModel;
  @Output() public close = new EventEmitter();
  @Output() public update = new EventEmitter();
  @Output() public delete = new EventEmitter();

  public compteForm = new FormGroup({
    nom: new FormControl(''),
    prenom: new FormControl(''),
    nomUtilisateur: new FormControl(''),
    role: new FormControl(''),
  });

  public error = {
    show: false,
    message: '',
  };

  public confirmationModal = false;
  public loadingState = {
    update: false,
    delete: false,
  };

  constructor(private readonly comptesService: ComptesConfirmesService) {}

  ngOnInit(): void {
    this.compteForm.setValue({
      nom: this.compte.nom,
      prenom: this.compte.prenom,
      nomUtilisateur: this.compte.nom_utilisateur,
      role: this.compte.role,
    });
  }

  public onUpdate() {
    let values = this.compteForm.value;
    if (
      values.nom.trim() == '' ||
      values.prenom.trim() == '' ||
      values.nomUtilisateur.trim() == '' ||
      values.role.trim() == ''
    )
      this.error = {
        show: true,
        message: 'Tous les champs sont obligatoires',
      };
    else if (values.nomUtilisateur.trim().length < 5) {
      this.error = {
        show: true,
        message: "Le nom d'utilisateur doit avoir 5 caractères au minimum",
      };
    } else {
      this.loadingState.update = true;
      this.comptesService
        .modifierCompteConfirme({
          code_compte: this.compte.id,
          nom: values.nom,
          prenom: values.prenom,
          nomUtilisateur: values.nomUtilisateur,
          role: values.role,
        })
        .subscribe({
          next: () => {
            this.loadingState.update = false;
            this.update.emit(values);
          },
          error: () => {
            this.loadingState.update = false;
            this.error = {
              show: true,
              message: 'Une erreur est survenue',
            };
          },
        });
    }
  }

  public onDelete() {
    this.confirmationModal = false;
    this.loadingState.delete = true;
    this.comptesService.deleteCompteConfirme(this.compte.id).subscribe({
      next: () => {
        this.loadingState.delete = false;
        this.delete.emit();
      },
      error: () => {
        this.loadingState.delete = false;
        this.error = {
          show: true,
          message: 'Une erreur est survenue',
        };
      },
    });
  }

  public onClose() {
    this.close.emit();
  }
}
