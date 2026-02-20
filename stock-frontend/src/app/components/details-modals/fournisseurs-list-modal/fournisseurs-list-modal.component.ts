import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ConfirmDeleteComponent } from '../../deletion-modals/confirm-delete/confirm-delete';
import { HttpClient } from '@angular/common/http';
import { ArticlesService } from '../../../services/articles.service';

@Component({
  selector: 'app-fournisseurs-list-modal',
  imports: [CommonModule, ConfirmDeleteComponent],
  templateUrl: './fournisseurs-list-modal.component.html',
  styleUrl: './fournisseurs-list-modal.component.css',
})
export class FournisseursListModalComponent implements OnInit {
  @Input() article = null;
  @Output() public close = new EventEmitter();

  constructor(private readonly articleService: ArticlesService) {}

  public showConfirmationModal = false;

  public fournisseurs = [];

  public error = {
    show: false,
    message: '',
  };

  ngOnInit(): void {
    this.articleService.fetchFournisseurs(this.article.id).subscribe({
      next: (res: any) => {
        console.log(res);

        this.fournisseurs = res.fournisseurs;
      },
      error: () => {
        this.error = {
          show: true,
          message: 'Erreur de récupération des fournisseurs',
        };
      },
    });
  }

  public onClose() {
    this.close.emit();
  }
}
