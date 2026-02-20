import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-verification-compte',
  imports: [ CommonModule, 
    FormsModule ],
  templateUrl: './verification-compte.component.html',
  styleUrl: './verification-compte.component.css'
})
export class VerificationCompteComponent {
 comptes = [
  {
    nom: "Hamdi",
    prenom: "jbeli",
    username: "hamdi123",
    role: "Administrateur"
  }
];


  transactions = [
    { date: "02/12/2025", desc: "Achat en ligne", montant: "-120 TND", type: "Débit" },
    { date: "01/12/2025", desc: "Virement reçu", montant: "+300 TND", type: "Crédit" }
  ];

  modifierCompte() {
    console.log("Modifier compte");
  }

  supprimerCompte() {
    console.log("Supprimer compte");
  }



public modalSettings: ModalSettings = {
    showAddModal: false,
    showDetailsModal: false,
    showFilterModal: false,
    showSortModal: false,
  };

  public setModals(options: ModalSettings) {
    Object.keys(options).forEach((key) => {
      let keyValue: boolean = options[key];
      this.modalSettings[key] = keyValue;
    });
    console.log(this.modalSettings);
  }
}

interface ModalSettings {
  showAddModal?: boolean;
  showDetailsModal?: boolean;
  showFilterModal?: boolean;
  showSortModal?: boolean;
}

