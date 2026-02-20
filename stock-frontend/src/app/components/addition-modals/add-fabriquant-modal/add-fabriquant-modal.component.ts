import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FabriquantsService } from '../../../services/fabriquants.service';
import { ErrorComponent } from '../../error/error.component';
import { CreateFabriquantModel } from '../../../models/fabriquants.model';
import { LoadingComponent } from '../../loading/loading.component';

@Component({
  selector: 'app-add-fabriquant-modal',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ErrorComponent,
    LoadingComponent,
  ],
  templateUrl: './add-fabriquant-modal.component.html',
  styleUrl: './add-fabriquant-modal.component.css',
})
export class AddFabriquantModalComponent {
  @Output() public close = new EventEmitter<void>();
  @Output() public create = new EventEmitter<any>();

  public error = { show: false, message: '' };

  public loading = false;

  public fabriquantForm = new FormGroup({
    nom: new FormControl(''),
    adresse: new FormControl(''),
    contact: new FormControl(''),
  });

  constructor(private readonly fabriquantService: FabriquantsService) {}

  public ajouterFabriquant(): void {
    const val = this.fabriquantForm.value;

    if (!val.nom?.trim() || !val.adresse?.trim() || !val.contact.trim()) {
      this.error = { show: true, message: 'Tous les champs sont obligatoires' };
      return;
    }

    this.loading = true;

    this.fabriquantService
      .ajouterFabriquant(val as CreateFabriquantModel)
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          this.create.emit({
            ...res.fabriquant,
          });
        },
        error: () => {
          this.loading = false;
          this.error = { show: true, message: 'Une erreur est survenue' };
        },
      });
  }

  public onClose(): void {
    this.close.emit();
  }
}