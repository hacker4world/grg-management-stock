import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FamilleModel } from '../../../models/familles.model';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  SousFamilleModel,
  SousFamillesListModel,
} from '../../../models/sous-familles.model';
import { SousFamillesService } from '../../../services/sous-familles.service';
import { ErrorComponent } from '../../error/error.component';

@Component({
  selector: 'app-filter-categorie-modal',
  imports: [CommonModule, ReactiveFormsModule, ErrorComponent],
  templateUrl: './filter-categorie-modal.component.html',
  styleUrl: './filter-categorie-modal.component.css',
})
export class FilterCategorieModalComponent {
  @Input() familles: FamilleModel[] = [];
  @Output() public close = new EventEmitter();
  @Output() public filter = new EventEmitter();

  public sousFamilles: SousFamilleModel[] = [];

  public filterForm = new FormGroup({
    sousFamilleId: new FormControl('no-subfamily'),
    famille: new FormControl('no-family'),
  });

  public error = {
    show: false,
    message: '',
  };

  constructor(private readonly sousFamillesService: SousFamillesService) {}

  public onFamilleChange(event) {
    this.sousFamillesService
      .filtrerSousFamilles(0, {
        familleId: event.target.value,
      })
      .subscribe({
        next: (response: SousFamillesListModel) => {
          console.log(response.sousFamilles);

          this.sousFamilles = response.sousFamilles;
          this.filterForm.setValue({
            sousFamilleId: String(response.sousFamilles[0].id),
            famille: String(event.target.value),
          });
        },
        error: () => {
          this.error = {
            show: true,
            message: 'Un erreur est survenu',
          };
        },
      });
  }

  public onFilter() {
    console.log(this.filterForm.value.sousFamilleId);

    this.filter.emit(this.filterForm.value.sousFamilleId);
  }

  public onClose() {
    this.close.emit();
  }
}
