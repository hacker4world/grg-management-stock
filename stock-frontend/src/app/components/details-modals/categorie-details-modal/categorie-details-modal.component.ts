import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  Category,
  CreerCategorieResponse,
} from '../../../models/categories.model';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SousFamillesListModel } from '../../../models/sous-familles.model';
import { SousFamillesService } from '../../../services/sous-familles.service';
import { FamilleModel } from '../../../models/familles.model';
import { CategoriesService } from '../../../services/categories.service';
import { ErrorComponent } from '../../error/error.component';
import { LoadingComponent } from '../../loading/loading.component';
import { ConfirmDeleteComponent } from '../../deletion-modals/confirm-delete/confirm-delete';

@Component({
  selector: 'app-categorie-details-modal',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    ErrorComponent,
    LoadingComponent,
    ConfirmDeleteComponent,
  ],
  templateUrl: './categorie-details-modal.component.html',
  styleUrl: './categorie-details-modal.component.css',
})
export class CategorieDetailsModalComponent implements OnInit {
  @Input() public categorie: Category = null;
  @Input() public familles: FamilleModel[] = [];
  @Output() public close = new EventEmitter();
  @Output() update = new EventEmitter();
  @Output() delete = new EventEmitter();

  public sousFamilles = [];

  public error = {
    show: false,
    message: '',
  };

  public loading = {
    update: false,
    delete: false,
  };

  public confirmationModal = false;

  public categoryForm = new FormGroup({
    nom: new FormControl(''),
    famille: new FormControl(''),
    sousFamille: new FormControl(''),
  });

  constructor(
    private readonly sousFamilleService: SousFamillesService,
    private readonly categorieService: CategoriesService
  ) {}

  ngOnInit(): void {
    this.categoryForm.setValue({
      nom: this.categorie.nom,
      famille: this.categorie.sous_famille
        ? this.categorie.sous_famille.famille
          ? String(this.categorie.sous_famille.famille.id)
          : 'no-family'
        : 'no-family',
      sousFamille: this.categorie.sous_famille
        ? String(this.categorie.sous_famille.id)
        : 'no-subfamily',
    });
  }

  public onFamilleChange(event) {
    this.sousFamilleService
      .filtrerSousFamilles(0, {
        familleId: event.target.value,
      })
      .subscribe({
        next: (response: SousFamillesListModel) => {
          this.sousFamilles = response.sousFamilles;
          this.categoryForm.setValue({
            sousFamille: String(response.sousFamilles[0].id),
            nom: this.categoryForm.value.nom,
            famille: String(event.target.value),
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

  public onUpdate() {
    let values = this.categoryForm.value;

    if (values.nom.trim() == '')
      this.error = {
        show: true,
        message: 'Nom du catégorie est obligatoire',
      };
    else {
      this.loading.update = true;

      this.categorieService
        .modifierCategorie({
          category_id: this.categorie.id,
          nom: values.nom,
          sous_famille: values.sousFamille,
        })
        .subscribe({
          next: (response: CreerCategorieResponse) => {
            this.loading.update = false;

            this.update.emit(response.categorie);
          },
          error: () => {
            this.loading.update = false;
            this.error = {
              show: true,
              message: 'Un erreur est survenu',
            };
          },
        });
    }
  }

  public onDelete() {
    this.confirmationModal = false;
    this.loading.delete = true;
    this.categorieService.deleteCategorie(this.categorie.id).subscribe({
      next: () => {
        this.loading.delete = false;
        this.delete.emit(this.categorie.id);
      },
      error: () => {
        this.loading.delete = false;
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
