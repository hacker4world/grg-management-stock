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
  selector: 'app-add-unite-modal',
  standalone: true,
  imports: [ReactiveFormsModule, ErrorComponent, CommonModule],
  templateUrl: './add-unite-modal.component.html',
  styleUrls: ['./add-unite-modal.component.css'],
})
export class AddUniteModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() uniteAdded = new EventEmitter<void>();

  public form: FormGroup;

  public error = {
    show: false,
    message: '',
  };

  public loading = false;

  constructor(
    private fb: FormBuilder,
    private service: ConfigurationService,
  ) {
    this.form = this.fb.group({
      nom: ['', [Validators.required]],
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

    this.loading = true;

    this.service.addUnite(this.form.value.nom!.trim()).subscribe({
      next: () => {
        this.loading = false;
        this.uniteAdded.emit();
      },
      error: () => {
        this.loading = false;
        this.error = {
          show: true,
          message: 'Une erreur est survenue',
        };
      },
    });
  }
}
