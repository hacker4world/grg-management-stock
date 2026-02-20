import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-sort-fabriquants-modal',
  imports: [],
  templateUrl: './sort-fabriquants-modal.component.html',
  styleUrl: './sort-fabriquants-modal.component.css',
})
export class SortFabriquantsModalComponent {
  @Output() public close = new EventEmitter();

  public onClose() {
    this.close.emit();
  }
}
