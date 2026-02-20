import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ErrorComponent } from '../../error/error.component';
import { LoadingComponent } from '../../loading/loading.component';
import { ConfirmDeleteComponent } from '../../deletion-modals/confirm-delete/confirm-delete';

import { EntreeEnAttenteModel } from '../../../models/entrees-confirmes.model';
import { EntreesEnAttenteService } from '../../../services/entree-en-attente.service';

@Component({
  selector: 'app-entree-en-attente-details-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ErrorComponent,
    LoadingComponent,
    ConfirmDeleteComponent,
  ],
  templateUrl: './entree-en-attente-details-modal.component.html',
  styleUrls: ['./entree-en-attente-details-modal.component.css'],
})
export class EntreeEnAttenteDetailsModalComponent implements OnInit {
  /* -------- @Input / @Output -------- */
  @Input({ required: true }) entree!: EntreeEnAttenteModel;
  @Output() close = new EventEmitter<void>();
  @Output() validate = new EventEmitter<void>();
  @Output() deny = new EventEmitter<void>();

  /* -------- form + ui -------- */
  form = new FormGroup({
    date: new FormControl(''),
    fournisseur: new FormControl(''),
    magazinier: new FormControl(''),
  });

  error = { show: false, message: '' };
  loading = { validate: false, deny: false };
  confirmationModal = false;

  /* -------- inject service -------- */
  constructor(private readonly service: EntreesEnAttenteService) {}

  /* -------- load data when modal opens -------- */
  ngOnInit(): void {
    console.log(this.entree);

    this.form.setValue({
      date: this.entree.date,
      fournisseur: this.entree.fournisseur.nom,
      magazinier: this.entree.compte.nom + ' ' + this.entree.compte.prenom,
    });
  }

  /* -------- close -------- */
  onClose() {
    this.close.emit();
  }

  /* -------- open document in new tab -------- */
  openDoc(type: 'bande_commande' | 'bande_livraison') {
    const doc = (this.entree as any).documents?.find(
      (d: any) => d.type === type,
    );
    if (!doc) return;

    window.open(
      `http://localhost:4000/api/documents/${doc.id}/download`,
      '_blank',
    );
  }

  /* -------- validate (confirm) -------- */
  onValidate() {
    this.loading.validate = true;
    this.service.validerEntree(this.entree.id).subscribe({
      next: () => {
        this.loading.validate = false;
        this.validate.emit();
      },
      error: () => {
        this.loading.validate = false;
        this.error = { show: true, message: 'Une erreur est survenue' };
      },
    });
  }

  /* -------- deny (delete) -------- */
  onDeny() {
    this.confirmationModal = false;
    this.loading.deny = true;
    this.service.supprimerEntree(this.entree.id).subscribe({
      next: () => {
        this.loading.deny = false;
        this.deny.emit();
      },
      error: () => {
        this.loading.deny = false;
        this.error = { show: true, message: 'Une erreur est survenue' };
      },
    });
  }
}
