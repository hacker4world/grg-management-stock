import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Article } from '../../../models/articles.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sortie-articles',
  imports: [CommonModule],
  templateUrl: './sortie-articles.component.html',
  styleUrl: './sortie-articles.component.css',
})
export class SortieArticlesComponent {
  @Input() articleList = [];
  @Output() close = new EventEmitter();

  public onClose() {
    this.close.emit();
  }
}
