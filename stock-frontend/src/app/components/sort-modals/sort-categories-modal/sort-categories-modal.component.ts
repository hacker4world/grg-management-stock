import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-sort-categories-modal',
  imports: [],
  templateUrl: './sort-categories-modal.component.html',
  styleUrl: './sort-categories-modal.component.css',
})
export class SortCategoriesModalComponent {
  @Output() public close = new EventEmitter();

  public onClose() {
    this.close.emit();
  }
}
