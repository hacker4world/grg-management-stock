import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ArticlesService } from '../../../services/articles.service';
import { CommonModule } from '@angular/common';
import { FamilleModel } from '../../../models/familles.model';
import { SousFamilleModel } from '../../../models/sous-familles.model';
import { Category } from '../../../models/categories.model';
import { FabriquantModel } from '../../../models/fabriquants.model';
import { FamillesService } from '../../../services/familles.service';
import { SousFamillesService } from '../../../services/sous-familles.service';
import { CategoriesService } from '../../../services/categories.service';
import { FabriquantsService } from '../../../services/fabriquants.service';
import { ErrorComponent } from '../../error/error.component';
import { ConfirmDeleteComponent } from '../../deletion-modals/confirm-delete/confirm-delete';
import { LoadingComponent } from '../../loading/loading.component';

@Component({
  selector: 'app-article-details-modal',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    ErrorComponent,
    ConfirmDeleteComponent,
    LoadingComponent,
  ],
  templateUrl: './article-details-modal.component.html',
  styleUrl: './article-details-modal.component.css',
})
export class ArticleDetailsModalComponent {
  @Input() role = "";
  @Input() article: any;
  @Input() unites: any[] = []; // NEW: Receive unites from parent
  @Input() depots: any[] = []; // NEW: Receive depots from parent
  @Output() public close = new EventEmitter();
  @Output() public update = new EventEmitter();
  @Output() public delete = new EventEmitter();

  public familles: FamilleModel[] = [];
  public sousFamilles: SousFamilleModel[] = [];
  public categories: Category[] = [];

  public confirmationModal = false;

  public loading = {
    update: false,
    delete: false,
  };

  // UPDATED: Form controls to match article model
  public articleForm = new FormGroup({
    nom: new FormControl(''),
    stockMin: new FormControl(0),
    uniteId: new FormControl<number | null>(null),
    depotId: new FormControl<number | null>(null),
    familleId: new FormControl<number | null>(null),
    sousFamilleId: new FormControl<number | null>(null),
    categorieId: new FormControl<number | null>(null),
  });

  public error = {
    show: false,
    message: '',
  };

  constructor(
    private readonly articlesService: ArticlesService,
    private readonly famillesService: FamillesService,
    private readonly sousFamillesService: SousFamillesService,
    private readonly categoriesService: CategoriesService,
    private readonly fabriquantsService: FabriquantsService,
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
    this.setupFormListeners();
    this.initializeFormValues();
  }

  private loadInitialData(): void {
    // Fetch all familles
    this.famillesService.listeFamilles().subscribe({
      next: (response: any) => {
        this.familles = response.familles;
      },
      error: () => {
        this.error = {
          show: true,
          message: 'Erreur lors du chargement des familles',
        };
      },
    });
  }

  private setupFormListeners(): void {
    // Listen for famille changes
    this.articleForm.get('familleId')?.valueChanges.subscribe((familleId) => {
      if (familleId) {
        this.loadSousFamilles(familleId);
        // Reset dependent fields
        this.articleForm.get('sousFamilleId')?.setValue(null);
        this.articleForm.get('categorieId')?.setValue(null);
        this.categories = [];
      }
    });

    // Listen for sous-famille changes
    this.articleForm
      .get('sousFamilleId')
      ?.valueChanges.subscribe((sousFamilleId) => {
        if (sousFamilleId) {
          this.loadCategories(sousFamilleId);
          // Reset dependent field
          this.articleForm.get('categorieId')?.setValue(null);
        }
      });
  }

  private initializeFormValues(): void {
    if (!this.article) return;

    // Set basic values
    this.articleForm.patchValue({
      nom: this.article.nom,
      stockMin: this.article.stockMinimum,
      uniteId: this.article.unite?.id ?? null,
      depotId: this.article.depot?.id ?? null,
      categorieId: this.article.categorie?.id ?? null,
    });

    // Set famille and sous-famille if they exist
    if (this.article.categorie?.sous_famille) {
      const sousFamille = this.article.categorie.sous_famille;
      this.articleForm.patchValue({
        sousFamilleId: sousFamille.id,
      });

      if (sousFamille.famille) {
        this.articleForm.patchValue({
          familleId: sousFamille.famille.id,
        });
        // Load sous-familles for this famille
        this.loadSousFamilles(sousFamille.famille.id);
      }
    }

    // Load categories for the sous-famille
    if (this.article.categorie?.sous_famille?.id) {
      this.loadCategories(this.article.categorie.sous_famille.id);
    }
  }

  private loadSousFamilles(familleId: number): void {
    this.sousFamillesService
      .filtrerSousFamilles(0, {
        familleId: String(familleId),
      })
      .subscribe({
        next: (response: any) => {
          this.sousFamilles = response.sousFamilles;
        },
        error: () => {
          this.error = {
            show: true,
            message: 'Erreur lors du chargement des sous-familles',
          };
        },
      });
  }

  private loadCategories(sousFamilleId: number): void {
    this.categoriesService
      .fetchCategories(0, {
        sousFamilleId: String(sousFamilleId),
      })
      .subscribe({
        next: (response: any) => {
          this.categories = response.categories;
        },
        error: () => {
          this.error = {
            show: true,
            message: 'Erreur lors du chargement des catégories',
          };
        },
      });
  }

  // NEW: Update article method
  onUpdate() {
    const formValue = this.articleForm.value;

    // Validation
    if (
      !formValue.nom?.trim() ||
      !formValue.stockMin ||
      !formValue.depotId ||
      !formValue.uniteId ||
      !formValue.categorieId
    ) {
      this.error = {
        show: true,
        message: 'Tous les champs obligatoires doivent être remplis',
      };
      return;
    }

    this.loading.update = true;

    this.articlesService
      .modifierArticle({
        id: this.article.id,
        nom: formValue.nom.trim(),
        stockMin: Number(formValue.stockMin),
        depotId: Number(formValue.depotId),
        uniteId: Number(formValue.uniteId),
        categorieId: Number(formValue.categorieId),
      })
      .subscribe({
        next: () => {
          this.loading.update = false;
          this.update.emit({
            nom: formValue.nom!.trim(),
            stockMin: Number(formValue.stockMin),
            depotId: Number(formValue.depotId),
            uniteId: Number(formValue.uniteId),
            categorieId: Number(formValue.categorieId),
          });
        },
        error: () => {
          this.loading.update = false;
          this.error = { show: true, message: 'Une erreur est survenue' };
        },
      });
  }

  // NEW: Delete article method
  onDelete() {
    this.confirmationModal = false;
    this.loading.delete = true;

    this.articlesService.supprimerArticle(this.article.id).subscribe({
      next: () => {
        this.loading.delete = false;
        this.delete.emit();
      },
      error: () => {
        this.loading.delete = false;
        this.error = { show: true, message: 'Une erreur est survenue' };
      },
    });
  }

  public onClose() {
    this.close.emit();
  }
}
