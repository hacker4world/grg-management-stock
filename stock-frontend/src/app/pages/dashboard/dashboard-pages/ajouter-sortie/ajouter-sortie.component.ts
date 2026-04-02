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

  loading = false;

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
      date: [''],
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
    const today = new Date().toISOString().split('T')[0];
    this.form.patchValue({ date: today });

    const currentUser = this.authenticationService.getCurrentUser();

    this.form.get('typeSortie')?.valueChanges.subscribe(() => {
      if (this.articlesAjoute.length > 0) {
        this.articlesAjoute = [];
      }

       this.form.patchValue({
         chantierId: '',
         depotId: '',
         nomTransporteur: '',
         matriculeTransporteur: '',
         nomEntreprise: '',
         adresseEntreprise: '',
         matriculeFiscale: '',
         nomClient: '',
         transporteur: false,
       });
    });

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
    const date = this.form.get('date')?.value;

    if (!articleId || !stockSortie) {
      this.showError('Article et stock sortie sont obligatoires.');
      return false;
    }

    if (!Number.isInteger(stockSortie)) {
      this.showError('Le stock doit être un nombre entier');
      return false;
    }

    if (stockSortie <= 0) {
      this.showError('Le stock doit être supérieur à 0');
      return false;
    }

    if (!date) {
      this.showError('Date de sortie est obligatoire');
      return false;
    }

    // Check if already added to prevent duplicates
    if (this.articlesAjoute.some((a) => a.articleId == articleId)) {
      this.showError('Cet article est déjà ajouté.');
      return false;
    }

    const target = this.articles.find((a) => a.id == articleId);

    if (target) {
      if (target.stockActuel < stockSortie) {
        this.error = {
          show: true,
          message: "Stock de l'article est insuffisant",
        };
      } else {
        this.articlesAjoute.push({
          articleId,
          articleName: target.nom,
          stockSortie,
        });
        this.error.show = false;
        return true;
      }
    }

    return false;
  }

  onSubmit(): void {
    this.alert.show = false;

    const typeSortie = this.form.get('typeSortie')?.value;

    if (!this.validateFormByType(typeSortie)) {
      return;
    }

    const added = this.onAddSortie();

    if (!added) return;

    if (this.articlesAjoute.length === 0) {
      this.showError('Veuillez ajouter au moins un article valide.');
      return;
    }

    // Build the request payload based on sortie type
    const payload = this.buildPayload(typeSortie);

    this.loading = true;

    // Send the request to the backend
    this.sortiesService.ajouterSortie(payload).subscribe({
      next: (response) => {
        this.loading = false;
        this.alert = {
          show: true,
          message: `Sortie ajouté avec succès`,
        };
        // Reset form after successful submission
        this.resetForm();
      },
      error: (error) => {
        console.log(error);

        this.loading = false;
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
        const chantierId = this.form.get('chantierId')?.value;
        if (!chantierId || chantierId === '') {
          this.showError('Veuillez sélectionner un chantier valide.');
          return false;
        }
        const nomTransporteur = this.form.get('nomTransporteur')?.value?.trim();
        if (!nomTransporteur || nomTransporteur.length < 2) {
          this.showError(
            'Le nom du transporteur doit contenir au moins 2 caractères.',
          );
          return false;
        }
        if (nomTransporteur.length > 100) {
          this.showError(
            'Le nom du transporteur ne peut pas dépasser 100 caractères.',
          );
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
        // Validate entreprise name
        const nomEntreprise = this.form.get('nomEntreprise')?.value?.trim();
        if (!nomEntreprise || nomEntreprise.length < 2) {
          this.showError(
            "Le nom de l'entreprise doit contenir au moins 2 caractères.",
          );
          return false;
        }
        if (nomEntreprise.length > 200) {
          this.showError(
            "Le nom de l'entreprise est trop long (max 200 caractères).",
          );
          return false;
        }

        // Validate address
        const adresse = this.form.get('adresseEntreprise')?.value?.trim();
        if (!adresse || adresse.length < 5) {
          this.showError("L'adresse doit contenir au moins 5 caractères.");
          return false;
        }

        // Validate matricule fiscale format
        const matriculeFiscale = this.form
          .get('matriculeFiscale')
          ?.value?.trim();
        const mfPattern = /^[0-9]{15,20}$/; // Example: 15-20 digit number
        if (!matriculeFiscale || !mfPattern.test(matriculeFiscale)) {
          this.showError(
            'Le matricule fiscale doit contenir entre 15 et 20 chiffres.',
          );
          return false;
        }

        // Validate client name (no numbers)
        const nomClient = this.form.get('nomClient')?.value?.trim();
        if (!nomClient || !/^[a-zA-Z\s]+$/.test(nomClient)) {
          this.showError('Le nom du client ne doit contenir que des lettres.');
          return false;
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
      date: this.form.get('date')?.value,
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
    const today = new Date().toISOString().split('T')[0];
    this.form.reset({
      typeSortie: 'interne-chantier',
      transporteur: false,
      date: today,
    });
    this.articlesAjoute = [];
    this.error = { show: false, message: '' };

    // Clear form field errors
    Object.keys(this.form.controls).forEach((key) => {
      this.form.get(key)?.setErrors(null);
    });
  }

  private showError(msg: string): void {
    this.error = { show: true, message: msg };
  }
}
