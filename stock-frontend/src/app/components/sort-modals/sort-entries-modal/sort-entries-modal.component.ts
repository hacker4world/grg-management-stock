import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-sort-entries-modal',
  imports: [],
  templateUrl: './sort-entries-modal.component.html',
  styleUrl: './sort-entries-modal.component.css',
})
export class SortEntriesModalComponent {
  @Output() public close = new EventEmitter();

  public onClose() {
    this.close.emit();
  }
}
