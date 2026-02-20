import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ChantierModel } from '../../../models/chantier.model';
import { ChantiersService } from '../../../services/chantiers.service';
import { Article } from '../../../models/articles.model';
import { ArticlesService } from '../../../services/articles.service';
import { AuthenticationService } from '../../../services/authentication.service';
import { CommonModule } from '@angular/common';
import { ErrorComponent } from '../../error/error.component';

@Component({
  selector: 'app-filter-sortie-en-attente-modal',
  standalone: true,
  imports: [CommonModule, ErrorComponent, ReactiveFormsModule],
  templateUrl: './filter-sortie-en-attente-modal.component.html',
})
export class FilterSortieEnAttenteModalComponent implements OnInit {
  @Output() public close = new EventEmitter<void>();
  @Output() public filter = new EventEmitter<any>();

  public chantiers: ChantierModel[] = [];
  public articles: Article[] = [];
  public magaziniers: any[] = [];

  public filterForm = new FormGroup({
    articleId: new FormControl(''),
    date: new FormControl(''),
    chantierId: new FormControl(''),
    compteId: new FormControl(''),
  });

  public error = { show: false, message: '' };

  constructor(
    private readonly chantierService: ChantiersService,
    private readonly articleService: ArticlesService,
    private readonly authService: AuthenticationService,
  ) {}

  ngOnInit(): void {
    this.loadChantiers();
    this.loadArticles();
    this.loadMagaziniers();
  }

  loadChantiers() {
    this.chantierService.fetchChantiers(0).subscribe({
      next: (res) => (this.chantiers = res.chantiers),
      error: () => (this.error = { show: true, message: 'Erreur chantiers' }),
    });
  }

  loadArticles() {
    this.articleService.fetchProducts(0).subscribe({
      next: (res) => (this.articles = res.articles),
      error: () => (this.error = { show: true, message: 'Erreur articles' }),
    });
  }

  loadMagaziniers() {
    this.authService.fetchMagaziniers().subscribe({
      next: (res) => (this.magaziniers = res.comptes),
      error: () => (this.error = { show: true, message: 'Erreur magaziniers' }),
    });
  }

  onFilter() {
    console.log(this.filterForm.value);

    this.filter.emit(this.filterForm.value);
  }

  onClose() {
    this.close.emit();
  }
}
