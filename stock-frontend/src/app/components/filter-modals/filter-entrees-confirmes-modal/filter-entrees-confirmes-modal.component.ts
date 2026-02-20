import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FournisseurModel } from '../../../models/fournisseurs.model';
import { Article } from '../../../models/articles.model';
import { FabriquantModel } from '../../../models/fabriquants.model';
import { FournisseursService } from '../../../services/fournisseurs.service';
import { AuthenticationService } from '../../../services/authentication.service';

@Component({
  selector: 'app-filter-entrees-confirmes-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './filter-entrees-confirmes-modal.component.html',
  styleUrls: ['./filter-entrees-confirmes-modal.component.css'],
})
export class FilterEntreesConfirmesModalComponent implements OnInit {
  @Output() public close = new EventEmitter<void>();
  @Output() public filter = new EventEmitter<any>();

  // Input properties to receive reference data from parent
  @Input() public articles: Article[] = [];
  @Input() public fournisseurs: FournisseurModel[] = [];
  @Input() public fabriquants: FabriquantModel[] = [];

  public magaziniers = [];

  error = {
    show: false,
    message: '',
  };

  public filterForm = new FormGroup({
    article: new FormControl(''),
    date: new FormControl(''),
    fournisseur: new FormControl(''),
    fabriquant: new FormControl(''),
    magazinier: new FormControl(''),
    stock_entree: new FormControl(''),
  });

  constructor(
    private readonly fournisseurService: FournisseursService,
    private readonly authService: AuthenticationService,
  ) {}

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

  public onFilter(): void {
    const raw = this.filterForm.value;
    // Emit only truthy fields
    const payload = {
      article: raw.article || '',
      date: raw.date || '',
      fournisseur: raw.fournisseur || '',
      fabriquant: raw.fabriquant || '',
      magazinier: raw.magazinier || '',
      stock_entree: raw.stock_entree || '', // ← ADD THIS LINE
    };
    this.filter.emit(payload);
  }

  public onClose(): void {
    this.close.emit();
  }
}
