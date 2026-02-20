import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ErrorComponent } from '../../error/error.component';
import { FamilleModel } from '../../../models/familles.model';
import { SousFamillesService } from '../../../services/sous-familles.service';
import { CreerSousFamilleResponseModel } from '../../../models/sous-familles.model';
import { LoadingComponent } from "../../loading/loading.component";

@Component({
  selector: 'app-add-subfamily-modal',
  imports: [CommonModule, ReactiveFormsModule, ErrorComponent, LoadingComponent],
  templateUrl: './add-subfamily-modal.component.html',
  styleUrl: './add-subfamily-modal.component.css',
})
export class AddSubfamilyModalComponent {
  @Input() public familles: FamilleModel[] = [];
  @Output() public close = new EventEmitter();
  @Output() public create = new EventEmitter();

  public creationForm = new FormGroup({
    nom: new FormControl(''),
    famille: new FormControl('-1'),
  });

  public error = {
    show: false,
    message: '',
  };

  public loading = false;

  constructor(private readonly sousFamilleService: SousFamillesService) {}

  public onCreate() {
    let sousFamilleValues = this.creationForm.value;

    if (sousFamilleValues.nom.trim().length == 0) {
      this.error = {
        show: true,
        message: 'Tous les champs sont obligatoires',
      };
    } else {
      this.loading = true;
      this.sousFamilleService
        .creerSousFamille({
          famille_id:
            sousFamilleValues.famille == '-1'
              ? null
              : Number(sousFamilleValues.famille),
          nom: sousFamilleValues.nom,
        })
        .subscribe({
          next: (response: CreerSousFamilleResponseModel) => {
            this.loading = false;
            this.create.emit(response.sous_famille);
          },
          error: () => {
            this.loading = false;
            this.error = {
              show: true,
              message: 'Un erreur est survenu',
            };
          },
        });
    }
  }

  public onClose() {
    this.close.emit();
  }
}
