import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ErrorComponent } from '../../error/error.component';

@Component({
  selector: 'app-filter-fournisseurs-modal',
  imports: [ErrorComponent, ReactiveFormsModule],
  templateUrl: './filter-fournisseurs-modal.component.html',
  styleUrl: './filter-fournisseurs-modal.component.css',
})
export class FilterFournisseursModalComponent {
  @Output() public close = new EventEmitter<void>();
  @Output() public filter = new EventEmitter<any>();

  public filterForm = new FormGroup({
    contact: new FormControl(''),
    adresse: new FormControl(''),
  });

  public error = { show: false, message: '' };

  public onFilter(): void {
    this.filter.emit(this.filterForm.value);
  }

  public onClose(): void {
    this.close.emit();
  }
}
