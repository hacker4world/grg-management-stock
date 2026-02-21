import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ConfirmDeleteComponent } from '../../deletion-modals/confirm-delete/confirm-delete';
import { LoadingComponent } from '../../loading/loading.component'; // Add this import
import { AuthenticationService } from '../../../services/authentication.service';
import { FormsModule } from '@angular/forms';
import { ErrorComponent } from '../../error/error.component';

@Component({
  selector: 'app-retour-details-modal',
  imports: [
    CommonModule,
    ConfirmDeleteComponent,
    LoadingComponent,
    FormsModule,
    ErrorComponent,
  ], // Add LoadingComponent
  templateUrl: './retour-details-modal.component.html',
  styleUrl: './retour-details-modal.component.css',
})
export class RetourDetailsModalComponent implements OnInit {
  @Input() retour: any = null;
  @Output() close = new EventEmitter();
  @Output() confirm = new EventEmitter();
  @Output() deny = new EventEmitter();

  public role = '';
  public confirmationModal = false;
  public isConfirming = false;
  public nomTransporteur = '';
  public matriculeTransporteur = '';

  public error = {
    show: false,
    message: '',
  };

  constructor(private readonly authenticationService: AuthenticationService) {}

  ngOnInit(): void {
    this.authenticationService.getCurrentUser().subscribe({
      next: (user) => {
        this.role = user.role;
        console.log(this.retour);
      },
    });
  }

  public onClose() {
    this.close.emit();
  }

  public onConfirm() {
    if (
      this.nomTransporteur.trim() == '' ||
      this.matriculeTransporteur.trim() == ''
    ) {
      this.error = {
        show: true,
        message: 'Nom du transporteur et matricule obligatoires.',
      };
      return;
    }

    this.isConfirming = true;
    this.confirm.emit({
      nomTransporteur: this.nomTransporteur,
      matriculeTransporteur: this.matriculeTransporteur,
    });
  }

  public onDeny() {
    this.confirmationModal = true;
  }

  public onConfirmDeny() {
    this.deny.emit();
    this.confirmationModal = false;
  }

  public onCancelDeny() {
    this.confirmationModal = false;
  }

  public downloadBonRetour() {
    window.open(
      `http://localhost:4000/api/documents/${this.retour.documents[0].id}/download`,
      '_blank',
    );
  }

  // Add this method to reset loading state when confirmation is done
  public resetConfirmingState() {
    this.isConfirming = false;
  }
}
