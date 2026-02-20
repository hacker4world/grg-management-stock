import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FamilleModel } from '../../../models/familles.model';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FamillesService } from '../../../services/familles.service';
import { ErrorComponent } from '../../error/error.component';
import { ConfirmDeleteFamilleComponent } from '../../deletion-modals/confirm-delete-famille/confirm-delete-famille.component';
import { LoadingComponent } from '../../loading/loading.component';

@Component({
  selector: 'app-family-details-modal',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    ErrorComponent,
    ConfirmDeleteFamilleComponent,
    LoadingComponent,
  ],
  templateUrl: './family-details-modal.component.html',
  styleUrl: './family-details-modal.component.css',
})
export class FamilyDetailsModalComponent implements OnInit {
  @Input() famille: FamilleModel = null;
  @Output() public close = new EventEmitter();
  @Output() public update = new EventEmitter();
  @Output() public delete = new EventEmitter();

  public showConfirmationModal = false;

  public detailsForm = new FormGroup({
    nom: new FormControl(''),
  });

  public loading = {
    update: false,
    delete: false,
  };

  public error = {
    show: false,
    message: '',
  };

  constructor(private readonly familleService: FamillesService) {}

  ngOnInit(): void {
    this.detailsForm.setValue({ nom: this.famille.nom });
  }

  public onUpdate() {
    let familleValues = this.detailsForm.value;

    if (familleValues.nom.trim().length == 0)
      this.error = {
        show: true,
        message: 'Nom du famille est obligatoire',
      };
    else {
      this.loading.update = true;
      this.familleService
        .modifierFamille({
          famille_id: this.famille.id,
          nom: familleValues.nom,
        })
        .subscribe({
          next: (response) => {
            this.loading.update = false;
            this.update.emit({
              ...familleValues,
              id: this.famille.id,
            });
          },
          error: (error) => {
            console.log(error);

            this.loading.update = false;
            this.error = {
              show: true,
              message: 'Un erreur est survenu',
            };
          },
        });
    }
  }

  public onDelete(cascade: boolean) {
    this.showConfirmationModal = false;
    this.loading.delete = true;
    this.familleService.supprimerFamille(this.famille.id, cascade).subscribe({
      next: () => {
        this.setConfirmationModal(false);
        this.loading.delete = false;
        this.delete.emit(this.famille.id);
        this.close.emit();
      },
      error: () => {
        this.setConfirmationModal(false);
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

  public setConfirmationModal(open: boolean) {
    this.showConfirmationModal = open;
  }
}
