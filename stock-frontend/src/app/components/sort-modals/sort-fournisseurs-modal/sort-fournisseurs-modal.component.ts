import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-sort-fournisseurs-modal',
  imports: [],
  templateUrl: './sort-fournisseurs-modal.component.html',
  styleUrl: './sort-fournisseurs-modal.component.css',
})
export class SortFournisseursModalComponent {
  @Output() public close = new EventEmitter();

  public onClose() {
    this.close.emit();
  }
}
