import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ConfirmDeleteComponent } from '../../deletion-modals/confirm-delete/confirm-delete';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../services/notification.service';
import { ErrorComponent } from "../../error/error.component";

@Component({
  selector: 'app-notification-details',
  imports: [CommonModule, ConfirmDeleteComponent, ErrorComponent],
  templateUrl: './notification-details.component.html',
  styleUrl: './notification-details.component.css',
})
export class NotificationDetailsComponent {
  @Input() notification = null;
  @Output() close = new EventEmitter();
  @Output() delete = new EventEmitter();

  public confirmationModal = false;

  public error = {
    show: false,
    message: '',
  };

  constructor(private readonly notificationService: NotificationService) {}

  public onDelete() {

    this.confirmationModal = false;

    this.notificationService
      .deleteNotification(this.notification.id)
      .subscribe({
        next: () => {
          this.delete.emit();
        },
        error: () => {
          this.error = {
            show: true,
            message: 'Erreur de supression',
          };
        },
      });
  }

  public onClose() {
    this.close.emit();
  }
}
