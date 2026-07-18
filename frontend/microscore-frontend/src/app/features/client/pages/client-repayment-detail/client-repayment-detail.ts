import { Component, inject, signal, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal';

import { LoanRequestService, PretApiResponse } from '../../../../core/services/loan-request.service';
import { RepaymentService, EcheanceDto, GrilleAmortissementResponse } from '../../../../core/services/repayment.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-client-repayment-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ConfirmModalComponent],
  templateUrl: './client-repayment-detail.html',
})
export class ClientRepaymentDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly loanService = inject(LoanRequestService);
  private readonly repaymentService = inject(RepaymentService);
  private readonly toast = inject(ToastService);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly pret = signal<PretApiResponse | null>(null);
  protected readonly grille = signal<GrilleAmortissementResponse | null>(null);

  protected readonly echeances = computed(() => this.grille()?.echeances ?? []);
  protected readonly payees = computed(() => this.echeances().filter((e) => e.statut === 'PAYE'));
  protected readonly enAttente = computed(() => this.echeances().filter((e) => e.statut === 'EN_ATTENTE'));
  protected readonly enRetard = computed(() => this.echeances().filter((e) => e.statut === 'EN_RETARD'));
  protected readonly restantes = computed(() => this.echeances().filter((e) => e.statut !== 'PAYE'));

  protected readonly totalRembourse = computed(() => this.payees().reduce((s, e) => s + e.mensualite, 0));
  protected readonly resteARembourser = computed(() => {
    const g = this.grille();
    return g ? g.coutTotalCredit - this.totalRembourse() : 0;
  });

  protected readonly progression = computed(() => {
    const g = this.grille();
    if (!g || g.coutTotalCredit <= 0) return 0;
    return Math.min(100, Math.round((this.totalRembourse() / g.coutTotalCredit) * 100));
  });

  protected readonly estSolde = computed(() => this.restantes().length === 0);

  // Paiement modal
  protected showPayModal = signal(false);
  protected selectedEcheance = signal<EcheanceDto | null>(null);
  protected modePaiement = signal('Virement');
  protected paiementEnCours = signal(false);
  protected paiementEffectue = signal(false);

  @ViewChild('confirmModal') protected confirmModal!: ConfirmModalComponent;

  protected readonly modesPaiement = ['Virement', 'Cash', 'Mobile Money', 'Chèque'];

  protected readonly isOnTime = (due: string, paid: string): boolean =>
    new Date(paid) <= new Date(due);

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      if (id) this.loadData(id);
    });
  }

  private loadData(pretId: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.loanService.getById(pretId).subscribe({
      next: (pret) => {
        this.pret.set(pret);
        if (pret.statut === 'APPROUVE') {
          this.loadAmortissement(pret.idPret);
        } else {
          this.loading.set(false);
        }
      },
      error: () => {
        this.error.set('Impossible de charger les détails du prêt.');
        this.loading.set(false);
      },
    });
  }

  private loadAmortissement(idPret: number): void {
    this.repaymentService.getAmortissementByPret(idPret).subscribe({
      next: (grille) => {
        this.grille.set(grille);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  protected openPayModal(echeance: EcheanceDto): void {
    this.selectedEcheance.set(echeance);
    this.modePaiement.set('Virement');
    this.paiementEffectue.set(false);
    this.showPayModal.set(true);
  }

  protected closePayModal(): void {
    this.showPayModal.set(false);
    this.selectedEcheance.set(null);
    this.paiementEffectue.set(false);
  }

  protected async effectuerPaiement(): Promise<void> {
    const echeance = this.selectedEcheance();
    if (!echeance) return;

    const confirmed = await this.confirmModal.open({
      title: 'Confirmer le paiement',
      message: `Payer l'échéance de ${echeance.mensualite.toLocaleString()} FCFA ?`,
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
      },
      error: (err) => {
        this.paiementEnCours.set(false);
        const msg = err.error?.message || err.message || 'Erreur lors du paiement.';
        this.toast.show(msg, 'error');
      },
    });
  }

  protected getEcheanceColor(e: EcheanceDto): { dot: string; label: string; bg: string } {
    if (e.statut === 'PAYE') {
      if (e.datePaiement && this.isOnTime(e.dateEcheancePrevue, e.datePaiement)) {
        return { dot: 'bg-green-500', label: 'Payée à temps', bg: 'bg-green-50 dark:bg-green-950/10' };
      }
      return { dot: 'bg-amber-500', label: 'Payée en retard', bg: 'bg-amber-50 dark:bg-amber-950/10' };
    }
    if (e.statut === 'EN_RETARD') return { dot: 'bg-red-500', label: 'En retard', bg: 'bg-red-50 dark:bg-red-950/10' };
    return { dot: 'bg-gray-400', label: 'À payer', bg: 'bg-gray-50 dark:bg-gray-800/30' };
  }

  protected getScoreColor(s: number): string {
    if (s >= 70) return 'text-green-600 dark:text-green-400';
    if (s >= 50) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  }

  protected formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('fr-FR');
  }
}