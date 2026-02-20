import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface ResponsableItem {
  id: number;
  nom: string;
  prenom: string;
}

@Component({
  selector: 'app-filter-chantiers-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './filter-chantiers-modal.component.html',
  styleUrls: ['./filter-chantiers-modal.component.css'],
})
export class FilterChantiersModalComponent {
  @Input() responsables: ResponsableItem[] = []; // NEW
  @Output() close = new EventEmitter<void>();
  @Output() filter = new EventEmitter<{
    adresse: string;
    compteId: number | undefined;
  }>();

  form = new FormGroup({
    adresse: new FormControl(''),
    compteId: new FormControl(""),
  });

  onClose() {
    this.close.emit();
  }

  onFilter() {
    this.filter.emit({
      adresse: this.form.value.adresse ?? '',
      compteId: Number(this.form.value.compteId) ?? undefined,
    });
  }
}
