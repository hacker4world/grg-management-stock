import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-articles-list-modal',
  imports: [CommonModule],
  templateUrl: './articles-list-modal.component.html',
  styleUrl: './articles-list-modal.component.css',
})
export class ArticlesListModalComponent implements OnInit {
  @Input() articles: any[] = [];
  @Output() close = new EventEmitter();

  ngOnInit(): void {
    console.log(this.articles);
  }

  public onClose() {
    this.close.emit();
  }
}
