import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ErrorComponent } from '../../../../components/error/error.component';
import { ArticlesService } from '../../../../services/articles.service';
import { ChantiersService } from '../../../../services/chantiers.service';
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
import { ConfigurationService } from '../../../../services/configuration.service';

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
  depots = [];
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
    private readonly configService: ConfigurationService,
    private sortiesService: SortiesEnAttenteService,
    private readonly authenticationService: AuthenticationService,
    private readonly router: Router,
  ) {
    this.form = this.fb.group({
      articleId: ['', Validators.required],
      stockSortie: ['', [Validators.required, Validators.min(1)]],
      chantierId: [''],
      depotId: [''],
      observation: [''],
      typeSortie: ['interne-chantier'],
      transporteur: [false],
      nomTransporteur: [''],
      matriculeTransporteur: [''],
      nomEntreprise: [''],
      adresseEntreprise: [''],
      matriculeFiscale: [''],
      nomClient: [''],
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
          this.configService.listDepots().subscribe({
            next: (res: any) => (this.depots = res.depots),
            error: () => {
              this.showError('Erreur de chargement des dépôts');
            },
          });
        } else {
          this.router.navigate(['../../login']);
        }
      },
    });
  }

  onAddSortie(): boolean {
    // Check if the current selection in the form is valid
    const articleId = this.form.get('articleId')?.value;
    const stockSortie = this.form.get('stockSortie')?.value;

    if (!articleId || !stockSortie || stockSortie < 1) {
      return false;
    }

    // Check if already added to prevent duplicates
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
      return true;
    }

    return false;
  }

  onSubmit(): void {
    this.alert.show = false;

    // Logic Fix: Try to add the current form selection to the array
    // if it's not already there and the form is valid.
    this.onAddSortie();

    // If after trying to add, the array is still empty, it means the form was invalid
    if (this.articlesAjoute.length === 0) {
      this.showError('Veuillez ajouter au moins un article valide.');
      return;
    }

    // Validate required fields based on sortie type
    const typeSortie = this.form.get('typeSortie')?.value;

    if (!this.validateFormByType(typeSortie)) {
      return;
    }

    // Build the request payload based on sortie type
    const payload = this.buildPayload(typeSortie);

    // Send the request to the backend
    this.sortiesService.ajouterSortie(payload).subscribe({
      next: (response) => {
        this.alert = {
          show: true,
          message: `Sortie créée avec succès`,
        };
        // Reset form after successful submission
        this.resetForm();
      },
      error: (error) => {
        const errorMessage =
          error.error?.message || 'Erreur lors de la création de la sortie';
        this.showError(errorMessage);
      },
    });
  }

  private validateFormByType(typeSortie: string): boolean {
    const observation = this.form.get('observation')?.value;

    switch (typeSortie) {
      case 'interne-chantier':
        if (!this.form.get('chantierId')?.value) {
          this.showError('Veuillez sélectionner un chantier.');
          return false;
        }
        if (!this.form.get('nomTransporteur')?.value) {
          this.showError('Veuillez entrer le nom du transporteur.');
          return false;
        }
        if (!this.form.get('matriculeTransporteur')?.value) {
          this.showError('Veuillez entrer la matricule du transporteur.');
          return false;
        }
        break;

      case 'interne-depot':
        if (!this.form.get('depotId')?.value) {
          this.showError('Veuillez sélectionner un dépôt.');
          return false;
        }
        if (!this.form.get('nomTransporteur')?.value) {
          this.showError('Veuillez entrer le nom du transporteur.');
          return false;
        }
        if (!this.form.get('matriculeTransporteur')?.value) {
          this.showError('Veuillez entrer la matricule du transporteur.');
          return false;
        }
        break;

      case 'externe':
        if (!this.form.get('nomEntreprise')?.value) {
          this.showError("Veuillez entrer le nom de l'entreprise.");
          return false;
        }
        if (!this.form.get('adresseEntreprise')?.value) {
          this.showError("Veuillez entrer l'adresse de l'entreprise.");
          return false;
        }
        if (!this.form.get('matriculeFiscale')?.value) {
          this.showError('Veuillez entrer la matricule fiscale.');
          return false;
        }
        if (!this.form.get('nomClient')?.value) {
          this.showError('Veuillez entrer le nom du client.');
          return false;
        }
        // Check if transporter is required
        if (this.form.get('transporteur')?.value) {
          if (!this.form.get('nomTransporteur')?.value) {
            this.showError('Veuillez entrer le nom du transporteur.');
            return false;
          }
          if (!this.form.get('matriculeTransporteur')?.value) {
            this.showError('Veuillez entrer la matricule du transporteur.');
            return false;
          }
        }
        break;
    }

    return true;
  }

  private buildPayload(typeSortie: string): CreateSortieDto {
    const basePayload = {
      compteId: this.user.id,
      typeSortie: this.mapTypeSortie(typeSortie),
      articles: this.articlesAjoute.map((article) => ({
        articleId: article.articleId,
        stockSortie: article.stockSortie,
      })),
      observation: this.form.get('observation')?.value || null,
    };

    // Add type-specific fields
    switch (typeSortie) {
      case 'interne-chantier':
        return {
          ...basePayload,
          chantierId: parseInt(this.form.get('chantierId')?.value),
          nomTransporteur: this.form.get('nomTransporteur')?.value,
          matriculeTransporteur: this.form.get('matriculeTransporteur')?.value,
        } as any;

      case 'interne-depot':
        return {
          ...basePayload,
          depotId: parseInt(this.form.get('depotId')?.value),
          nomTransporteur: this.form.get('nomTransporteur')?.value,
          matriculeTransporteur: this.form.get('matriculeTransporteur')?.value,
        } as any;

      case 'externe':
        const externalPayload: any = {
          ...basePayload,
          sousTypeSortieExterne: this.form.get('transporteur')?.value
            ? 'avec_transporteur'
            : 'sans_transporteur',
          nomEntreprise: this.form.get('nomEntreprise')?.value,
          adresseEntreprise: this.form.get('adresseEntreprise')?.value,
          matriculeFiscalEntreprise: this.form.get('matriculeFiscale')?.value,
          nomClient: this.form.get('nomClient')?.value,
        };

        if (this.form.get('transporteur')?.value) {
          externalPayload.nomTransporteur =
            this.form.get('nomTransporteur')?.value;
          externalPayload.matriculeTransporteur = this.form.get(
            'matriculeTransporteur',
          )?.value;
        }

        return externalPayload;

      default:
        return basePayload;
    }
  }

  private mapTypeSortie(formValue: string): string {
    const mapping: { [key: string]: string } = {
      'interne-chantier': 'interne_chantier',
      'interne-depot': 'interne_depot',
      externe: 'externe',
    };
    return mapping[formValue] || formValue;
  }

  private resetForm(): void {
    this.form.reset({
      typeSortie: 'interne-chantier',
      transporteur: false,
    });
    this.articlesAjoute = [];
  }

  private showError(msg: string): void {
    this.error = { show: true, message: msg };
  }
}
