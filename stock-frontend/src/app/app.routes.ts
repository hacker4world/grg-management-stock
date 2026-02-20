import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ArticlesComponent } from './pages/dashboard/dashboard-pages/articles/articles.component';
import { FournisseursComponent } from './pages/dashboard/dashboard-pages/fournisseurs/fournisseurs.component';
import { FabriquantsComponent } from './pages/dashboard/dashboard-pages/fabriquants/fabriquants.component';
import { ChantiersComponent } from './pages/dashboard/dashboard-pages/chantiers/chantiers.component';
import { FamillesComponent } from './pages/dashboard/dashboard-pages/familles/familles.component';
import { SousFamillesComponent } from './pages/dashboard/dashboard-pages/sous-familles/sous-familles.component';
import { CategoriesComponent } from './pages/dashboard/dashboard-pages/categories/categories.component';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { VerificationCompteComponent } from './pages/dashboard/dashboard-pages/verification-compte/verification-compte.component';
import { ComptesConfirmesComponent } from './pages/dashboard/dashboard-pages/comptes-confirmes/comptes-confirmes.component';
import { ComptesEnAttenteComponent } from './pages/dashboard/dashboard-pages/comptes-en-attente/comptes-en-attente.component';
import { EntreesConfirmesComponent } from './pages/dashboard/dashboard-pages/entrees-confirmes/entrees-confirmes.component';
import { EntreesEnAttenteComponent } from './pages/dashboard/dashboard-pages/entrees-en-attente/entrees-en-attente.component';
import { SortiesConfirmesComponent } from './pages/dashboard/dashboard-pages/sorties-confirmes/verification-sortie.component';
import { SortiesEnAttenteComponent } from './pages/dashboard/dashboard-pages/sorties-en-attente/sorties-en-attente.component';
import { AjouterEntreeComponent } from './pages/dashboard/dashboard-pages/ajouter-entree/ajouter-entree.component';
import { AjouterSortieComponent } from './pages/dashboard/dashboard-pages/ajouter-sortie/ajouter-sortie.component';
import { DemandeArticlesComponent } from './pages/dashboard/dashboard-pages/demande-articles/demande-articles.component';
import { RetoursComponent } from './pages/dashboard/dashboard-pages/retours/retours.component';
import { NotificationsComponent } from './pages/dashboard/dashboard-pages/notifications/notifications.component';
import { ConfigurationComponent } from './pages/dashboard/dashboard-pages/configuration/configuration.component';
import { HistoriqueChantierComponent } from './pages/dashboard/dashboard-pages/historique-chantier/historique-chantier.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard/articles',
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'signup',
    component: SignupComponent,
  },
  {
    path: 'dashboard',
    pathMatch: 'full',
    redirectTo: 'dashboard/articles',
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    children: [
      {
        path: 'comptes/confirmes',
        component: ComptesConfirmesComponent,
      },
      {
        path: 'comptes/en-attente',
        component: ComptesEnAttenteComponent,
      },
      {
        path: 'articles',
        component: ArticlesComponent,
      },
      {
        path: 'ajouter-entree',
        component: AjouterEntreeComponent,
      },
      {
        path: 'entrees-confirmes',
        component: EntreesConfirmesComponent,
      },
      {
        path: 'entrees-en-attente',
        component: EntreesEnAttenteComponent,
      },
      {
        path: 'ajouter-sortie',
        component: AjouterSortieComponent,
      },
      {
        path: 'sorties-confirmes',
        component: SortiesConfirmesComponent,
      },
      {
        path: 'sorties-en-attente',
        component: SortiesEnAttenteComponent,
      },
      {
        path: 'verification-compte',
        component: VerificationCompteComponent,
      },
      {
        path: 'fournisseurs',
        component: FournisseursComponent,
      },
      {
        path: 'fabriquants',
        component: FabriquantsComponent,
      },
      {
        path: 'chantiers',
        component: ChantiersComponent,
      },
      {
        path: 'historique-chantier/:chantierId',
        component: HistoriqueChantierComponent,
      },
      {
        path: 'demandes-articles',
        component: DemandeArticlesComponent,
      },
      {
        path: 'retours',
        component: RetoursComponent,
      },
      {
        path: 'notifications',
        component: NotificationsComponent,
      },
      {
        path: 'configurations',
        component: ConfigurationComponent,
      },
      {
        path: 'classement',
        pathMatch: 'full',
        redirectTo: 'classement/familles',
      },

      {
        path: 'classement',
        children: [
          {
            path: 'familles',
            component: FamillesComponent,
          },
          {
            path: 'sous-familles',
            component: SousFamillesComponent,
          },
          {
            path: 'categories',
            component: CategoriesComponent,
          },
        ],
      },
    ],
  },
];
