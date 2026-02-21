import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ConfirmDeleteComponent } from '../../deletion-modals/confirm-delete/confirm-delete';
import { LoadingComponent } from '../../../components/loading/loading.component'; // Add this import
import { AuthenticationService } from '../../../services/authentication.service';

@Component({
  selector: 'app-demande-details-modal',
  imports: [CommonModule, ConfirmDeleteComponent, LoadingComponent], // Add LoadingComponent
  templateUrl: './demande-details-modal.component.html',
  styleUrl: './demande-details-modal.component.css',
})
export class DemandeDetailsModalComponent implements OnInit {
  @Input() demande: any = null;
  @Output() public close = new EventEmitter();
  @Output() public confirm = new EventEmitter();
  @Output() public delete = new EventEmitter();

  constructor(private readonly authenticationService: AuthenticationService) {}

  public confirmationModal = false;
  public isConfirming = false; // Add this property

  public role = '';

  ngOnInit(): void {
    this.authenticationService.getCurrentUser().subscribe({
      next: (user) => {
        this.role = user.role;
      },
    });
  }

  public onClose() {
    this.close.emit();
  }

  public onConfirm() {
    this.isConfirming = true; // Set loading state
    this.confirm.emit();
  }

  public onDelete() {
    this.delete.emit();
  }

  public downloadBandeCommande() {
    window.open(
      `http://localhost:4000/api/documents/${this.demande.documents[0].id}/download`,
      '_blank',
    );
  }

  // Add this method to reset loading state when confirmation is done
  public resetConfirmingState() {
    this.isConfirming = false;
  }
}
