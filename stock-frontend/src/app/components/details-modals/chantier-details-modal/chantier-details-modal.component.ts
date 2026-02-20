import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ErrorComponent } from '../../error/error.component';
import {
  ChantierModel,
  ModifierChantier,
} from '../../../models/chantier.model';
import { ChantiersService } from '../../../services/chantiers.service';
import { LoadingComponent } from '../../loading/loading.component';
import { ConfirmDeleteComponent } from '../../deletion-modals/confirm-delete/confirm-delete';

@Component({
  selector: 'app-chantier-details-modal',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ErrorComponent,
    LoadingComponent,
    ConfirmDeleteComponent,
  ],
  templateUrl: './chantier-details-modal.component.html',
  styleUrl: './chantier-details-modal.component.css',
})
export class ChantierDetailsModalComponent {
  @Input({ required: true }) responsables!: any[];
  @Input({ required: true }) chantier!: ChantierModel;
  @Output() close = new EventEmitter<void>();
  @Output() update = new EventEmitter();
  @Output() delete = new EventEmitter<void>();

  form = new FormGroup({
    nom: new FormControl(''),
    adresse: new FormControl(''),
    compteId: new FormControl<number | null>(null),
  });
  error = { show: false, message: '' };

  public loading = {
    update: false,
    delete: false,
  };

  public confirmationModal = false;

  constructor(private readonly service: ChantiersService) {}

  ngOnInit() {
    this.form.setValue({
      nom: this.chantier.nom,
      adresse: this.chantier.adresse,
      compteId: this.chantier.compte?.id ?? null,
    });
  }

  onClose() {
    this.close.emit();
  }

  onUpdate() {
    const v = this.form.value;
   
    if (!v.nom?.trim() || !v.adresse?.trim() || !v.compteId) {
      this.error = { show: true, message: 'Tous les champs sont obligatoires' };
      return;
    }

    this.loading.update = true;

    this.service
      .modifierChantier({
        code_chantier: String(this.chantier.code),
        ...v,
      } as ModifierChantier)
      .subscribe({
        next: () => {
          this.loading.update = false;
          this.update.emit({
            nom: v.nom!,
            adresse: v.adresse!,
            compteId: v.compteId!,
          });
        },
        error: () => {
          this.loading.update = false;
          this.error = { show: true, message: 'Une erreur est survenue' };
        },
      });
  }

  onDelete() {

    console.log(this.chantier.code);
    

    this.confirmationModal = false;
    this.loading.delete = true;
    this.service.deleteChantier(this.chantier.code).subscribe({
      next: () => {
        this.loading.delete = false;
        this.delete.emit();
      },
      error: () => {
        this.loading.delete = false;
        this.error = { show: true, message: 'Une erreur est survenue' };
      },
    });
  }
}
