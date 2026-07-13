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

interface LoanOption {
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
  selector: 'app-client-repayment-form',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './client-repayment-form.html',
})
export class ClientRepaymentForm {
  protected readonly modesPaiement = ['Virement', 'Cash', 'Mobile Money', 'Chèque'];

  protected readonly loans = signal<LoanOption[]>([
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

  protected readonly actifs = computed(() => this.loans().filter((l) => l.statut !== 'SOLDÉ'));

  protected selectedLoanId = signal<number | null>(null);
  protected selectedLoan = computed(() => this.loans().find((l) => l.id === this.selectedLoanId()) ?? null);

  protected montantPaiement = signal(0);
  protected modePaiement = signal('Virement');

  protected submitted = signal(false);
  protected reference = signal('');

  protected readonly echeancesRestantes = computed(() =>
    this.selectedLoan()?.echeances.filter((e) => !e.paye) ?? []
  );

  protected readonly prochaineEcheance = computed(() => {
    const restantes = this.echeancesRestantes();
    return restantes.length > 0 ? restantes[0] : null;
  });

  protected readonly montantSuggere = computed(() => this.prochaineEcheance()?.montant ?? 0);

  protected selectLoan(id: number): void {
    this.selectedLoanId.set(id);
    const loan = this.loans().find((l) => l.id === id);
    if (loan) {
      const next = loan.echeances.find((e) => !e.paye);
      this.montantPaiement.set(next?.montant ?? 0);
    }
    this.modePaiement.set('Virement');
    this.submitted.set(false);
  }

  protected submit(): void {
    const loan = this.selectedLoan();
    if (!loan || this.montantPaiement() <= 0) return;

    const ref = 'PAY-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    this.reference.set(ref);

    this.loans.update((loans) =>
      loans.map((l) => {
        if (l.id !== loan.id) return l;
        let reste = this.montantPaiement();
        const newEcheances = l.echeances.map((e) => {
          if (e.paye || reste <= 0) return e;
          const payeMontant = Math.min(reste, e.montant);
          reste -= payeMontant;
          return { ...e, paye: true, datePaiement: new Date().toLocaleDateString('fr-FR') };
        });
        const newMontantRembourse = l.montantRembourse + this.montantPaiement();
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

    this.submitted.set(true);
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
