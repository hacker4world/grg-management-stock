import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

/*  services  */
import { ArticlesService } from '../../../services/articles.service';
import { FamillesService } from '../../../services/familles.service';
import { SousFamillesService } from '../../../services/sous-familles.service';
import { CategoriesService } from '../../../services/categories.service';

/*  models  */
import { FamilleModel } from '../../../models/familles.model';
import { SousFamilleModel } from '../../../models/sous-familles.model';
import { Category } from '../../../models/categories.model';
import { Article } from '../../../models/articles.model';

@Component({
  selector: 'app-filter-articles-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './filter-articles-modal.component.html',
  styleUrls: ['./filter-articles-modal.component.css'],
})
export class FilterArticlesModalComponent implements OnInit {
  @Input() unites: any[] = [];
  @Input() depots: any[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() filter = new EventEmitter<any>();

  /*  listing arrays  */
  public familles: FamilleModel[] = [];
  public sousFamilles: SousFamilleModel[] = [];
  public categories: Category[] = [];
  public articles: Article[] = [];

  public filterForm = new FormGroup({
    stockActuel: new FormControl(''),
    stockMin: new FormControl(''),
    uniteId: new FormControl(''),
    depotId: new FormControl(''),
    prixMoyenne: new FormControl(''),
    categorieId: new FormControl(''),
    familleId: new FormControl(''),
    sousFamilleId: new FormControl(''),
  });

  constructor(
    private readonly articlesService: ArticlesService,
    private readonly famillesService: FamillesService,
    private readonly sousFamillesService: SousFamillesService,
    private readonly categoriesService: CategoriesService,
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
    this.setupFormListeners();
  }

  /*  initial data  */
  private loadInitialData(): void {
    this.famillesService.listeFamilles().subscribe({
      next: (res: any) => (this.familles = res.familles),
      error: () => console.error('Erreur chargement familles'),
    });
  }

  /*  cascading listeners  */
  private setupFormListeners(): void {
    this.filterForm.get('familleId')?.valueChanges.subscribe((familleId) => {
      if (familleId) {
        this.loadSousFamilles(familleId);
        this.filterForm.get('sousFamilleId')?.setValue('');
        this.filterForm.get('categorieId')?.setValue('');
        this.categories = [];
      }
    });

    this.filterForm.get('sousFamilleId')?.valueChanges.subscribe((sfId) => {
      if (sfId) {
        this.loadCategories(sfId);
        this.filterForm.get('categorieId')?.setValue('');
      }
    });
  }

  private loadSousFamilles(familleId: string): void {
    this.sousFamillesService.filtrerSousFamilles(0, { familleId }).subscribe({
      next: (res: any) => (this.sousFamilles = res.sousFamilles),
      error: () => console.error('Erreur chargement sous-familles'),
    });
  }

  private loadCategories(sousFamilleId: string): void {
    this.categoriesService.fetchCategories(0, { sousFamilleId }).subscribe({
      next: (res: any) => (this.categories = res.categories),
      error: () => console.error('Erreur chargement catégories'),
    });
  }

  onFilter(): void {
    const raw = this.filterForm.value;
    const payload: any = {};
    Object.keys(raw).forEach((k) => {
      const v = raw[k as keyof typeof raw];
      if (v !== '' && v != null) payload[k] = v;
    });
    this.filter.emit(payload);
  }

  onClose(): void {
    this.close.emit();
  }
}
