import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-articles-list-modal',
  imports: [CommonModule],
  templateUrl: './articles-list-modal.component.html',
  styleUrl: './articles-list-modal.component.css',
})
export class ArticlesListModalComponent {
  @Input() articles: any[] = [];
  @Output() close = new EventEmitter();

  public onClose() {
    this.close.emit();
  }
}
