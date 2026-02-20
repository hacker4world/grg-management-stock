import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-filter-comptes-confirmes-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './filter-comptes-confirmes-modal.component.html',
  styleUrl: './filter-comptes-confirmes-modal.component.css',
})
export class FilterComptesConfirmesModalComponent {
  @Output() public close = new EventEmitter();
  @Output() public filter = new EventEmitter();

  public filterForm = new FormGroup({
    code: new FormControl(''),
    prenom: new FormControl(''),
    nomUtilisateur: new FormControl(''),
    role: new FormControl(''),
  });

  public onClose() {
    this.close.emit();
  }

  public onFilter() {
    let values = this.filterForm.value;
    this.filter.emit({
      code: values.code,
      prenom: values.prenom,
      nomUtilisateur: values.nomUtilisateur,
      role: values.role,
    });
  }
}
