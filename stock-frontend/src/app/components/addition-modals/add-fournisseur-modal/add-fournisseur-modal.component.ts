import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FournisseursService } from '../../../services/fournisseurs.service';
import { ErrorComponent } from '../../error/error.component';
import { LoadingComponent } from "../../loading/loading.component";

@Component({
  selector: 'app-add-fournisseur-modal',
  imports: [CommonModule, ReactiveFormsModule, ErrorComponent, LoadingComponent],
  templateUrl: './add-fournisseur-modal.component.html',
  styleUrl: './add-fournisseur-modal.component.css',
})
export class AddFournisseurModalComponent {
  @Output() public close = new EventEmitter();
  @Output() create = new EventEmitter();

  public error = {
    show: false,
    message: '',
  };

  public loading = false;

  public fournisseurForm = new FormGroup({
    nom: new FormControl(''),
    adresse: new FormControl(''),
    contact: new FormControl(''),
  });

  constructor(private readonly fournisseurService: FournisseursService) {}

  public ajouterFournisseur() {
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
      this.loading = true;
      this.fournisseurService.ajouterFournisseur(values).subscribe({
        next: (response: any) => {
          this.loading = false;
          this.create.emit(response.fournisseur);
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

  public onClose() {
    this.close.emit();
  }
}
