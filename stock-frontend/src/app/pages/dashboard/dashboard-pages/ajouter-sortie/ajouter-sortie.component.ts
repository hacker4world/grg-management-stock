// ajouter-sortie.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ErrorComponent } from '../../../../components/error/error.component';
import { ArticlesService } from '../../../../services/articles.service';
import { ChantiersService } from '../../../../services/chantiers.service';
import { ConfigurationService } from '../../../../services/configuration.service'; // Add this service
import {
  SortiesEnAttenteService,
  CreateSortieDto,
} from '../../../../services/sorties-en-attente.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AlertComponent } from '../../../../components/alert/alert.component';
import { AuthenticationService } from '../../../../services/authentication.service';
import { Router } from '@angular/router';
import { rolePermissions } from '../../../../roles';

type SortieType = 'interne_depot' | 'interne_chantier' | 'externe';
type SousTypeSortieExterne = 'avec_transporteur' | 'sans_transporteur';

@Component({
  selector: 'app-ajouter-sortie',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ErrorComponent, AlertComponent],
  templateUrl: './ajouter-sortie.component.html',
  styleUrls: ['./ajouter-sortie.component.css'],
})
export class AjouterSortieComponent implements OnInit {
  articles: any[] = [];
  chantiers: any[] = [];
  depots: any[] = [];
  articlesAjoute: {
    articleId: number;
    articleName: string;
    stockSortie: number;
  }[] = [];

  error = { show: false, message: '' };
  alert = { show: false, message: '' };

