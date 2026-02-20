import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Article } from '../../../models/articles.model';
import { FournisseurModel } from '../../../models/fournisseurs.model';
import { FabriquantModel } from '../../../models/fabriquants.model';
import { AuthenticationService } from '../../../services/authentication.service';
import { ErrorComponent } from '../../error/error.component';

@Component({
  selector: 'app-filter-entrees-en-attente-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ErrorComponent],
  templateUrl: './filter-entrees-en-attente-modal.component.html',
  styleUrl: './filter-entrees-en-attente-modal.component.css',
})
export class FilterEntreesEnAttenteModalComponent implements OnInit {
  // Inputs for reference data
  @Input() articles: Article[] = [];
  @Input() fournisseurs: FournisseurModel[] = [];
  @Input() fabriquants: FabriquantModel[] = [];

  @Output() public close = new EventEmitter<void>();
  @Output() public filter = new EventEmitter<{
    article: string;
    fournisseur: string;
    date: string;
    fabriquant: string;
    stock_entree: number | undefined;
    magazinier: string;
  }>();

  // Form group following the sortie pattern
  form = new FormGroup({
    article: new FormControl(''),
    fournisseur: new FormControl(''),
    date: new FormControl(''),
    fabriquant: new FormControl(''),
    stock_entree: new FormControl<number | undefined>(undefined),
    magazinier: new FormControl(''),
  });

  public magaziniers: any[] = [];
  public error = { show: false, message: '' };

  constructor(private readonly authService: AuthenticationService) {}

  ngOnInit(): void {
    this.loadMagaziniers();
  }

  loadMagaziniers() {
    this.authService.fetchMagaziniers().subscribe({
      next: (res) => (this.magaziniers = res.comptes),
      error: () =>
        (this.error = {
          show: true,
          message: 'Erreur lors du chargement des magaziniers',
        }),
    });
  }

  public onClose(): void {
    this.close.emit();
  }

  onFilter() {
    this.filter.emit({
      article: this.form.value.article ?? '',
      fournisseur: this.form.value.fournisseur ?? '',
      date: this.form.value.date ?? '',
      fabriquant: this.form.value.fabriquant ?? '',
      stock_entree: this.form.value.stock_entree ?? undefined,
      magazinier: this.form.value.magazinier ?? '',
    });
  }
}
