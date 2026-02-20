import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  ConfigurationService,
  Unite,
} from '../../../services/configuration.service';
import { ErrorComponent } from '../../error/error.component';
import { CommonModule } from '@angular/common';
import { ConfirmDeleteComponent } from "../../deletion-modals/confirm-delete/confirm-delete";

@Component({
  selector: 'app-unite-details-modal',
  standalone: true,
  imports: [ReactiveFormsModule, ErrorComponent, CommonModule, ConfirmDeleteComponent],
  templateUrl: './unite-details-modal.component.html',
  styleUrls: ['./unite-details-modal.component.css'],
})
export class UniteDetailsModalComponent {
  @Input() unite!: Unite;
  @Output() close = new EventEmitter<void>();
  @Output() uniteUpdated = new EventEmitter<void>();
  @Output() uniteDeleted = new EventEmitter<void>();

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
    });
  }

  ngOnInit() {
    this.form.patchValue({ nom: this.unite.nom });
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
        .updateUnite(this.unite.id, this.form.value.nom!.trim())
        .subscribe({
          next: () => {
            this.uniteUpdated.emit();
          },
          error: () => {
            this.error = {
              show: true,
              message: 'Un erreur est survenu',
            };
          },
        });
    }
  }

  onDelete() {
    this.service.deleteUnite(this.unite.id).subscribe({
      next: () => {
        this.uniteDeleted.emit();
      },
      error: () => {
        this.error = {
          show: true,
          message: 'Un erreur est survenu',
        };
      },
    });
  }
}
