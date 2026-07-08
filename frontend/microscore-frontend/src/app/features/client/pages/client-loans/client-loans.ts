import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-client-loans',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-loans.html',
})
export class ClientLoans {
  protected readonly loans = signal([
    { id: 1, motif: 'Achat Matériel', montant: 500000, date: '10/01/2026', duree: '6 mois', taux: 5, statut: 'ACCORDÉ', total: 525000, rembourse: 525000, reste: 0, statutRemb: 'Soldé' },
    { id: 2, motif: 'Frais Scolaires', montant: 200000, date: '15/03/2026', duree: '3 mois', taux: 7, statut: 'REFUSÉ', total: 214000, rembourse: 0, reste: 0, statutRemb: '-' },
    { id: 3, motif: 'Commerce', montant: 350000, date: '20/05/2026', duree: '4 mois', taux: 5, statut: 'EN_ATTENTE', total: 367500, rembourse: 0, reste: 367500, statutRemb: 'En cours' },
  ]);

  protected getStatusClass(statut: string): string {
    switch (statut) {
      case 'ACCORDÉ': return 'bg-green-50 text-green-700 ring-green-600/20';
      case 'REFUSÉ': return 'bg-red-50 text-red-700 ring-red-600/20';
      case 'EN_ATTENTE': return 'bg-amber-50 text-amber-700 ring-amber-600/20';
      default: return 'bg-gray-50 text-gray-700 ring-gray-600/20';
    }
  }
}
