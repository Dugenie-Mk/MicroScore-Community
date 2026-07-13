import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Echeance {
  id: number;
  dateEcheance: string;
  montant: number;
  paye: boolean;
  datePaiement?: string;
}

interface LoanRepayment {
  id: number;
  loanId: number;
  motif: string;
  montantEmprunte: number;
  totalARembourser: number;
  montantRembourse: number;
  resteARembourser: number;
  dateProchaineEcheance: string;
  statut: 'SOLDÉ' | 'EN_COURS' | 'EN_RETARD';
  echeances: Echeance[];
}

@Component({
  selector: 'app-client-repayments',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './client-repayments.html',
})
export class ClientRepayments {
  protected readonly loans = signal<LoanRepayment[]>([
    {
      id: 1, loanId: 1, motif: 'Achat Matériel', montantEmprunte: 500000,
      totalARembourser: 525000, montantRembourse: 525000, resteARembourser: 0,
      dateProchaineEcheance: '-', statut: 'SOLDÉ',
      echeances: [
        { id: 1, dateEcheance: '10/02/2026', montant: 87500, paye: true, datePaiement: '10/02/2026' },
        { id: 2, dateEcheance: '10/03/2026', montant: 87500, paye: true, datePaiement: '10/03/2026' },
        { id: 3, dateEcheance: '10/04/2026', montant: 87500, paye: true, datePaiement: '08/04/2026' },
        { id: 4, dateEcheance: '10/05/2026', montant: 87500, paye: true, datePaiement: '11/05/2026' },
        { id: 5, dateEcheance: '10/06/2026', montant: 87500, paye: true, datePaiement: '10/06/2026' },
        { id: 6, dateEcheance: '10/07/2026', montant: 87500, paye: true, datePaiement: '09/07/2026' },
      ],
    },
    {
      id: 2, loanId: 2, motif: 'Frais Scolaires', montantEmprunte: 300000,
      totalARembourser: 315000, montantRembourse: 100000, resteARembourser: 215000,
      dateProchaineEcheance: '15/07/2026', statut: 'EN_COURS',
      echeances: [
        { id: 7, dateEcheance: '15/05/2026', montant: 52500, paye: true, datePaiement: '15/05/2026' },
        { id: 8, dateEcheance: '15/06/2026', montant: 52500, paye: true, datePaiement: '16/06/2026' },
        { id: 9, dateEcheance: '15/07/2026', montant: 52500, paye: false },
        { id: 10, dateEcheance: '15/08/2026', montant: 52500, paye: false },
        { id: 11, dateEcheance: '15/09/2026', montant: 52500, paye: false },
        { id: 12, dateEcheance: '15/10/2026', montant: 52500, paye: false },
      ],
    },
    {
      id: 3, loanId: 3, motif: 'Commerce', montantEmprunte: 350000,
      totalARembourser: 367500, montantRembourse: 0, resteARembourser: 367500,
      dateProchaineEcheance: '20/08/2026', statut: 'EN_COURS',
      echeances: [
        { id: 13, dateEcheance: '20/08/2026', montant: 91875, paye: false },
        { id: 14, dateEcheance: '20/09/2026', montant: 91875, paye: false },
        { id: 15, dateEcheance: '20/10/2026', montant: 91875, paye: false },
        { id: 16, dateEcheance: '20/11/2026', montant: 91875, paye: false },
      ],
    },
  ]);

  protected readonly stats = computed(() => {
    const all = this.loans();
    return {
      totalDu: all.reduce((s, l) => s + l.resteARembourser, 0),
      totalRembourse: all.reduce((s, l) => s + l.montantRembourse, 0),
      enRetard: all.filter((l) => l.statut === 'EN_RETARD').length,
      soldes: all.filter((l) => l.statut === 'SOLDÉ').length,
    };
  });

  protected readonly montantTotalEmprunte = computed(() =>
    this.loans().reduce((s, l) => s + l.montantEmprunte, 0)
  );

  protected readonly progressPct = computed(() => {
    const total = this.montantTotalEmprunte();
    return total > 0 ? Math.min(100, Math.round((this.stats().totalRembourse / total) * 100)) : 0;
  });

  protected showPayModal = signal(false);
  protected selectedLoan = signal<LoanRepayment | null>(null);
  protected montantPaiement = signal(0);
  protected modePaiement = signal('Virement');
  protected paiementEffectue = signal(false);

  protected readonly modesPaiement = ['Virement', 'Cash', 'Mobile Money', 'Chèque'];

  protected openPayModal(loan: LoanRepayment): void {
    this.selectedLoan.set(loan);
    this.montantPaiement.set(loan.echeances.find((e) => !e.paye)?.montant ?? 0);
    this.modePaiement.set('Virement');
    this.paiementEffectue.set(false);
    this.showPayModal.set(true);
  }

  protected closePayModal(): void {
    this.showPayModal.set(false);
    this.selectedLoan.set(null);
  }

  protected effectuerPaiement(): void {
    const loan = this.selectedLoan();
    if (!loan || this.montantPaiement() <= 0) return;

    const montant = this.montantPaiement();
    const mode = this.modePaiement();

    this.loans.update((loans) =>
      loans.map((l) => {
        if (l.id !== loan.id) return l;

        let reste = montant;
        const newEcheances = l.echeances.map((e) => {
          if (e.paye || reste <= 0) return e;
          const payeMontant = Math.min(reste, e.montant);
          reste -= payeMontant;
          return { ...e, paye: true, datePaiement: new Date().toLocaleDateString('fr-FR') };
        });

        const newMontantRembourse = l.montantRembourse + montant;
        const newReste = l.totalARembourser - newMontantRembourse;
        const allPayees = newEcheances.every((e) => e.paye);

        return {
          ...l,
          montantRembourse: newMontantRembourse,
          resteARembourser: Math.max(0, newReste),
          statut: allPayees ? 'SOLDÉ' as const : l.statut,
          echeances: newEcheances,
          dateProchaineEcheance: allPayees ? '-' : (newEcheances.find((e) => !e.paye)?.dateEcheance ?? '-'),
        };
      })
    );

    this.paiementEffectue.set(true);
  }

  protected getStatusClass(statut: string): string {
    switch (statut) {
      case 'SOLDÉ': return 'bg-green-50 text-green-700 ring-green-600/20';
      case 'EN_COURS': return 'bg-blue-50 text-blue-700 ring-blue-600/20';
      case 'EN_RETARD': return 'bg-red-50 text-red-700 ring-red-600/20';
      default: return 'bg-gray-50 text-gray-700 ring-gray-600/20';
    }
  }

  protected getStatutLabel(statut: string): string {
    switch (statut) {
      case 'SOLDÉ': return 'Soldé';
      case 'EN_COURS': return 'En cours';
      case 'EN_RETARD': return 'En retard';
      default: return statut;
    }
  }
}