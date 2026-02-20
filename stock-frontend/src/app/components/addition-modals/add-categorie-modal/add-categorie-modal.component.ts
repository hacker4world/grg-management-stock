import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FamilleModel } from '../../../models/familles.model';
import { CommonModule } from '@angular/common';
import {
  SousFamilleModel,
  SousFamillesListModel,
} from '../../../models/sous-familles.model';
import { SousFamillesService } from '../../../services/sous-familles.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CategoriesService } from '../../../services/categories.service';
import { CreerCategorieResponse } from '../../../models/categories.model';
import { ErrorComponent } from '../../error/error.component';
import { LoadingComponent } from "../../loading/loading.component";

@Component({
  selector: 'app-add-categorie-modal',
  imports: [CommonModule, ReactiveFormsModule, ErrorComponent, LoadingComponent],
  templateUrl: './add-categorie-modal.component.html',
  styleUrl: './add-categorie-modal.component.css',
})
export class AddCategorieModalComponent {
  @Input() familles: FamilleModel[];
  @Output() public close = new EventEmitter();
  @Output() public create = new EventEmitter();

  public sousFamilles: SousFamilleModel[] = [];

  public error = {
    show: false,
    message: '',
  };

  public loading = false;

  public creationForm = new FormGroup({
    nom: new FormControl(''),
    sousFamille: new FormControl('no-subfamily'),
  });

  constructor(
    private readonly sousFamillesService: SousFamillesService,
    private readonly categoriesService: CategoriesService
  ) {}

  public onSubmit() {
    let values = this.creationForm.value;

    if (values.nom.trim() == '')
      this.error = {
        show: true,
        message: 'Nom du catégorie est obligatoire',
      };
    else {
      this.loading = true;
      this.categoriesService
        .creerCatégorie({
          nom: values.nom,
          sous_famille: values.sousFamille,
        })
        .subscribe({
          next: (result: CreerCategorieResponse) => {
            this.loading = false;
            this.create.emit(result.categorie);
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

  public onFamilleChange(event) {
    this.sousFamillesService
      .filtrerSousFamilles(0, {
        familleId: event.target.value,
      })
      .subscribe({
        next: (response: SousFamillesListModel) => {
          this.sousFamilles = response.sousFamilles;
          this.creationForm.setValue({
            sousFamille: String(response.sousFamilles[0].id),
            nom: this.creationForm.value.nom,
          });
        },
        error: () => {
          this.error = {
            show: true,
            message: 'Un erreur est survenu',
          };
        },
      });
  }

  public onClose() {
    this.close.emit();
  }
}
