import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ErrorComponent } from '../../components/error/error.component';
import { CommonModule } from '@angular/common';
import { AuthenticationService } from '../../services/authentication.service';
import { SignupModel } from '../../models/authentication.model';
import { LoadingComponent } from "../../components/loading/loading.component";

@Component({
  selector: 'app-signup',
  imports: [RouterModule, ReactiveFormsModule, ErrorComponent, CommonModule, LoadingComponent],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent {
  public error = {
    show: false,
    message: '',
  };

  public loading = false;

  public signupForm = new FormGroup({
    nom: new FormControl(''),
    prenom: new FormControl(''),
    nom_utilisateur: new FormControl(''),
    motdepasse: new FormControl(''),
  });

  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly router: Router
  ) {}

  public handleSignup() {
    const formValues = this.signupForm.value as SignupModel;
    if (
      formValues.nom.trim() == '' ||
      formValues.prenom.trim() == '' ||
      formValues.nom_utilisateur.trim() == '' ||
      formValues.motdepasse.trim() == ''
    ) {
      this.error = {
        show: true,
        message: 'Tous les champs sont obligatoires',
      };
    } else if (formValues.nom_utilisateur.trim().length < 5) {
      this.error = {
        show: true,
        message: "Nom d'utilisateur doit avoir 5 caractéres au minimum",
      };
    } else if (formValues.motdepasse.trim().length < 8) {
      this.error = {
        show: true,
        message: 'Mot de passe doit avoir 8 caractéres au minimum',
      };
    } else {
      this.error = {
        show: false,
        message: '',
      };

      this.loading = true;

      this.authenticationService.signup(formValues).subscribe({
        next: (response) => {
          this.loading = false;
          this.router.navigate(['../login']);
        },
        error: (error) => {
          this.loading = false;
          this.error = {
            show: true,
            message: 'Un erreur est survenu',
          };
        },
      });
    }
  }
}
