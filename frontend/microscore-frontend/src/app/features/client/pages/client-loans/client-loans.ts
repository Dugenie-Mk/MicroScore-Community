import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';
import { LoanRequestService } from '../../../../core/services/loan-request.service';

interface ClientLoanDisplay {
  id: number;
  adminLoanId: number;
  motif: string;
  montant: number;
  date: string;
  duree: string;
  taux: number;
  total: number;
  rembourse: number;
  reste: number;
  statutRemb: string;
}

const ALL_LOANS: ClientLoanDisplay[] = [
  { id: 1, adminLoanId: 2, motif: 'Achat Matériel', montant: 500000, date: '10/01/2026', duree: '6 mois', taux: 5, total: 525000, rembourse: 525000, reste: 0, statutRemb: 'Soldé' },
  { id: 2, adminLoanId: 5, motif: 'Frais Scolaires', montant: 300000, date: '15/02/2026', duree: '3 mois', taux: 5, total: 315000, rembourse: 100000, reste: 215000, statutRemb: 'En cours' },
  { id: 3, adminLoanId: 1, motif: 'Commerce', montant: 350000, date: '20/05/2026', duree: '4 mois', taux: 5, total: 367500, rembourse: 0, reste: 367500, statutRemb: 'En cours' },
  { id: 4, adminLoanId: 4, motif: 'Équipement Agricole', montant: 450000, date: '25/03/2026', duree: '5 mois', taux: 5, total: 472500, rembourse: 250000, reste: 222500, statutRemb: 'En cours' },
  { id: 5, adminLoanId: 3, motif: 'Rénovation Habitat', montant: 200000, date: '05/04/2026', duree: '3 mois', taux: 7, total: 210000, rembourse: 50000, reste: 160000, statutRemb: 'En retard' },
  { id: 6, adminLoanId: 7, motif: 'Véhicule', montant: 800000, date: '12/03/2026', duree: '12 mois', taux: 7, total: 840000, rembourse: 0, reste: 840000, statutRemb: '-' },
  { id: 7, adminLoanId: 6, motif: 'Santé', montant: 150000, date: '01/06/2026', duree: '2 mois', taux: 5, total: 157500, rembourse: 0, reste: 157500, statutRemb: 'En cours' },
  { id: 8, adminLoanId: 8, motif: 'Formation', montant: 100000, date: '20/06/2026', duree: '2 mois', taux: 5, total: 105000, rembourse: 0, reste: 105000, statutRemb: 'En cours' },
];

const LABEL_MAP: Record<string, string> = {
  APPROUVE: 'ACCORDÉ',
  REJETE: 'REFUSÉ',
  EN_ATTENTE: 'EN_ATTENTE',
};

@Component({
  selector: 'app-client-loans',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './client-loans.html',
})
export class ClientLoans {
  private readonly auth = inject(AuthService);
  private readonly loanService = inject(LoanRequestService);

  protected readonly loans = computed(() => {
    const userId = this.auth.currentUser()?.id;
    if (!userId) return [];
    const clientLoanIds = this.getAdminLoanIds(userId);
    return ALL_LOANS
      .filter((l) => clientLoanIds.includes(l.adminLoanId))
      .map((l) => {
        const shared = this.loanService.loanRequests().find((s) => s.id === l.adminLoanId);
        const rawStatut = shared?.statut ?? 'EN_ATTENTE';
        return { ...l, statut: LABEL_MAP[rawStatut] ?? 'EN_ATTENTE' };
      });
  });

  private getAdminLoanIds(clientId: number): number[] {
    const map: Record<number, number[]> = {
      1: [1, 4],
      2: [2, 5],
      5: [3, 7],
    };
    return map[clientId] ?? [];
  }

  protected getStatusClass(statut: string): string {
    switch (statut) {
      case 'ACCORDÉ': return 'bg-green-50 text-green-700 ring-green-600/20';
      case 'REFUSÉ': return 'bg-red-50 text-red-700 ring-red-600/20';
      case 'EN_ATTENTE': return 'bg-amber-50 text-amber-700 ring-amber-600/20';
      default: return 'bg-gray-50 text-gray-700 ring-gray-600/20';
    }
  }
}
