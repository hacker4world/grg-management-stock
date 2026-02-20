import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Retour } from '../../../models/retour.model';

@Component({
  selector: 'app-retour-articles-list',
  imports: [CommonModule],
  templateUrl: './retour-articles-list.component.html',
  styleUrl: './retour-articles-list.component.css',
})
export class RetourArticlesListComponent {
  @Input() retour: Retour | null = null;
  @Output() close = new EventEmitter();

  public onClose() {
    this.close.emit();
  }
}
