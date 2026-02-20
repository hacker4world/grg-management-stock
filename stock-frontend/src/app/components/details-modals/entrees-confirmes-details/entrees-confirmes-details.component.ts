import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { ErrorComponent } from '../../error/error.component';
import { EntreeConfirmeeModel } from '../../../models/entrees-confirmes.model';
import { EntreesConfirmesService } from '../../../services/entrees-confirmes-service';
import { ConfirmDeleteComponent } from '../../deletion-modals/confirm-delete/confirm-delete';

@Component({
  selector: 'app-entrees-confirmes-details',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ErrorComponent,
    ConfirmDeleteComponent,
  ],
  templateUrl: './entrees-confirmes-details.component.html',
  styleUrl: './entrees-confirmes-details.component.css',
})
export class EntreesConfirmesDetailsComponent implements OnInit {
  @Input() entree!: EntreeConfirmeeModel | null;
  @Output() close = new EventEmitter();
  @Output() delete = new EventEmitter();

  public entreeForm = new FormGroup({
    date: new FormControl(''),
    fournisseur: new FormControl(''),
    magazinier: new FormControl(''),
  });

  public confirmationModal = false;

  public error = {
    show: false,
    message: '',
  };

  constructor(private readonly entreesService: EntreesConfirmesService) {}

  ngOnInit(): void {
    if (this.entree) {
      // Populate the form with existing data
      this.entreeForm.setValue({
        date: this.formatDateForInput(this.entree.date),
        fournisseur: this.entree.fournisseur.nom,
        magazinier: this.entree.compte.nom + ' ' + this.entree.compte.prenom,
      });
    }
  }

  private formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  public onDelete(): void {
    this.entreesService.supprimerEntree(this.entree!.id).subscribe({
      next: () => {
        this.delete.emit();
      },
      error: () => {
        this.error = {
          show: true,
          message: 'Une erreur est survenue lors de la suppression',
        };
      },
    });
  }

  public onClose(): void {
    this.close.emit();
  }
}
