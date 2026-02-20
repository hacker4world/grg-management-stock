import { Component, OnInit } from '@angular/core';
import { NotificationDetailsComponent } from '../../../../components/details-modals/notification-details/notification-details.component';
import { FilterNotificationsComponent } from '../../../../components/filter-modals/filter-notifications/filter-notifications.component';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../../services/notification.service';
import { AuthenticationService } from '../../../../services/authentication.service';
import { Router } from '@angular/router';
import { rolePermissions } from '../../../../roles';
import { ExportService } from '../../../../services/export.service';
import { ExportModalComponent } from "../../../../components/export-modal/export-modal.component";
import { AlertComponent } from "../../../../components/alert/alert.component";

@Component({
  selector: 'app-notifications',
  imports: [
    CommonModule,
    NotificationDetailsComponent,
    FilterNotificationsComponent,
    ExportModalComponent,
    AlertComponent
],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css',
})
export class NotificationsComponent implements OnInit {
  public modalSettings = {
    showDetailsModal: false,
    showFilterModal: false,
    showExportModal: false,
  };

  public notifications = [];

  public error = {
    show: false,
    messag: '',
  };

  public notificationDetails = null;

  public listOptions = {
    filtering: false,
    articleId: undefined as number | undefined,
    date: '',
    type: '',
  };

  public alert = { show: false, message: '' };

  constructor(
    private readonly notificationService: NotificationService,
    private readonly authenticationService: AuthenticationService,
    private readonly router: Router,
    private readonly exportService: ExportService,
  ) {}

  ngOnInit(): void {
   this.checkPermissionsAndFetch();
  }

  checkPermissionsAndFetch() {
    this.authenticationService.getCurrentUser().subscribe({
      next: (user) => {
        if (rolePermissions[user.role].includes('notifications')) {
          this.fetchNotifications();
        } else {
          this.router.navigate(['../../../login']);
        }
      },
    });
  }

  fetchNotifications() {
    this.notificationService.listNotifications(1, this.listOptions).subscribe({
      next: (response: any) => {
        this.notifications = response.notifications;
      },
      error: () => {
        this.error = { show: true, messag: 'Erreur de chargement' };
      },
    });
  }

  public onSelectNotification(notification) {
    this.notificationDetails = notification;
    this.setModals({ showDetailsModal: true });
  }

  public onDelete() {
    this.modalSettings.showDetailsModal = false;
    this.notifications = this.notifications.filter(
      (n) => n.id != this.notificationDetails.id,
    );
  }

  public onExport(option: string) {
    this.setModals({ showExportModal: false });

    // If 'liste', send current array, else send empty array for 'all' (handled by backend)
    const notificationsToExport = option === 'liste' ? this.notifications : [];

    this.exportService.exportNotifications(notificationsToExport).subscribe({
      next: (response: Blob) => {
        this.exportService.downloadFile(response, 'notifications.xlsx');
      },
      error: (err) => {
        console.error('Export failed', err);
        this.error = { show: true, messag: "Échec de l'exportation" };
      },
    });
  }

  public onFilter(data: any) {
    this.setModals({ showFilterModal: false });
    this.listOptions = { ...this.listOptions, ...data, filtering: true };
    this.alert = { show: true, message: 'Cette liste est filtrée' };
    this.fetchNotifications();
  }

  public onRestore() {
    this.listOptions.filtering = false;
    this.alert.show = false;
    this.fetchNotifications();
  }

  public setModals(options) {
    Object.keys(options).forEach((k) => (this.modalSettings[k] = options[k]));
  }
}
