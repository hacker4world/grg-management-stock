import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-filter-fabriquant-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './filter-fabriquant-modal.component.html',
  styleUrl: './filter-fabriquant-modal.component.css',
})
export class FilterFabriquantModalComponent {
  @Output() public close = new EventEmitter();
  @Output() public filter = new EventEmitter();

  public filterForm = new FormGroup({
    code: new FormControl(''),
    adresse: new FormControl(''),
    contact: new FormControl(''),
  });

  public onFilter() {
    let values = this.filterForm.value;
    console.log(values);
    
    this.filter.emit(values);
  }

  public onClose() {
    this.close.emit();
  }
}
