import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  ChantierListResponse,
  ChantierModel,
} from '../../../models/chantier.model';
import { ChantiersService } from '../../../services/chantiers.service';
import { CommonModule } from '@angular/common';
import { ErrorComponent } from '../../error/error.component';

@Component({
  selector: 'app-filter-sorties-modal',
  imports: [CommonModule, ErrorComponent, ReactiveFormsModule],
  templateUrl: './filter-sorties-modal.component.html',
  styleUrl: './filter-sorties-modal.component.css',
})
export class FilterSortiesModalComponent implements OnInit {
  @Output() public close = new EventEmitter();
  @Output() public filter = new EventEmitter();

  public chantiers: ChantierModel[] = [];

  public filterForm = new FormGroup({
    article: new FormControl(''),
      stockSortie: new FormControl(''),
    date: new FormControl(''),
    chantier: new FormControl(''),
  });

  public error = {
    show: false,
    message: '',
  };

  constructor(private readonly chantierService: ChantiersService) {}

  ngOnInit(): void {
    this.loadChantiers();
  }

  public loadChantiers() {
    this.chantierService.fetchChantiers(0, {} as any).subscribe({
      next: (response: ChantierListResponse) => {
        this.chantiers = response.chantiers;
      },
      error: () => {
        this.error = {
          show: true,
          message: 'Une erreur est survenu',
        };
      },
    });
  }

  public onFilter() {
    this.filter.emit(this.filterForm.value);
  }

  public onClose() {
    this.close.emit();
  }
}
