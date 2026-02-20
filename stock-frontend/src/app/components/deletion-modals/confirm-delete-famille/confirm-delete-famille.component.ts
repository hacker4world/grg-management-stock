import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-delete-famille',
  imports: [],
  templateUrl: './confirm-delete-famille.component.html',
  styleUrl: './confirm-delete-famille.component.css',
})
export class ConfirmDeleteFamilleComponent {
  @Input() familleName: string = '';
  @Output() close = new EventEmitter();
  @Output() confirm = new EventEmitter();

  public isChecked = false;

  public onCheck(event) {
    this.isChecked = event.target.checked;
  }

  public onConfirm() {
    this.confirm.emit(this.isChecked);
  }

  public onClose() {
    this.close.emit();
  }
}
