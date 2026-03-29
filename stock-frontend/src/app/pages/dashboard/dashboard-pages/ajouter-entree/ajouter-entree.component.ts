import { Component, OnInit } from '@angular/core';
import { ErrorComponent } from '../../../../components/error/error.component';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ArticleFournisseursModalComponent } from '../../../../components/addition-modals/article-fournisseurs-modal/article-fournisseurs-modal.component';
import { EntreesEnAttenteService } from '../../../../services/entree-en-attente.service';
import { FournisseursService } from '../../../../services/fournisseurs.service';
import { ArticlesService } from '../../../../services/articles.service';
import { FabriquantsService } from '../../../../services/fabriquants.service';
import { AuthenticationService } from '../../../../services/authentication.service';
import { rolePermissions } from '../../../../roles';
import { Router } from '@angular/router';
import { AlertComponent } from '../../../../components/alert/alert.component';

@Component({
  selector: 'app-ajouter-entree',
  imports: [
    ErrorComponent,
    CommonModule,
    ReactiveFormsModule,
    ArticleFournisseursModalComponent,
    AlertComponent,
  ],
  templateUrl: './ajouter-entree.component.html',
  styleUrl: './ajouter-entree.component.css',
})
export class AjouterEntreeComponent implements OnInit {
  public loading = false;
  public error = {
    show: false,
    message: '',
  };

  public selectedFournisseurs = [];

  public fournisseursModal = false;

  public articles: any[] = [];
  public fournisseurs: any[] = [];
  public fabriquants: any[] = [];

  public bandeCommandeFile: File | null = null;
  public bandeLivraisonFile: File | null = null;

  public alert = {
    show: false,
    message: '',
  };

  public itemsAjoutes: Array<{
    articleId: number;
    articleName: string;
    stockEntree: number;
    prix: number;
  }> = [];

  public onAddItem(): boolean {
    const articleId = this.addForm.get('code_article')?.value;
    const stockEntree = this.addForm.get('stock_entree')?.value;
    const prix = this.addForm.get('prix')?.value;

    if (!articleId || !stockEntree || !prix) {
      this.showError(
        "Veuillez remplir Article, Stock et Prix avant d'ajouter.",
      );
      return false;
    }

    if (this.itemsAjoutes.some((a) => a.articleId == Number(articleId))) {
      this.showError('Cet article est déjà dans la liste.');
      return false;
    }

    const target = this.articles.find((a) => a.id == articleId);
    if (target) {
      this.itemsAjoutes.push({
        articleId: Number(articleId),
        articleName: target.nom,
        stockEntree: Number(stockEntree),
        prix: Number(prix),
      });
      this.error.show = false;
      // Reset only article specific fields
      this.addForm.patchValue({
        code_article: '',
        stock_entree: '',
        prix: '',
      });
      return true;
    }
    return false;
  }

  public addForm = new FormGroup({
    code_article: new FormControl('', Validators.required),
    code_fournisseur: new FormControl('', Validators.required),
    code_fabriquant: new FormControl('', Validators.required), // NEW
    date: new FormControl(''),
    stock_entree: new FormControl('', Validators.required),
    prix: new FormControl('', Validators.required), // NEW
    observation: new FormControl(''), // NEW
  });

  constructor(
    private readonly service: EntreesEnAttenteService,
    private readonly fournisseursService: FournisseursService,
    private readonly articlesService: ArticlesService, // << NEW
    private readonly fabriquantsService: FabriquantsService,
    private readonly authenticationService: AuthenticationService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    const currentUser = this.authenticationService.getCurrentUser();

    currentUser.subscribe({
      next: (user) => {
        if (rolePermissions[user.role].includes('ajouter-entree')) {
          const today = new Date().toISOString().split('T')[0];
          this.addForm.patchValue({ date: today });

          this.loadFournisseurs();
          this.loadArticles();
          this.loadFabriquants();
        } else {
          this.router.navigate(['../../login']);
        }
      },
    });
  }

  onFileChange(event: Event, type: 'bc' | 'bl'): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0] || null;
    if (type === 'bc') this.bandeCommandeFile = file;
    else this.bandeLivraisonFile = file;
  }

  private resetForm(): void {
    this.addForm.reset();
    const today = new Date().toISOString().split('T')[0];
    this.addForm.patchValue({ date: today });
    this.bandeCommandeFile = null;
    this.bandeLivraisonFile = null;
  }

  private loadFournisseurs(): void {
    this.fournisseursService.fetchFournisseurs(0, {}).subscribe({
      next: (response: any) => {
        this.fournisseurs = response.fournisseurs || [];
      },
      error: () => {
        this.error = {
          show: true,
          message: 'Erreur lors du chargement des fournisseurs',
        };
      },
    });
  }

  private loadArticles(): void {
    this.articlesService.fetchProducts(0, {}).subscribe({
      next: (res: any) => {
        console.log(res.articles);

        this.articles = res.articles || [];
      },
      error: () => this.showError('Erreur lors du chargement des articles'),
    });
  }

  private loadFabriquants(): void {
    this.fabriquantsService.fetchFabriquants(0, {} as any).subscribe({
      next: (res: any) => (this.fabriquants = res.fabriquants || []),
      error: () => this.showError('Erreur lors du chargement des fabricants'),
    });
  }

  /* small helper to avoid repeating the error block */
  private showError(msg: string): void {
    this.error = { show: true, message: msg };
  }

  public onSubmit(): void {
    // Try to add current selection if not empty
    if (this.addForm.get('code_article')?.value) {
      this.onAddItem();
    }

    if (this.itemsAjoutes.length === 0) {
      this.showError('Veuillez ajouter au moins un article.');
      return;
    }

    if (
      !this.bandeCommandeFile ||
      !this.bandeLivraisonFile ||
      this.addForm.get('code_fournisseur')?.invalid
    ) {
      this.showError(
        'Fournisseur, Fabricant et les deux documents sont obligatoires.',
      );
      return;
    }

    this.loading = true;
    const v = this.addForm.value;

    this.authenticationService.getCurrentUser().subscribe({
      next: (user: any) => {
        this.service
          .ajouterEntree(
            {
              fournisseurId: Number(v.code_fournisseur),
              fabriquantId: Number(v.code_fabriquant),
              compteId: user.id,
              observation: v.observation || undefined,
              items: this.itemsAjoutes.map((i) => ({
                articleId: i.articleId,
                stockEntree: i.stockEntree,
                prix: i.prix,
              })),
            },
            this.bandeCommandeFile!,
            this.bandeLivraisonFile!,
          )
          .subscribe({
            next: () => {
              this.loading = false;
              this.itemsAjoutes = [];
              this.resetForm();
              this.alert = {
                show: true,
                message: "L'entrée multiple a été ajoutée",
              };
            },
            error: (err) => {
              this.loading = false;
              this.showError(
                err.error?.message || 'Erreur lors de la création.',
              );
            },
          });
      },
    });
  }

  public onFournisseursSelection(items: any[]) {
    this.fournisseursModal = false;

    this.selectedFournisseurs = items;

    this.setAverageAndTotal();
  }

  public setAverageAndTotal() {
    let average = 0;
    let total = 0;

    this.selectedFournisseurs.forEach((f) => {
      average += f.prix;
      total += f.stock;
    });

    average = average / this.selectedFournisseurs.length;
  }
}
