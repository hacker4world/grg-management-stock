import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { ErrorComponent } from '../../error/error.component';
import { SortieConfirmeeModel } from '../../../models/sorties-confirmes.model';
import { SortiesConfirmesService } from '../../../services/sorties-confirmes.service';
import { ChantiersService } from '../../../services/chantiers.service';
import { ConfirmDeleteComponent } from "../../deletion-modals/confirm-delete/confirm-delete";

@Component({
  selector: 'app-sortie-details-modal',
  imports: [CommonModule, ReactiveFormsModule, ErrorComponent, ConfirmDeleteComponent],
  templateUrl: './sortie-details-modal.component.html',
  styleUrl: './sortie-details-modal.component.css',
})
export class SortieDetailsModalComponent {
  @Input() sortie!: SortieConfirmeeModel | null;
  @Output() close = new EventEmitter();
  @Output() delete = new EventEmitter();

  public confirmDelete = false;

  public sortieForm = new FormGroup({
    stockSortie: new FormControl(''),
    date: new FormControl(''),
    chantier: new FormControl(''),
  });

  public chantiers: any[] = [];
  public error = {
    show: false,
    message: '',
  };

  constructor(
    private readonly sortiesService: SortiesConfirmesService,
    private readonly chantiersService: ChantiersService
  ) {}

  

  private formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  

  public onClose(): void {
    this.close.emit();
  }
}
