import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ChantierModel } from '../../../models/chantier.model';
import { ChantiersService } from '../../../services/chantiers.service';
import { Article } from '../../../models/articles.model';
import { ArticlesService } from '../../../services/articles.service';
import { AuthenticationService } from '../../../services/authentication.service';
import { CommonModule } from '@angular/common';
import { ErrorComponent } from '../../error/error.component';
import { ConfigurationService } from '../../../services/configuration.service';

@Component({
  selector: 'app-filter-sortie-en-attente-modal',
  standalone: true,
  imports: [CommonModule, ErrorComponent, ReactiveFormsModule],
  templateUrl: './filter-sortie-en-attente-modal.component.html',
})
export class FilterSortieEnAttenteModalComponent implements OnInit {
  @Output() public close = new EventEmitter<void>();
  @Output() public filter = new EventEmitter<any>();

  public chantiers: ChantierModel[] = [];
  public depots: any[] = []; // Add depots array
  public articles: Article[] = [];
  public magaziniers: any[] = [];

  public filterForm = new FormGroup({
    articleId: new FormControl(''),
    date: new FormControl(''),
    typeSortie: new FormControl(''), // Add type filter
    chantierId: new FormControl(''),
    depotId: new FormControl(''), // Add depot filter
    compteId: new FormControl(''),
  });

  public error = { show: false, message: '' };

  constructor(
    private readonly chantierService: ChantiersService,
    private readonly articleService: ArticlesService,
    private readonly authService: AuthenticationService,
    private readonly configService: ConfigurationService, // Add depot service
  ) {}

  ngOnInit(): void {
    this.loadChantiers();
    this.loadDepots(); // Load depots
    this.loadArticles();
    this.loadMagaziniers();

    // Listen to type changes to show/hide chantier/depot
    this.filterForm.get('typeSortie')?.valueChanges.subscribe((type) => {
      this.onTypeChange(type);
    });
  }

  onTypeChange(type: string | null) {
    // Reset chantier and depot when type changes
    this.filterForm.patchValue({
      chantierId: '',
      depotId: '',
    });
  }

  // Check if chantier field should be shown
  get showChantierField(): boolean {
    const type = this.filterForm.get('typeSortie')?.value;
    return type === 'interne_chantier';
  }

  // Check if depot field should be shown
  get showDepotField(): boolean {
    const type = this.filterForm.get('typeSortie')?.value;
    return type === 'interne_depot';
  }

  loadChantiers() {
    this.chantierService.fetchChantiers(0).subscribe({
      next: (res) => (this.chantiers = res.chantiers),
      error: () => (this.error = { show: true, message: 'Erreur chantiers' }),
    });
  }

  loadDepots() {
    this.configService.listDepots().subscribe({
      next: (res: any) => (this.depots = res.depots),
      error: () =>
        (this.error = {
          show: true,
          message: 'Erreur lors du chargement des dépôts',
        }),
    });
  }

  loadArticles() {
    this.articleService.fetchProducts(0).subscribe({
      next: (res) => (this.articles = res.articles),
      error: () => (this.error = { show: true, message: 'Erreur articles' }),
    });
  }

  loadMagaziniers() {
    this.authService.fetchMagaziniers().subscribe({
      next: (res) => (this.magaziniers = res.comptes),
      error: () => (this.error = { show: true, message: 'Erreur magaziniers' }),
    });
  }

  onFilter() {
    const formValue = this.filterForm.value;

    // Clean up the data based on type
    const filterData: any = {
      articleId: formValue.articleId,
      date: formValue.date,
      typeSortie: formValue.typeSortie,
      compteId: formValue.compteId,
    };

    // Only include chantierId if type is interne_chantier
    if (formValue.typeSortie === 'interne_chantier') {
      filterData.chantierId = formValue.chantierId;
    }

    // Only include depotId if type is interne_depot
    if (formValue.typeSortie === 'interne_depot') {
      filterData.depotId = formValue.depotId;
    }

    console.log(filterData);
    this.filter.emit(filterData);
  }

  onClose() {
    this.close.emit();
  }
}
