import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-filter-entries-modal',
  imports: [],
  templateUrl: './filter-entries-modal.component.html',
  styleUrl: './filter-entries-modal.component.css',
})
export class FilterEntriesModalComponent {
  @Output() public close = new EventEmitter();

  public onClose() {
    this.close.emit();
  }
}
