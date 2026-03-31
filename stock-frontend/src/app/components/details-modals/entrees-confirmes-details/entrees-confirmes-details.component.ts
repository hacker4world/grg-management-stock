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

  public loading = false

  constructor(private readonly entreesService: EntreesConfirmesService) {}

  ngOnInit(): void {
    if (this.entree) {
      // Populate the form with existing data
      this.entreeForm.setValue({
        date: this.formatDateForInput(this.entree.date),
        fournisseur: this.entree.fournisseur
          ? this.entree.fournisseur.nom
          : 'Non associé',
        magazinier: this.entree.compte
          ? this.entree.compte.nom + ' ' + this.entree.compte.prenom
          : 'Non associé',
      });
    }
  }

  private formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  public onDelete(): void {

    this.loading = true;

    this.entreesService.supprimerEntree(this.entree!.id).subscribe({
      next: () => {
        this.loading = false;
        this.delete.emit();
      },
      error: () => {
        this.loading = false;
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

  public openDoc(type: 'bande_commande' | 'bande_livraison') {
    console.log('works');

    const doc = (this.entree as any).documents?.find(
      (d: any) => d.type === type,
    );
    if (!doc) return;

    this.entreesService.ouvrirDocument(doc.id);
  }
}
