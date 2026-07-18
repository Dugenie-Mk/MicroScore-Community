import { Component, inject, signal, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { LoanRequestService, PretApiResponse } from '../../../../core/services/loan-request.service';
import { RepaymentService, EcheanceDto, GrilleAmortissementResponse } from '../../../../core/services/repayment.service';
import { ScoreResultService, ScoreDetailResponse } from '../../../../core/services/score-result.service';
import { ToastService } from '../../../../core/services/toast.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal';

interface LoanDetailDisplay {
  idPret: number;
  motif: string;
  montant: number;
  duree: string;
  dureeMois: number;
  date: string;
  dateDecision?: string;
  statut: string;
  rawStatut: string;
  scoreTotal: number;
}

const LABEL_MAP: Record<string, string> = {
  APPROUVE: 'ACCORDÉ',
  REJETE: 'REFUSÉ',
  EN_ATTENTE: 'EN_ATTENTE',
  ANNULE: 'ANNULÉ',
};

@Component({
  selector: 'app-client-loan-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ConfirmModalComponent],
  templateUrl: './client-loan-detail.html',
})
export class ClientLoanDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly loanService = inject(LoanRequestService);
  private readonly repaymentService = inject(RepaymentService);
  private readonly scoreResultService = inject(ScoreResultService);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthService);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly actionLoading = signal(false);

  @ViewChild('confirmModal') protected confirmModal!: ConfirmModalComponent;

  protected readonly pret = signal<LoanDetailDisplay | null>(null);
  protected readonly grille = signal<GrilleAmortissementResponse | null>(null);
  protected readonly scoreDetail = signal<ScoreDetailResponse | null>(null);

  protected readonly palette = [
    'bg-violet-500', 'bg-emerald-500', 'bg-amber-500', 'bg-blue-500',
    'bg-rose-500', 'bg-cyan-500', 'bg-orange-500',
  ];

  protected readonly echeances = computed(() => this.grille()?.echeances ?? []);
  protected readonly prochaineEcheance = computed(() =>
    this.echeances().find((e) => e.statut === 'EN_ATTENTE' || e.statut === 'EN_RETARD')
  );

  protected readonly payees = computed(() => this.echeances().filter((e) => e.statut === 'PAYE'));
  protected readonly totalRembourse = computed(() => this.payees().reduce((s, e) => s + e.mensualite, 0));
  protected readonly resteARembourser = computed(() => {
    const g = this.grille();
    return g ? g.coutTotalCredit - this.totalRembourse() : 0;
  });

  protected readonly progress = computed(() => {
    const g = this.grille();
    if (!g || g.coutTotalCredit <= 0) return 0;
    return Math.min(100, Math.round((this.totalRembourse() / g.coutTotalCredit) * 100));
  });

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
        this.pret.set({
          idPret: pret.idPret,
          motif: pret.motif || '',
          montant: pret.montant,
          duree: pret.dureeRemboursementMois + ' mois',
          dureeMois: pret.dureeRemboursementMois,
          date: pret.dateEnregistrement ? pret.dateEnregistrement.substring(0, 10) : '',
          dateDecision: pret.dateDecision ? pret.dateDecision.substring(0, 10) : undefined,
          statut: LABEL_MAP[pret.statut] ?? pret.statut,
          rawStatut: pret.statut,
          scoreTotal: pret.scoreTotal,
        });

        this.scoreResultService.loadDetailByPretId(pret.idPret).then((detail) => {
          this.scoreDetail.set(detail);
        });

        if (pret.statut === 'APPROUVE') {
          this.loadAmortissement(pret.idPret);
        } else {
          this.loading.set(false);
        }
      },
      error: () => {
        this.error.set('Impossible de charger les détails du prêt.');
        this.loading.set(false);
        this.toast.show('Erreur lors du chargement du prêt.', 'error');
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
        this.toast.show('Erreur lors du chargement des échéances.', 'error');
      },
    });
  }

  protected getStatusClass(statut: string): string {
    switch (statut) {
      case 'ACCORDÉ': return 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-950/20 dark:text-green-400';
      case 'REFUSÉ': return 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-950/20 dark:text-red-400';
      case 'EN_ATTENTE': return 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950/20 dark:text-amber-400';
      case 'ANNULÉ': return 'bg-gray-50 text-gray-500 ring-gray-400/30 dark:bg-gray-800/20 dark:text-gray-500';
      default: return 'bg-gray-50 text-gray-700 ring-gray-600/20';
    }
  }

  protected async annulerPret(): Promise<void> {
    const p = this.pret();
    const clientId = this.auth.currentUser()?.id;
    if (!p || !clientId) return;

    const confirmed = await this.confirmModal.open({
      title: 'Annuler la demande',
      message: 'Êtes-vous sûr de vouloir annuler cette demande de prêt ? Cette action est irréversible.',
      confirmLabel: 'Annuler le prêt',
      type: 'warning',
    });
    if (!confirmed) return;

    this.actionLoading.set(true);
    this.loanService.cancelLoan(p.idPret, clientId).subscribe({
      next: () => {
        this.toast.show('Prêt annulé avec succès.', 'success');
        this.loadData(p.idPret);
      },
      error: (err) => {
        this.actionLoading.set(false);
        const msg = err.error?.message || 'Erreur lors de l\'annulation du prêt.';
        this.toast.show(msg, 'error');
      },
    });
  }

  protected async supprimerPret(): Promise<void> {
    const p = this.pret();
    const clientId = this.auth.currentUser()?.id;
    if (!p || !clientId) return;

    const confirmed = await this.confirmModal.open({
      title: 'Supprimer la demande',
      message: 'Êtes-vous sûr de vouloir supprimer définitivement cette demande de prêt ? Cette action est irréversible.',
      confirmLabel: 'Supprimer',
      type: 'danger',
    });
    if (!confirmed) return;

    this.actionLoading.set(true);
    this.loanService.deleteLoan(p.idPret, clientId).subscribe({
      next: () => {
        this.toast.show('Prêt supprimé avec succès.', 'success');
        this.router.navigate(['/client/loans']);
      },
      error: (err) => {
        this.actionLoading.set(false);
        const msg = err.error?.message || 'Erreur lors de la suppression du prêt.';
        this.toast.show(msg, 'error');
      },
    });
  }

  protected riskLabel(total: number): string {
    if (total >= 80) return 'Faible risque';
    if (total >= 60) return 'Risque modéré';
    if (total >= 40) return 'Risque élevé';
    return 'Très risqué';
  }

  protected getScoreColor(s: number): string {
    if (s >= 70) return 'text-green-600 dark:text-green-400';
    if (s >= 50) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  }

  protected getScoreBarColor(s: number): string {
    if (s >= 70) return 'bg-green-500';
    if (s >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  }

  protected getEcheanceColor(e: EcheanceDto): { dot: string; label: string } {
    if (e.statut === 'PAYE') {
      if (e.datePaiement && this.isOnTime(e.dateEcheancePrevue, e.datePaiement)) return { dot: 'bg-green-500', label: 'Payée à temps' };
      return { dot: 'bg-amber-500', label: 'Payée en retard' };
    }
    if (e.statut === 'EN_RETARD') return { dot: 'bg-red-500', label: 'En retard' };
    return { dot: 'bg-gray-400', label: 'À payer' };
  }

  protected formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('fr-FR');
  }
}