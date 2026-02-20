import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChantiersService } from '../../../services/chantiers.service';
import { ChantierModel } from '../../../models/chantier.model';
import { Article } from '../../../models/articles.model';
import { ArticlesService } from '../../../services/articles.service';

@Component({
  selector: 'app-filter-retours-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './filter-retours-modal.component.html',
  styleUrl: './filter-retours-modal.component.css',
})
export class FilterRetoursModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  // Updated output to include articleId and status
  @Output() filter = new EventEmitter<{
    chantierId?: number;
    date?: string;
    articleId?: number;
    status?: string;
  }>();

  filterForm = new FormGroup({
    chantierId: new FormControl<number | undefined>(undefined),
    date: new FormControl<string | undefined>(undefined),
    articleId: new FormControl<number | undefined>(undefined), // Added
    status: new FormControl<string>(''), // Added
  });

  chantiers: ChantierModel[] = [];
  loading = false;

  articles: Article[] = []; // Added articles array

  constructor(
    private readonly chantierService: ChantiersService,
    private readonly articlesService: ArticlesService,
  ) {}

  ngOnInit(): void {
    this.loadChantiers();
    this.loadArticles(); // Fetch articles on load
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
        error: () => (this.loading = false),
      });
  }

  private loadArticles(): void {
    this.loading = true;
    // Fetching page 0 as requested
    this.articlesService.fetchProducts(0).subscribe({
      next: (res) => {
        this.articles = res.articles;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  onClose(): void {
    this.close.emit();
  }

  onFilter(): void {
    const raw = this.filterForm.value;
    this.filter.emit({
      chantierId: raw.chantierId ?? undefined,
      date: raw.date ?? undefined,
      articleId: raw.articleId ?? undefined,
      status: raw.status || undefined,
    });
    this.onClose();
  }

  onReset(): void {
    this.filterForm.reset();
  }
}
