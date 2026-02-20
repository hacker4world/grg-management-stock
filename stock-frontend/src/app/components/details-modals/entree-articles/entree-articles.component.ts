import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-entree-articles',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './entree-articles.component.html',
  styleUrls: ['./entree-articles.component.css'],
})
export class EntreeArticlesComponent {
  @Input({ required: true }) articleList: any[] = [];
  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }
}
