import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ArticlesService } from '../../../services/articles.service';
import { CommonModule } from '@angular/common';
import { FamillesService } from '../../../services/familles.service';
import { SousFamillesService } from '../../../services/sous-familles.service';
import { CategoriesService } from '../../../services/categories.service';
import { FamilleModel } from '../../../models/familles.model';
import { SousFamilleModel } from '../../../models/sous-familles.model';
import { Category } from '../../../models/categories.model';
import { ErrorComponent } from '../../error/error.component';
import { LoadingComponent } from '../../loading/loading.component';
import { ArticleFournisseursModalComponent } from '../article-fournisseurs-modal/article-fournisseurs-modal.component';
import { FournisseurModel } from '../../../models/fournisseurs.model';

@Component({
  selector: 'app-add-article-modal',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ErrorComponent,
    LoadingComponent,
  ],
  templateUrl: './add-article-modal.component.html',
  styleUrl: './add-article-modal.component.css',
  standalone: true,
})
export class AddArticleModalComponent implements OnInit {
  @Input() fournisseurs: FournisseurModel[];
  @Input() unites: any[] = [];
  @Input() depots: any[] = [];
  @Output() public close = new EventEmitter<void>();
  @Output() public create = new EventEmitter<any>();

  public error = { show: false, message: '' };

  public fournisseursModal = false;

  public familles: FamilleModel[] = [];
  public sousFamilles: SousFamilleModel[] = [];
  public categories: Category[] = [];

  public loading = false;

  public articleForm = new FormGroup({
    nom: new FormControl(''),
    prix: new FormControl(0),
    uniteId: new FormControl(0),
    stockMin: new FormControl(0),
    famille: new FormControl(''),
    sousFamille: new FormControl(''),
    categorieId: new FormControl(''),
    depotId: new FormControl(''),
  });

  constructor(
    private readonly articlesService: ArticlesService,
    private readonly famillesService: FamillesService,
    private readonly sousFamillesService: SousFamillesService,
    private readonly categoriesService: CategoriesService,
  ) {}

  ngOnInit(): void {
    console.log(this.unites.length);
    console.log(this.depots.length);

    this.loadInitialData();
    this.setupFormListeners();
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

  submit() {
    this.loading = true;
    const raw = this.articleForm.getRawValue();

    if (
      !raw.nom?.trim() ||
      !raw.uniteId ||
      raw.stockMin == null || // 0 is allowed, null/undefined is not
      !raw.famille ||
      !raw.sousFamille ||
      !raw.categorieId ||
      !raw.depotId
    ) {
      this.loading = false; // keep button enabled
      this.error = {
        show: true,
        message: 'Tous les champs sont obligatoires.',
      };
      return; // stop here
    }
    this.articlesService
      .creerArticle({
        nom: raw.nom!.trim(),
        stockMin: raw.stockMin!,
        uniteId: raw.uniteId!,
        depotId: Number(raw.depotId!),
        categorieId: Number(raw.categorieId!),
      })
      .subscribe({
        next: (res) => {
          this.loading = false;
          this.create.emit(res.article);
        },
        error: (err) => {
          this.loading = false;
          this.error = {
            show: true,
            message:
              err?.error?.message ||
              'Une erreur est survenue lors de la création.',
          };
        },
      });
  }

  private setupFormListeners(): void {
    // Listen for famille changes
    this.articleForm.get('famille')?.valueChanges.subscribe((familleId) => {
      if (familleId) {
        this.loadSousFamilles(familleId);
        // Reset dependent fields
        this.articleForm.get('sousFamille')?.setValue('');
        this.articleForm.get('categorieId')?.setValue('');
        this.categories = [];
      }
    });

    // Listen for sous-famille changes
    this.articleForm
      .get('sousFamille')
      ?.valueChanges.subscribe((sousFamilleId) => {
        if (sousFamilleId) {
          this.loadCategories(sousFamilleId);
          // Reset dependent field
          this.articleForm.get('categorieId')?.setValue('');
        }
      });
  }

  private loadSousFamilles(familleId: string): void {
    this.sousFamillesService
      .filtrerSousFamilles(0, {
        familleId: familleId,
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

  private loadCategories(sousFamilleId: string): void {
    this.categoriesService
      .fetchCategories(0, {
        sousFamilleId: sousFamilleId,
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

  public onClose(): void {
    this.close.emit();
  }
}
