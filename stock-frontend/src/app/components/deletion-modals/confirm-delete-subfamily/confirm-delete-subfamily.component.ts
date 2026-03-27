import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-delete-subfamily',
  imports: [],
  templateUrl: './confirm-delete-subfamily.component.html',
  styleUrl: './confirm-delete-subfamily.component.css'
})
export class ConfirmDeleteSubfamilyComponent {
   @Input() sousFamilleNom: string = "";
   @Output() confirm = new EventEmitter();
   @Output() close = new EventEmitter();

   public onClose() {
    this.close.emit();
   }

   public onConfirm() {
    this.confirm.emit()
   }

}
