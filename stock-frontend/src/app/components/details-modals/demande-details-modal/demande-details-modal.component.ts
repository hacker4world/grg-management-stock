import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ConfirmDeleteComponent } from '../../deletion-modals/confirm-delete/confirm-delete';
import { LoadingComponent } from '../../../components/loading/loading.component'; // Add this import
import { AuthenticationService } from '../../../services/authentication.service';
import { DemandesArticlesService } from '../../../services/demande-article.service';
import { ErrorComponent } from "../../error/error.component";

@Component({
  selector: 'app-demande-details-modal',
  imports: [CommonModule, ConfirmDeleteComponent, LoadingComponent, ErrorComponent], // Add LoadingComponent
  templateUrl: './demande-details-modal.component.html',
  styleUrl: './demande-details-modal.component.css',
})
export class DemandeDetailsModalComponent implements OnInit {
  @Input() demande: any = null;
  @Output() public close = new EventEmitter();
  @Output() public confirm = new EventEmitter();
  @Output() public delete = new EventEmitter();

  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly demandeService: DemandesArticlesService,
  ) {}

  public confirmationModal = false;
  public loading = false;

  public error = {
    show: false,
    message: '',
  };

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
    this.confirm.emit();
  }

  public onDelete() {
    this.delete.emit();
  }

  public downloadBandeCommande() {
    if (this.demande.documents.length == 0) {
      this.error = {
        show: true,
        message: "Cet retour n'a pas des documents",
      };
    }

    const documentId = this.demande.documents[0].id;

    this.demandeService.openDocument(documentId);
  }
}
