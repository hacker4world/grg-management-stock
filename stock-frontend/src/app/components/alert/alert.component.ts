import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-alert',
  imports: [CommonModule],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.css',
})
export class AlertComponent {
  @Input() message: string = '';
  @Input() hideRestore?: boolean; // ← new optional prop
  @Output() restore = new EventEmitter();

  public onRestore() {
    this.restore.emit();
  }
}
