import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChantiersService } from '../../../services/chantiers.service';
import { ChantierModel } from '../../../models/chantier.model';
import { ArticlesService } from '../../../services/articles.service';

@Component({
  selector: 'app-filter-demandes-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './filter-demandes-modal.component.html',
  styleUrls: ['./filter-demandes-modal.component.css'],
})
export class FilterDemandesModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() filter = new EventEmitter<{
    chantierId?: number;
    date?: string;
    status?: string;
    articleId?: number;
  }>();

  filterForm = new FormGroup({
    chantierId: new FormControl<number | undefined>(undefined),
    date: new FormControl<string | undefined>(undefined),
    status: new FormControl<string | undefined>(undefined),
    articleId: new FormControl<number | undefined>(undefined),
  });

  chantiers: ChantierModel[] = [];
  articles: any[] = [];
  loading = false;

  constructor(
    private readonly chantierService: ChantiersService,
    private readonly articleService: ArticlesService,
  ) {}

  ngOnInit(): void {
    this.loadChantiers();
    this.loadArticles();
  }

  private loadArticles(): void {
    this.articleService
      .fetchProducts(0)
      .subscribe((res) => (this.articles = res.articles));
  }

  private loadChantiers(): void {
    this.loading = true;
    this.chantierService
      .fetchChantiers(0, {
        searching: false,
        query: '',
        filtering: false,
        code: '',
        adresse: '',
      })
      .subscribe({
        next: (res) => {
          this.chantiers = res.chantiers;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
  }

  onClose(): void {
    this.close.emit();
  }

  onFilter(): void {
    const raw = this.filterForm.value;
    this.filter.emit({
      chantierId: raw.chantierId || undefined,
      date: raw.date || undefined,
      status: raw.status || undefined,
      articleId: raw.articleId || undefined,
    });
    this.onClose();
  }

  onReset(): void {
    this.filterForm.reset();
  }
}
