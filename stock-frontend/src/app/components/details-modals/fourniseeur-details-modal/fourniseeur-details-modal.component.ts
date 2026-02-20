import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FournisseurModel } from '../../../models/fournisseurs.model';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FournisseursService } from '../../../services/fournisseurs.service';
import { CommonModule } from '@angular/common';
import { ErrorComponent } from '../../error/error.component';
import { LoadingComponent } from '../../loading/loading.component';
import { ConfirmDeleteComponent } from '../../deletion-modals/confirm-delete/confirm-delete';

@Component({
  selector: 'app-fourniseeur-details-modal',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    ErrorComponent,
    LoadingComponent,
    ConfirmDeleteComponent,
  ],
  templateUrl: './fourniseeur-details-modal.component.html',
  styleUrl: './fourniseeur-details-modal.component.css',
})
export class FourniseeurDetailsModalComponent implements OnInit {
  @Input() fournisseur: FournisseurModel;
  @Output() public close = new EventEmitter();
  @Output() public update = new EventEmitter();
  @Output() public delete = new EventEmitter();

  public fournisseurForm = new FormGroup({
    nom: new FormControl(''),
    adresse: new FormControl(''),
    contact: new FormControl(''),
  });

  public error = {
    show: false,
    message: '',
  };

  public loading = {
    update: false,
    delete: false,
  };

  public confirmationModal = false;

  ngOnInit(): void {
    this.fournisseurForm.setValue({
      nom: this.fournisseur.nom,
      adresse: this.fournisseur.adresse,
      contact: this.fournisseur.contact,
    });
  }

  constructor(private readonly fournisseurService: FournisseursService) {}

  public onFournisseurUpdate() {
    let values = this.fournisseurForm.value;
    if (
      values.nom.trim() == '' ||
      values.adresse.trim() == '' ||
      values.contact.trim() == ''
    ) {
      this.error = {
        show: true,
        message: 'Tous les champs sont obligatoires',
      };
    } else {
      this.loading.update = true;
      this.fournisseurService
        .modifierFournisseur({
          code_fournisseur: this.fournisseur.code,
          ...values,
        })
        .subscribe({
          next: () => {
            this.loading.update = false;
            this.update.emit(values);
          },
          error: () => {
            this.loading.update = false;
            this.error = {
              show: true,
              message: 'Un erreur est survenu',
            };
          },
        });
    }
  }

  public onDelete() {
    this.confirmationModal = false;
    this.loading.delete = true;
    this.fournisseurService
      .supprimerFournisseur(this.fournisseur.code)
      .subscribe({
        next: () => {
          this.loading.delete = false;
          this.delete.emit();
        },
        error: () => {
          this.loading.delete = false;
          this.error = {
            show: true,
            message: 'Un erreur est survenu',
          };
        },
      });
  }

  public onClose() {
    this.close.emit();
  }
}
