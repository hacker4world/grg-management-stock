import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-export-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './export-modal.component.html',
  styleUrl: './export-modal.component.css',
})
export class ExportModalComponent {
  @Input() public resource: string = '';
  @Output() public close = new EventEmitter();
  @Output() public export = new EventEmitter();

  public exportForm = new FormGroup({
    export_option: new FormControl('tous'),
  });

  public onClose() {
    this.close.emit();
  }

  public onExport() {
    this.export.emit(this.exportForm.value.export_option);
  }
}
