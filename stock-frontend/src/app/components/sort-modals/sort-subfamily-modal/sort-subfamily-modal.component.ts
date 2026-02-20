import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-sort-subfamily-modal',
  imports: [],
  templateUrl: './sort-subfamily-modal.component.html',
  styleUrl: './sort-subfamily-modal.component.css',
})
export class SortSubfamilyModalComponent {
  @Output() public close = new EventEmitter();

  public onClose() {
    this.close.emit();
  }
}
