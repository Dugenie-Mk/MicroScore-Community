import { Component, inject, signal, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal';

import { AuthService } from '../../../../core/services/auth.service';
import { LoanRequestService } from '../../../../core/services/loan-request.service';
import { RepaymentService, EcheanceDto } from '../../../../core/services/repayment.service';
import { ToastService } from '../../../../core/services/toast.service';

interface LoanRepayment {
  idPret: number;
  motif: string;
  montantEmprunte: number;
  totalARembourser: number;
  montantRembourse: number;
  resteARembourser: number;
  dateProchaineEcheance: string;
  dateEnregistrement: string;
  statut: 'SOLDÉ' | 'EN_COURS' | 'EN_RETARD';
  echeances: EcheanceDto[];
}

@Component({
  selector: 'app-client-repayments',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ConfirmModalComponent],
  templateUrl: './client-repayments.html',
})
export class ClientRepayments {
  private readonly auth = inject(AuthService);
  private readonly loanService = inject(LoanRequestService);
  private readonly repaymentService = inject(RepaymentService);
  private readonly toast = inject(ToastService);

  protected readonly loans = signal<LoanRepayment[]>([]);
  protected readonly loading = signal(true);

  protected readonly statutFilter = signal<'TOUS' | 'SOLDÉ' | 'EN_COURS' | 'EN_RETARD'>('TOUS');
  protected readonly dateDebut = signal('');
  protected readonly dateFin = signal('');

  protected readonly statutOptions = ['TOUS', 'SOLDÉ', 'EN_COURS', 'EN_RETARD'] as const;

  protected readonly filteredLoans = computed(() => {
    let list = this.loans();

    const sf = this.statutFilter();
    if (sf !== 'TOUS') {
      list = list.filter((l) => l.statut === sf);
    }

    const dd = this.dateDebut();
    const df = this.dateFin();
    if (dd) {
      const debut = new Date(dd).getTime();
      list = list.filter((l) => new Date(l.dateProchaineEcheance).getTime() >= debut);
    }
    if (df) {
      const fin = new Date(df).getTime();
      list = list.filter((l) => new Date(l.dateProchaineEcheance).getTime() <= fin);
    }

    return list;
  });

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
  protected selectedEcheance = signal<EcheanceDto | null>(null);
  protected modePaiement = signal('Virement');
  protected paiementEnCours = signal(false);
  protected paiementEffectue = signal(false);

  @ViewChild('confirmModal') protected confirmModal!: ConfirmModalComponent;

  protected readonly modesPaiement = ['Virement', 'Cash', 'Mobile Money', 'Chèque'];

  constructor() {
    this.loadRepayments();
  }

  private loadRepayments(): void {
    const userId = this.auth.currentUser()?.id;
    if (!userId) {
      this.loading.set(false);
      return;
    }

    this.loans.set([]);
    this.loading.set(true);

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
                  dateProchaineEcheance: prochaine ? this.formatDate(prochaine.dateEcheancePrevue) : '-',
                  dateEnregistrement: pret.dateEnregistrement,
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

  private formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR');
  }

  protected openPayModal(loan: LoanRepayment): void {
    const prochaine = loan.echeances.find((e) => e.statut === 'EN_ATTENTE' || e.statut === 'EN_RETARD');
    this.selectedLoan.set(loan);
    this.selectedEcheance.set(prochaine ?? null);
    this.modePaiement.set('Virement');
    this.paiementEffectue.set(false);
    this.showPayModal.set(true);
  }

  protected closePayModal(): void {
    this.showPayModal.set(false);
    this.selectedLoan.set(null);
    this.selectedEcheance.set(null);
  }

  protected async effectuerPaiement(): Promise<void> {
    const echeance = this.selectedEcheance();
    const loan = this.selectedLoan();
    if (!echeance || !loan) return;

    const confirmed = await this.confirmModal.open({
      title: 'Confirmer le paiement',
      message: `Payer l'échéance de ${echeance.mensualite.toLocaleString()} FCFA pour "${loan.motif}" ?`,
      confirmLabel: 'Payer',
      type: 'info',
    });
    if (!confirmed) return;

    this.paiementEnCours.set(true);

    this.repaymentService.payerEcheance(echeance.id).subscribe({
      next: () => {
        this.paiementEnCours.set(false);
        this.paiementEffectue.set(true);
        this.toast.show('Paiement effectué avec succès.', 'success');
        this.loadRepayments();
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
