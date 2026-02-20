import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FamilleModel } from '../../../models/familles.model';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-filter-subfamily-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './filter-subfamily-modal.component.html',
  styleUrl: './filter-subfamily-modal.component.css',
})
export class FilterSubfamilyModalComponent {
  @Input() public familles: FamilleModel[] = [];
  @Output() public close = new EventEmitter();
  @Output() public filter = new EventEmitter();

  public filterForm = new FormGroup({
    famille: new FormControl('no-family'),
  });

  public onFilter() {
    this.filter.emit(this.filterForm.value.famille);
  }

  public onClose() {
    this.close.emit();
  }
}
