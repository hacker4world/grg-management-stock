import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { FournisseurModel } from '../../../models/fournisseurs.model';
import { CommonModule } from '@angular/common';
import { ErrorComponent } from '../../error/error.component';

@Component({
  selector: 'app-article-fournisseurs-modal',
  imports: [ReactiveFormsModule, CommonModule, ErrorComponent],
  templateUrl: './article-fournisseurs-modal.component.html',
  styleUrl: './article-fournisseurs-modal.component.css',
})
export class ArticleFournisseursModalComponent implements OnInit {
  @Input() fournisseurs: FournisseurModel[] = [];
  @Input() selectedFournisseurs = [];
  @Output() close = new EventEmitter();
  @Output() submit = new EventEmitter();

  public form: FormGroup;

  public error = {
    show: false,
    message: '',
  };

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    let items = [];

    console.log(this.selectedFournisseurs);

    if (this.selectedFournisseurs.length == 0) {
      items.push(
        this.formBuilder.group({
          fournisseur: '',
          prix: 0,
          stock: 0,
          fabriquant: '',
        })
      );
    } else {
      this.selectedFournisseurs.forEach((sf) => {
        items.push(
          this.formBuilder.group({
            fournisseur: sf.fournisseur,
            prix: sf.prix,
            stock: sf.stock,
            fabriquant: sf.fabriquant,
          })
        );
      });
    }

    this.form = this.formBuilder.group({
      items: this.formBuilder.array(items),
    });
  }

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  public addNewItem() {
    (this.form.get('items') as FormArray).push(
      this.formBuilder.group({
        fournisseur: '',
        fabriquant: '',
        prix: 0,
        stock: 0,
      })
    );
  }

  public onSubmit() {
    const value = this.form.value;

    let errorOccured = false;

    value.items.forEach((fournisseurItem) => {
      console.log(fournisseurItem);

      if (
        fournisseurItem.fournisseur == '' ||
        fournisseurItem.fabriquant == '' ||
        fournisseurItem.prix == 0 ||
        fournisseurItem.stock == 0
      ) {
        this.error = {
          show: true,
          message: 'Tous les champs sont obligatoires',
        };
        errorOccured = true;
      }
    });
    value.items.forEach((fournisseurItem) => {
      if (fournisseurItem.prix <= 0 || fournisseurItem.stock <= 0) {
        this.error = {
          show: true,
          message: 'Stock et prix doit etre positif',
        };
        errorOccured = true;
      }
    });

    if (!errorOccured) this.submit.emit(value.items);
  }

  public onClose() {
    this.close.emit();
  }
}
