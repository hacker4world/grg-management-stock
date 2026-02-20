import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-delete',
  imports: [],
  templateUrl: './confirm-delete.html',
  styleUrl: './confirm-delete.css',
})
export class ConfirmDeleteComponent {
  @Input() resource: string = '';

  @Output() close = new EventEmitter();
  @Output() confirm = new EventEmitter();

  public onClose() {
    this.close.emit();
  }

  public onConfirm() {
    this.confirm.emit();
  }
}
