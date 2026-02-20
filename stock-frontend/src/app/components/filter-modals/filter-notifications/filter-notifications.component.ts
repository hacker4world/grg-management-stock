import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ArticlesService } from '../../../services/articles.service';

@Component({
  selector: 'app-filter-notifications',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './filter-notifications.component.html',
  styleUrls: ['./filter-notifications.component.css'],
})
export class FilterNotificationsComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() filter = new EventEmitter<{
    articleId: number | undefined;
    date: string;
    type: string;
  }>();

  articles: any[] = [];

  form = new FormGroup({
    articleId: new FormControl(''),
    date: new FormControl(''),
    type: new FormControl(''),
  });

  constructor(private articlesService: ArticlesService) {}

  ngOnInit(): void {
    this.articlesService.fetchProducts(0).subscribe({
      next: (res) => (this.articles = res.articles),
      error: () => console.error('Erreur chargement articles'),
    });
  }

  onClose() {
    this.close.emit();
  }

  onFilter() {
    this.filter.emit({
      articleId: this.form.value.articleId
        ? Number(this.form.value.articleId)
        : undefined,
      date: this.form.value.date ?? '',
      type: this.form.value.type ?? '',
    });
  }
}
