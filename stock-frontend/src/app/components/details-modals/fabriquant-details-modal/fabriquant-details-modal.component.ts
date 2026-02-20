import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FabriquantModel } from '../../../models/fabriquants.model';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { FabriquantsService } from '../../../services/fabriquants.service';
import { ErrorComponent } from '../../error/error.component';
import { LoadingComponent } from '../../loading/loading.component';
import { ConfirmDeleteComponent } from '../../deletion-modals/confirm-delete/confirm-delete';

@Component({
  selector: 'app-fabriquant-details-modal',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ErrorComponent,
    LoadingComponent,
    ConfirmDeleteComponent,
  ],
  templateUrl: './fabriquant-details-modal.component.html',
  styleUrl: './fabriquant-details-modal.component.css',
})
export class FabriquantDetailsModalComponent implements OnInit {
  @Input() fabriquant: FabriquantModel;
  @Output() public close = new EventEmitter();
  @Output() public update = new EventEmitter();
  @Output() public delete = new EventEmitter();

  public fabriquantForm = new FormGroup({
    nom: new FormControl(''),
    adresse: new FormControl(''),
    contact: new FormControl(''),
  });

  public error = {
    show: false,
    message: '',
  };

  public loading = {
    delete: false,
    update: false,
  };

  public confirmationModal = false;

  constructor(private readonly fabriquantsService: FabriquantsService) {}

  ngOnInit(): void {
    this.fabriquantForm.setValue({
      nom: this.fabriquant.nom,
      adresse: this.fabriquant.adresse,
      contact: this.fabriquant.contact,
    });
  }

  public onUpdate() {
    let values = this.fabriquantForm.value;
    if (
      values.nom.trim() == '' ||
      values.adresse.trim() == '' ||
      values.contact.trim() == ''
    )
      this.error = {
        show: true,
        message: 'Tous les champs sont obligatoires',
      };
    else {
      this.loading.update = true;
      this.fabriquantsService
        .modifierFabriquant({
          code_fabriquant: String(this.fabriquant.code),
          nom: values.nom,
          adresse: values.adresse,
          contact: values.contact,
        })
        .subscribe({
          next: () => {
            this.loading.update = false;
            this.update.emit(values);
          },
          error: () => {
            this.loading.update = false;
            this.error = {
              show: true,
              message: 'Une erreur est survenu',
            };
          },
        });
    }
  }

  public onDelete() {
    this.confirmationModal = false;
    this.loading.delete = true;
    this.fabriquantsService.deleteFabriquant(this.fabriquant.code).subscribe({
      next: () => {
        this.loading.delete = false;
        this.delete.emit();
      },
      error: () => {
        this.loading.delete = false;
        this.error = {
          show: true,
          message: 'Une erreur est survenu',
        };
      },
    });
  }

  public onClose() {
    this.close.emit();
  }
}
