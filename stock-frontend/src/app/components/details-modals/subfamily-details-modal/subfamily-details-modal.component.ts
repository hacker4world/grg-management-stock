import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SousFamilleModel } from '../../../models/sous-familles.model';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FamilleModel } from '../../../models/familles.model';
import { SousFamillesService } from '../../../services/sous-familles.service';
import { ConfirmDeleteSubfamilyComponent } from '../../deletion-modals/confirm-delete-subfamily/confirm-delete-subfamily.component';
import { LoadingComponent } from '../../loading/loading.component';
import { ErrorComponent } from "../../error/error.component";

@Component({
  selector: 'app-subfamily-details-modal',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ConfirmDeleteSubfamilyComponent,
    LoadingComponent,
    ErrorComponent
],
  templateUrl: './subfamily-details-modal.component.html',
  styleUrl: './subfamily-details-modal.component.css',
})
export class SubfamilyDetailsModalComponent implements OnInit {
  @Input() public sousFamille: SousFamilleModel = null;
  @Input() public familles: FamilleModel[] = [];
  @Output() public close = new EventEmitter();
  @Output() public update = new EventEmitter();
  @Output() public delete = new EventEmitter();

  public error = {
    show: false,
    message: '',
  };

  public deleteConfirmModal = false;

  public loading = {
    update: false,
    delete: false,
  };

  public sousFamilleForm = new FormGroup({
    nom: new FormControl(''),
    famille: new FormControl(''),
  });

  constructor(private readonly sousFamilleService: SousFamillesService) {}

  ngOnInit(): void {
    this.sousFamilleForm.setValue({
      nom: this.sousFamille.nom,
      famille: this.sousFamille.famille
        ? String(this.sousFamille.famille.id)
        : '-1',
    });
  }

  public onUpdate() {
    let values = this.sousFamilleForm.value;

    if (values.nom.trim().length == 0)
      this.error = {
        show: true,
        message: 'Nom du sous famille est obligatoire',
      };
    else {
      this.loading.update = true;
      let data = {
        sous_famille_id: this.sousFamille.id,
        nom: values.nom,
        famille_id: null,
      };

      if (values.famille != '-1') data.famille_id = Number(values.famille);

      this.sousFamilleService.modifierSousFamille(data).subscribe({
        next: () => {
          this.loading.update = false;
          this.update.emit({ ...values, id: this.sousFamille.id });
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

  public setConfirmation(open) {
    this.deleteConfirmModal = open;
  }

  public onConfirmDelete(cascade) {
    this.loading.delete = true;
    this.deleteConfirmModal = false;
    this.sousFamilleService
      .supprimerSousFamille(this.sousFamille.id, cascade)
      .subscribe({
        next: () => {
          this.loading.delete = false;
          this.delete.emit();
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