  public user = null;

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private articleService: ArticlesService,
    private chantierService: ChantiersService,
    private configurationService: ConfigurationService,
    private sortiesService: SortiesEnAttenteService,
    private readonly authenticationService: AuthenticationService,
    private readonly router: Router,
  ) {
    this.form = this.fb.group({
      // ... your form controls
    });

    // Subscribe to typeSortie changes to update validators
    this.form.get('typeSortie')?.valueChanges.subscribe((type) => {
      this.updateValidators(type);
    });

    // Subscribe to sousTypeSortieExterne changes
    this.form.get('sousTypeSortieExterne')?.valueChanges.subscribe(() => {
      this.updateValidators(this.form.get('typeSortie')?.value);
    });
  }

  ngOnInit(): void {
    const currentUser = this.authenticationService.getCurrentUser();

    currentUser.subscribe({
      next: (user) => {
        this.user = user;

        if (rolePermissions[user.role].includes('ajouter-sortie')) {
          this.articleService.fetchProducts(0).subscribe({
            next: (res) => (this.articles = res.articles),
            error: () => this.showError('Erreur de chargement des articles'),
          });

          this.chantierService.fetchChantiers(0).subscribe({
            next: (res) => (this.chantiers = res.chantiers),
            error: () => this.showError('Erreur de chargement des chantiers'),
          });

          this.configurationService.listDepots().subscribe({
            next: (res: any) => {
              console.log(res);

              this.depots = res.depots;
            },
            error: () => this.showError('Erreur de chargement des dépôts'),
          });

          // Set initial validators
          this.updateValidators('interne_chantier');
        } else {
          this.router.navigate(['../../login']);
        }
      },
    });
  }

  /**
   * Update form validators based on sortie type
   */
  /**
   * Update form validators based on sortie type
   */
  private updateValidators(typeSortie: SortieType): void {
    // Clear all validators first
    this.clearValidators();

    // Common validators
    this.form.get('articleId')?.setValidators([Validators.required]);
    this.form
      .get('stockSortie')
      ?.setValidators([Validators.required, Validators.min(1)]);

    switch (typeSortie) {
      case 'interne_chantier':
        this.form.get('chantierId')?.setValidators([Validators.required]);
        this.form
          .get('nomTransporteurChantier')
          ?.setValidators([Validators.required]);
        this.form
          .get('matriculeTransporteurChantier')
          ?.setValidators([Validators.required]);
        break;

      case 'interne_depot':
        this.form.get('depotId')?.setValidators([Validators.required]);
        this.form
          .get('nomTransporteurDepot')
          ?.setValidators([Validators.required]);
        this.form
          .get('matriculeTransporteurDepot')
          ?.setValidators([Validators.required]);
        break;

      case 'externe':
        this.form.get('nomEntreprise')?.setValidators([Validators.required]);
        this.form
          .get('adresseEntreprise')
          ?.setValidators([Validators.required]);
        this.form
          .get('matriculeFiscalEntreprise')
          ?.setValidators([Validators.required]);
        this.form.get('nomClient')?.setValidators([Validators.required]);

        const sousType = this.form.get('sousTypeSortieExterne')?.value;
        if (sousType === 'avec_transporteur') {
          this.form
            .get('nomTransporteurExterne')
            ?.setValidators([Validators.required]);
          this.form
            .get('matriculeTransporteurExterne')
            ?.setValidators([Validators.required]);
        }
        break;
    }

    // ✅ CHANGE: emitEvent: false to prevent infinite loop
    Object.keys(this.form.controls).forEach((key) => {
      this.form.get(key)?.updateValueAndValidity({ emitEvent: false });
    });
  }

  /**
   * Clear all validators from form controls
   */
  private clearValidators(): void {
    Object.keys(this.form.controls).forEach((key) => {
      this.form.get(key)?.clearValidators();
    });
  }

  /**
   * Add article to the list
   */
  onAddSortie(): boolean {
    const articleId = this.form.get('articleId')?.value;
    const stockSortie = this.form.get('stockSortie')?.value;

    if (!articleId || !stockSortie || stockSortie < 1) {
      return false;
    }

    if (this.articlesAjoute.some((a) => a.articleId == articleId)) {
      this.showError('Cet article est déjà ajouté.');
      return false;
    }

    const target = this.articles.find((a) => a.id == articleId);
    if (target) {
      this.articlesAjoute.push({
        articleId,
        articleName: target.nom,
        stockSortie,
      });
      this.error.show = false;
      this.form.patchValue({
        articleId: '',
        stockSortie: '',
      });
      return true;
    }

    return false;
  }

  /**
   * Remove article from the list
   */
  onRemoveArticle(articleId: number): void {
    this.articlesAjoute = this.articlesAjoute.filter(
      (a) => a.articleId !== articleId,
    );
  }

  /**
   * Build the appropriate DTO based on sortie type
   */
  private buildSortieDto(): CreateSortieDto | null {
    const typeSortie = this.form.get('typeSortie')?.value as SortieType;
    const compteId = this.user.id;

    const baseDto = {
      articles: this.articlesAjoute.map((a) => ({
        articleId: a.articleId,
        stockSortie: a.stockSortie,
      })),
      observation: this.form.get('observation')?.value || undefined,
      compteId,
    };

    switch (typeSortie) {
      case 'interne_chantier':
        return {
          ...baseDto,
          typeSortie: 'interne_chantier',
          chantierId: Number(this.form.get('chantierId')?.value),
          nomTransporteur: this.form.get('nomTransporteurChantier')?.value,
          matriculeTransporteur: this.form.get('matriculeTransporteurChantier')
            ?.value,
        } as any;

      case 'interne_depot':
        return {
          ...baseDto,
          typeSortie: 'interne_depot',
          depotId: Number(this.form.get('depotId')?.value),
          nomTransporteur: this.form.get('nomTransporteurDepot')?.value,
          matriculeTransporteur: this.form.get('matriculeTransporteurDepot')
            ?.value,
        } as any;

      case 'externe':
        const sousType = this.form.get('sousTypeSortieExterne')
          ?.value as SousTypeSortieExterne;
        const externalBase = {
          ...baseDto,
          typeSortie: 'externe' as const,
          sousTypeSortieExterne: sousType,
          nomEntreprise: this.form.get('nomEntreprise')?.value,
          adresseEntreprise: this.form.get('adresseEntreprise')?.value,
          matriculeFiscalEntreprise: this.form.get('matriculeFiscalEntreprise')
            ?.value,
          nomClient: this.form.get('nomClient')?.value,
        };

        if (sousType === 'avec_transporteur') {
          return {
            ...externalBase,
            nomTransporteur: this.form.get('nomTransporteurExterne')?.value,
            matriculeTransporteur: this.form.get('matriculeTransporteurExterne')
              ?.value,
          } as any;
        }

        return externalBase as any;

      default:
        return null;
    }
  }

  /**
   * Submit the form
   */
  onSubmit(): void {
    this.alert.show = false;

    // Try to add current selection
    this.onAddSortie();

    // Validate articles list
    if (this.articlesAjoute.length === 0) {
      this.showError('Veuillez ajouter au moins un article valide.');
      return;
    }

    // Validate form based on current type BEFORE checking validity
    const typeSortie = this.form.get('typeSortie')?.value;
    this.updateValidators(typeSortie);

    // ✅ Force form to recalculate validity with emitEvent: false
    this.form.updateValueAndValidity({ emitEvent: false });

    // Now check if form is valid
    if (!this.form.valid) {
      Object.keys(this.form.controls).forEach((key) => {
        const control = this.form.get(key);
        if (control && control.invalid) {
          console.log(`Invalid field: ${key}`, control.errors);
        }
      });
      this.showError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    // Build and submit DTO
    const dto = this.buildSortieDto();
    if (!dto) {
      this.showError('Erreur lors de la préparation des données.');
      return;
    }

    this.sortiesService.ajouterSortie(dto).subscribe({
      next: () => {
        this.articlesAjoute = [];
        this.form.reset({
          articleId: '',
          stockSortie: '',
          chantierId: '',
          depotId: '',
          observation: '',
          typeSortie: 'interne_chantier',
          sousTypeSortieExterne: 'sans_transporteur',
          date: new Date().toISOString().split('T')[0],
        });
        this.error.show = false;
        this.alert = {
          show: true,
          message: 'Sortie est ajoutée avec succès',
        };
      },
      error: (err) => this.showError(err.error?.message || 'Échec de création'),
    });
  }

  private showError(msg: string): void {
    this.error = { show: true, message: msg };
  }
}
