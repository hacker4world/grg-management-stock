import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';
import { CommonModule } from '@angular/common';
import { LoginModel } from '../../models/authentication.model';
import { ErrorComponent } from '../../components/error/error.component';
import { LoadingComponent } from '../../components/loading/loading.component';

@Component({
  selector: 'app-login',
  imports: [
    RouterModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    ErrorComponent,
    LoadingComponent,
  ],
  templateUrl: './login.component.html',  
  styleUrl: './login.component.css',
})
export class LoginComponent {
  public error = {
    show: false,
    message: '',
  };

  public loading = false;

  public loginForm = new FormGroup({
    nom_utilisateur: new FormControl(''),
    motdepasse: new FormControl(''),
  });

  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly router: Router,
  ) {}

  public login() {
    const loginValues = this.loginForm.value as LoginModel;

    if (
      loginValues.nom_utilisateur.trim().length < 5 ||
      loginValues.motdepasse.trim().length < 8
    ) {
      this.error = {
        show: true,
        message: "Nom d'utilisateur ou mot de passe incorrect",
      };
    } else {
      this.error = { show: false, message: '' };
      this.loading = true;

      this.authenticationService.login(loginValues).subscribe({
        next: (response: any) => {
          const role = response.account.role;

          console.log(role);
          
          if (role == 'admin' || role == 'admin1' || role == 'admin2')
            this.router.navigate(['../dashboard/articles']);
          else if (role == 'magazinier') {
            this.router.navigate(['../dashboard/articles']);
          }
            
          else if (role == 'responsable-chantier')
            this.router.navigate(['../dashboard/demandes-articles']);

          this.loading = false;

          this.authenticationService.setCurrentUser(response.account);
        },
        error: (error) => {
          this.loading = false;
          let message = '';
          if (error.status == 401) message = error.error.message;
          else message = 'Un erreur est survenu';

          this.error = {
            message,
            show: true,
          };
        },
      });
    }
  }
}
