import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ConfirmDeleteComponent } from '../../deletion-modals/confirm-delete/confirm-delete';
import { AuthenticationService } from '../../../services/authentication.service';

@Component({
  selector: 'app-retour-details-modal',
  imports: [CommonModule, ConfirmDeleteComponent],
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

  constructor(private readonly authenticationService: AuthenticationService) {}

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
    this.confirm.emit();
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
}
