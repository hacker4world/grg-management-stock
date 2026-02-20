import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-sort-articles-modal',
  imports: [],
  templateUrl: './sort-articles-modal.component.html',
  styleUrl: './sort-articles-modal.component.css',
})
export class SortArticlesModalComponent {
  @Output() public close = new EventEmitter();

  public onClose() {
    this.close.emit();
  }
}
