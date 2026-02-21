import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  ConfigurationService,
  Depot,
} from '../../../services/configuration.service';
import { ErrorComponent } from '../../error/error.component';
import { CommonModule } from '@angular/common';
import { ConfirmDeleteComponent } from '../../deletion-modals/confirm-delete/confirm-delete';

@Component({
  selector: 'app-depot-details-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ErrorComponent,
    CommonModule,
    ConfirmDeleteComponent,
  ],
  templateUrl: './depot-details-modal.component.html',
  styleUrls: ['./depot-details-modal.component.css'],
})
export class DepotDetailsModalComponent {
  @Input() depot!: Depot;
  @Output() close = new EventEmitter<void>();
  @Output() depotUpdated = new EventEmitter<void>();
  @Output() depotDeleted = new EventEmitter<void>();

  public form: FormGroup;

  public error = {
    show: false,
    message: '',
  };

  public deleteConfirmationModal = false;

  constructor(
    private fb: FormBuilder,
    private service: ConfigurationService,
  ) {
    this.form = this.fb.group({
      nom: ['', [Validators.required]],
      adresse: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    this.form.patchValue({ nom: this.depot.nom, adresse: this.depot.adresse });
  }

  onClose() {
    this.close.emit();
  }

  onUpdate() {
    if (this.form.invalid) {
      this.error = {
        show: true,
        message: 'Tous les champs sont obligatoires',
      };
    } else {
      this.service
        .updateDepot(
          this.depot.id,
          this.form.value.nom!.trim(),
          this.form.value.adresse!.trim(), // Add this parameter
        )
        .subscribe({
          next: () => {
            this.depotUpdated.emit();
          },
          error: () => {
            this.error = {
              show: true,
              message: 'UUne erreur est survenue',
            };
          },
        });
    }
  }

  onDelete() {
    this.service.deleteDepot(this.depot.id).subscribe({
      next: () => {
        this.depotDeleted.emit();
      },
      error: () => {
        this.error = {
          show: true,
          message: 'Une erreur est survenue',
        };
      },
    });
  }
}
