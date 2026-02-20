import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ErrorComponent } from '../../error/error.component';
import { ChantiersService } from '../../../services/chantiers.service';
import { CreateChantierModel } from '../../../models/chantier.model';
import { LoadingComponent } from '../../loading/loading.component';
import { AuthenticationService } from '../../../services/authentication.service';

@Component({
  selector: 'app-add-chantier-modal',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ErrorComponent,
    LoadingComponent,
  ],
  templateUrl: './add-chantier-modal.component.html',
  styleUrl: './add-chantier-modal.component.css',
})
export class AddChantierModalComponent {
  @Input({ required: true }) responsables!: any[];
  @Output() close = new EventEmitter<void>();
  @Output() create = new EventEmitter<any>();

  error = { show: false, message: '' };

  loading = false;

  form = new FormGroup({
    nom: new FormControl(''),
    adresse: new FormControl(''),
    compteId: new FormControl<number | null>(null),
  });

  constructor(
    private readonly service: ChantiersService,
    private readonly authenticationService: AuthenticationService,
  ) {}

  onClose() {
    this.close.emit();
  }

  submit() {
    const v = this.form.value;
    if (!v.nom?.trim() || !v.adresse?.trim() || !v.compteId) {
      this.error = {
        show: true,
        message: 'Tous les champs sont obligatoires',
      };
      return;
    }

    this.loading = true;
    this.service.ajouterChantier(v as CreateChantierModel).subscribe({
      next: (res) => {
        this.loading = false;
        this.create.emit(res.chantier);
      },
      error: () => {
        this.loading = false;
        this.error = { show: true, message: 'Une erreur est survenue' };
      },
    });
  }
}
