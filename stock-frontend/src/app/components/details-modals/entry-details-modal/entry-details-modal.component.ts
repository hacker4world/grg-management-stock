import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-entry-details-modal',
  imports: [],
  templateUrl: './entry-details-modal.component.html',
  styleUrl: './entry-details-modal.component.css',
})
export class EntryDetailsModalComponent {
  @Output() public close = new EventEmitter();

  public onClose() {
    this.close.emit();
  }
}
