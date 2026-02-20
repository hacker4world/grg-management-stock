import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ErrorComponent } from '../../error/error.component';
import { CommonModule } from '@angular/common';
import {
  CreateFamilleModel,
  FamilleModel,
} from '../../../models/familles.model';
import { FamillesService } from '../../../services/familles.service';
import { LoadingComponent } from "../../loading/loading.component";

@Component({
  selector: 'app-add-family-modal',
  imports: [ReactiveFormsModule, CommonModule, ErrorComponent, LoadingComponent],
  templateUrl: './add-family-modal.component.html',
  styleUrl: './add-family-modal.component.css',
})
export class AddFamilyModalComponent {
  @Output() public close = new EventEmitter();
  @Output() public created = new EventEmitter();

  public loading = false;
  public error = {
    show: false,
    message: '',
  };

  public creationForm = new FormGroup({
    nom: new FormControl(''),
  });

  constructor(private readonly familleService: FamillesService) {}

  public onClose() {
    this.close.emit();
  }

  public onSubmit() {
    const familleValues = this.creationForm.value as CreateFamilleModel;

    if (familleValues.nom.trim().length == 0) {
      this.error = {
        show: true,
        message: 'Nom du famille est obligatoire',
      };
    } else {
      this.loading = true;
      this.familleService.ajouterFamille(familleValues).subscribe({
        next: (response: any) => {
          this.loading = false;
          this.created.emit(response.famille as FamilleModel);
        },
        error: (err) => {
          this.loading = false;
          this.error = {
            show: true,
            message: 'Un erreur est survenu',
          };
        },
      });
    }
  }
}
