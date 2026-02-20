import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-filter-comptes-en-attente-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './filter-comptes-en-attente-modal.component.html',
  styleUrl: './filter-comptes-en-attente-modal.component.css',
})
export class FilterComptesEnAttenteModalComponent {
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
