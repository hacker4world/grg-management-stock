import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-add-entry-modal',
  imports: [],
  templateUrl: './add-entry-modal.component.html',
  styleUrl: './add-entry-modal.component.css',
})
export class AddEntryModalComponent {
  @Output() public close = new EventEmitter();

  public onClose() {
    this.close.emit();
  }
}
