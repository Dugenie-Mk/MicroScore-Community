import { Component, inject, signal, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal';

import { AuthService } from '../../../../core/services/auth.service';
import { LoanRequestService } from '../../../../core/services/loan-request.service';
import { RepaymentService, EcheanceDto } from '../../../../core/services/repayment.service';
import { ToastService } from '../../../../core/services/toast.service';

interface LoanOption {
  idPret: number;
  motif: string;
  montantEmprunte: number;
  totalARembourser: number;
  montantRembourse: number;
  resteARembourser: number;
  dateProchaineEcheance: string;
  statut: 'SOLDÉ' | 'EN_COURS' | 'EN_RETARD';
  echeances: EcheanceDto[];
}

@Component({
  selector: 'app-client-repayment-form',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ConfirmModalComponent],
  templateUrl: './client-repayment-form.html',
})
export class ClientRepaymentForm {
  private readonly auth = inject(AuthService);
  private readonly loanService = inject(LoanRequestService);
  private readonly repaymentService = inject(RepaymentService);
  private readonly toast = inject(ToastService);

  @ViewChild('confirmModal') protected confirmModal!: ConfirmModalComponent;

  protected readonly modesPaiement = ['Virement', 'Cash', 'Mobile Money', 'Chèque'];

  protected readonly loans = signal<LoanOption[]>([]);
  protected readonly loading = signal(true);

  protected selectedLoanId = signal<number | null>(null);
  protected selectedLoan = computed(() => this.loans().find((l) => l.idPret === this.selectedLoanId()) ?? null);

  protected modePaiement = signal('Virement');
  protected submitted = signal(false);
  protected reference = signal('');
  protected paiementEnCours = signal(false);

  protected nombreMois = signal(1);

  protected readonly echeancesRestantes = computed(() =>
    this.selectedLoan()?.echeances.filter((e) => e.statut !== 'PAYE') ?? []
  );

  protected readonly maxMois = computed(() => this.echeancesRestantes().length);

  protected readonly echeancesSelectionnees = computed(() =>
    this.echeancesRestantes().slice(0, this.nombreMois())
  );

  protected readonly totalPayer = computed(() =>
    this.echeancesSelectionnees().reduce((s, e) => s + e.mensualite, 0)
  );

  constructor() {
    this.loadLoans();
  }

  private loadLoans(): void {
    const userId = this.auth.currentUser()?.id;
    if (!userId) {
      this.loading.set(false);
      return;
    }

    this.loans.set([]);

    this.loanService.getByClientId(userId).subscribe({
      next: (prets) => {
        const approuves = prets.filter((p) => p.statut === 'APPROUVE');
        if (approuves.length === 0) {
          this.loading.set(false);
          return;
        }
        let completed = 0;
        for (const pret of approuves) {
          this.repaymentService.getAmortissementByPret(pret.idPret).subscribe({
            next: (grille) => {
              const payees = grille.echeances.filter((e) => e.statut === 'PAYE');
              const totalRembourse = payees.reduce((s, e) => s + e.mensualite, 0);
              const allPayees = grille.echeances.every((e) => e.statut === 'PAYE');
              const enRetard = grille.echeances.some((e) => e.statut === 'EN_RETARD');
              const prochaine = grille.echeances.find((e) => e.statut === 'EN_ATTENTE' || e.statut === 'EN_RETARD');

              let statutRemb: 'SOLDÉ' | 'EN_COURS' | 'EN_RETARD' = 'EN_COURS';
              if (allPayees) statutRemb = 'SOLDÉ';
              else if (enRetard) statutRemb = 'EN_RETARD';

              this.loans.update((items) => [
                ...items,
                {
                  idPret: pret.idPret,
                  motif: pret.motif || '',
                  montantEmprunte: grille.montantEmprunte,
                  totalARembourser: grille.coutTotalCredit,
                  montantRembourse: totalRembourse,
                  resteARembourser: grille.coutTotalCredit - totalRembourse,
                  dateProchaineEcheance: prochaine ? prochaine.dateEcheancePrevue : '-',
                  statut: statutRemb,
                  echeances: grille.echeances,
                },
              ]);
            },
            error: () => {},
            complete: () => {
              completed++;
              if (completed === approuves.length) this.loading.set(false);
            },
          });
        }
      },
      error: () => this.loading.set(false),
    });
  }

  protected selectLoan(id: number): void {
    this.selectedLoanId.set(id);
    this.modePaiement.set('Virement');
    this.submitted.set(false);
    this.nombreMois.set(1);
  }

  protected async submit(): Promise<void> {
    if (this.nombreMois() < 1 || this.echeancesSelectionnees().length === 0) return;

    const loan = this.selectedLoan();
    const echeances = this.echeancesSelectionnees();
    if (!loan) return;

    const montantTotal = echeances.reduce((s, e) => s + e.mensualite, 0);
    const nbMois = echeances.length;
    const msg = nbMois === 1
      ? `Payer l'échéance de ${montantTotal.toLocaleString()} FCFA pour "${loan.motif}" ?`
      : `Payer ${nbMois} échéances (${montantTotal.toLocaleString()} FCFA) pour "${loan.motif}" ?`;

    const confirmed = await this.confirmModal.open({
      title: 'Confirmer le paiement',
      message: msg,
      confirmLabel: 'Payer',
      type: 'info',
    });
    if (!confirmed) return;

    this.paiementEnCours.set(true);

    this.repaymentService.payerEcheances(loan.idPret, nbMois).subscribe({
      next: () => {
        this.paiementEnCours.set(false);
        this.submitted.set(true);
        this.reference.set('PAIEMENT-' + Date.now());
        this.toast.show('Paiement effectué avec succès.', 'success');
      },
      error: (err) => {
        this.paiementEnCours.set(false);
        const msg = err.error?.message || err.message || 'Erreur lors du paiement.';
        this.toast.show(msg, 'error');
      },
    });
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
