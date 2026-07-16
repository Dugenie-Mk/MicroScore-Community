import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';
import { LoanRequestService, PretApiResponse } from '../../../../core/services/loan-request.service';
import { RepaymentService, GrilleAmortissementResponse } from '../../../../core/services/repayment.service';

interface LoanItem {
  idPret: number;
  motif: string;
  montant: number;
  duree: string;
  date: string;
  statut: string;
  statutLabel: string;
  score: number;
  total: number;
  rembourse: number;
  reste: number;
  statutRemb: string;
}

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
  private readonly repaymentService = inject(RepaymentService);

  protected readonly loans = signal<LoanItem[]>([]);
  protected readonly loading = signal(true);

  constructor() {
    this.loadLoans();
  }

  private loadLoans(): void {
    const userId = this.auth.currentUser()?.id;
    if (!userId) {
      this.loading.set(false);
      return;
    }

    this.loanService.getByClientId(userId).subscribe({
      next: (prets) => {
        const items: LoanItem[] = prets.map((p) => ({
          idPret: p.idPret,
          motif: p.motif || '',
          montant: p.montant,
          duree: p.dureeRemboursementMois + ' mois',
          date: p.dateEnregistrement ? p.dateEnregistrement.substring(0, 10) : '',
          statut: p.statut,
          statutLabel: LABEL_MAP[p.statut] ?? 'EN_ATTENTE',
          score: p.scoreTotal,
          total: 0,
          rembourse: 0,
          reste: 0,
          statutRemb: '-',
        }));

        this.loans.set(items);
        this.loading.set(false);

        for (const pret of prets) {
          if (pret.statut === 'APPROUVE') {
            this.loadAmortissement(pret.idPret);
          }
        }
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  private loadAmortissement(idPret: number): void {
    this.repaymentService.getAmortissementByPret(idPret).subscribe({
      next: (grille) => {
        this.loans.update((items) =>
          items.map((item) => {
            if (item.idPret !== idPret) return item;
            const payees = grille.echeances.filter((e) => e.statut === 'PAYE');
            const totalRembourse = payees.reduce((s, e) => s + e.mensualite, 0);
            return {
              ...item,
              total: grille.coutTotalCredit,
              rembourse: totalRembourse,
              reste: grille.coutTotalCredit - totalRembourse,
              statutRemb: this.getRembStatus(grille),
            };
          })
        );
      },
      error: () => {},
    });
  }

  private getRembStatus(grille: GrilleAmortissementResponse): string {
    const allPayees = grille.echeances.every((e) => e.statut === 'PAYE');
    if (allPayees) return 'Soldé';
    const enRetard = grille.echeances.some((e) => e.statut === 'EN_RETARD');
    if (enRetard) return 'En retard';
    return 'En cours';
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
