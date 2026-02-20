import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-sort-chantiers-modal',
  imports: [],
  templateUrl: './sort-chantiers-modal.component.html',
  styleUrl: './sort-chantiers-modal.component.css',
})
export class SortChantiersModalComponent {
  @Output() public close = new EventEmitter();

  public onClose() {
    this.close.emit();
  }
}
