import { Component, EventEmitter, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ConfigurationService } from '../../../services/configuration.service';
import { ErrorComponent } from '../../error/error.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-depot-modal',
  standalone: true,
  imports: [ReactiveFormsModule, ErrorComponent, CommonModule],
  templateUrl: './add-depot-modal.component.html',
  styleUrls: ['./add-depot-modal.component.css'],
})
export class AddDepotModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() depotAdded = new EventEmitter<void>();

  public form: FormGroup;

  public error = {
    show: false,
    message: '',
  };

  constructor(
    private fb: FormBuilder,
    private service: ConfigurationService,
  ) {
    this.form = this.fb.group({
      nom: ['', Validators.required],
      adresse: ['', Validators.required],
    });
  }

  onClose() {
    this.close.emit();
  }

  onSubmit() {
    if (this.form.invalid) {
      this.error = {
        show: true,
        message: 'Tous les champs sont obligatoires',
      };
      return;
    }

    this.service
      .addDepot(this.form.value.nom!.trim(), this.form.value.adresse!.trim())
      .subscribe({
        next: () => {
          this.depotAdded.emit();
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
