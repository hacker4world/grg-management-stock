import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-sort-sorties-modal',
  imports: [],
  templateUrl: './sort-sorties-modal.component.html',
  styleUrl: './sort-sorties-modal.component.css',
})
export class SortSortiesModalComponent {
  @Output() public close = new EventEmitter();

  public onClose() {
    this.close.emit();
  }
}
