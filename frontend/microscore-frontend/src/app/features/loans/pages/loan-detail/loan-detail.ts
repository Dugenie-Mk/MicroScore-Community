import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../../../core/services/auth.service';
import { UserService } from '../../../../core/services/user.service';
import { LoanRequestService, PretApiResponse } from '../../../../core/services/loan-request.service';
import { RepaymentService, EcheanceDto } from '../../../../core/services/repayment.service';
import { ScoringService, DemandeScoringRequest } from '../../../../core/services/scoring.service';
import { ToastService } from '../../../../core/services/toast.service';
import { User } from '../../../../core/models/user.model';

interface LoanDisplay {
  idPret: number;
  motif: string;
  montant: number;
  date: string;
  duree: string;
  statut: string;
  scoreTotal: number;
}

interface RepaymentDisplay {
  idPret: number;
  motif: string;
  montantEmprunte: number;
  totalARembourser: number;
  montantRembourse: number;
  resteARembourser: number;
  dateProchaineEcheance: string;
  statut: string;
  echeances: EcheanceDto[];
}

@Component({
  selector: 'app-loan-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './loan-detail.html',
})
export class LoanDetail {
  protected readonly Math = Math;
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly loanService = inject(LoanRequestService);
  private readonly repaymentService = inject(RepaymentService);
  private readonly scoringService = inject(ScoringService);
  private readonly toast = inject(ToastService);

  protected readonly isAdmin = computed(() => this.auth.currentUser()?.role === 'ADMIN');
  protected readonly isGestionnaire = computed(() => this.auth.currentUser()?.role === 'GESTIONNAIRE');

  protected readonly CIRCUMFERENCE = 2 * Math.PI * 42;

  protected getRingOffset(pct: number): number {
    return this.CIRCUMFERENCE * (1 - pct / 100);
  }

  protected getRingRotation(pct: number): string {
    return `rotate(${(pct / 100) * 360} 50 50)`;
  }

  protected readonly clientId = signal<number>(0);
  protected readonly client = signal<User | null>(null);
  protected readonly loans = signal<LoanDisplay[]>([]);
  protected readonly repayments = signal<RepaymentDisplay[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly clientLoans = computed(() => this.loans());

  protected readonly clientRepayments = computed(() => this.repayments());

  protected readonly score = computed(() => {
    const scored = this.loans().filter((l) => l.scoreTotal > 0);
    if (scored.length === 0) return 0;
    return Math.round(scored.reduce((s, l) => s + l.scoreTotal, 0) / scored.length);
  });

  protected readonly riskCategory = computed(() => {
    const s = this.score();
    if (s >= 80) return { label: 'Faible', color: 'text-green-600', bg: 'bg-green-500', bar: 'from-green-500 to-emerald-400' };
    if (s >= 60) return { label: 'Modéré', color: 'text-amber-600', bg: 'bg-amber-500', bar: 'from-amber-500 to-yellow-400' };
    return { label: 'Élevé', color: 'text-red-600', bg: 'bg-red-500', bar: 'from-red-500 to-rose-400' };
  });

  protected readonly allEcheances = computed(() =>
    this.repayments().flatMap((r) =>
      r.echeances.map((e) => ({ ...e, motif: r.motif }))
    ).sort((a, b) => new Date(a.dateEcheancePrevue).getTime() - new Date(b.dateEcheancePrevue).getTime())
  );

  protected readonly paymentStats = computed(() => {
    const all = this.allEcheances();
    const onTime = all.filter((e) => e.statut === 'PAYE' && e.datePaiement && this.isOnTime(e.dateEcheancePrevue, e.datePaiement)).length;
    const late = all.filter((e) => e.statut === 'PAYE' && e.datePaiement && !this.isOnTime(e.dateEcheancePrevue, e.datePaiement)).length;
    const missed = all.filter((e) => e.statut !== 'PAYE').length;
    return { total: all.length, onTime, late, missed };
  });

  private isOnTime(due: string, paid: string): boolean {
    return new Date(paid) <= new Date(due);
  }

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      if (id && id !== this.clientId()) {
        this.clientId.set(id);
        this.loadData();
      }
    });
    effect(() => {
      this.repaymentService.refreshTrigger();
      const id = this.clientId();
      if (id) this.loadData();
    });
  }

  private loadData(): void {
    const id = this.clientId();
    if (!id) {
      this.error.set('Identifiant client invalide.');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.client.set(null);
    this.loans.set([]);
    this.repayments.set([]);

    this.userService.getById(id).subscribe({
      next: (user) => {
        this.client.set(user);
        this.loadLoans(id);
      },
      error: () => {
        this.error.set('Client introuvable.');
        this.loading.set(false);
      },
    });
  }

  private loadLoans(clientId: number): void {
    this.loanService.getByClientId(clientId).subscribe({
      next: (prets) => {
        this.loans.set(prets.map((p) => ({
          idPret: p.idPret,
          motif: p.motif || '',
          montant: p.montant,
          date: p.dateEnregistrement ? p.dateEnregistrement.substring(0, 10) : '',
          duree: p.dureeRemboursementMois + ' mois',
          statut: p.statut,
          scoreTotal: p.scoreTotal,
        })));
        this.loadRepayments(prets);
      },
      error: () => {
        this.loans.set([]);
        this.loading.set(false);
      },
    });
  }

  private loadRepayments(prets: PretApiResponse[]): void {
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

          let statutRemb = 'EN_COURS';
          if (allPayees) statutRemb = 'SOLDÉ';
          else if (enRetard) statutRemb = 'EN_RETARD';

          this.repayments.update((items) => [
            ...items,
            {
              idPret: pret.idPret,
              motif: pret.motif || '',
              montantEmprunte: grille.montantEmprunte,
              totalARembourser: grille.coutTotalCredit,
              montantRembourse: totalRembourse,
              resteARembourser: grille.coutTotalCredit - totalRembourse,
              dateProchaineEcheance: prochaine ? this.formatDate(prochaine.dateEcheancePrevue) : '-',
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
  }

  private formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR');
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

  protected updateStatus(idPret: number, newStatus: 'APPROUVE' | 'REJETE'): void {
    this.loanService.updateStatus(idPret, newStatus);
    this.loans.update((items) =>
      items.map((l) => (l.idPret === idPret ? { ...l, statut: newStatus } : l))
    );
  }

  protected getStatutClass(s: string): string {
    switch (s) {
      case 'APPROUVE': return 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400';
      case 'REJETE': return 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400';
      case 'EN_ATTENTE': return 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400';
      case 'SOLDÉ': return 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400';
      case 'EN_RETARD': return 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400';
      case 'EN_COURS': return 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400';
      default: return 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  }

  protected getEcheanceColor(e: EcheanceDto): { dot: string; label: string } {
    if (e.statut === 'PAYE') {
      if (e.datePaiement && this.isOnTime(e.dateEcheancePrevue, e.datePaiement)) return { dot: 'bg-green-500', label: 'Payée à temps' };
      return { dot: 'bg-amber-500', label: 'Payée en retard' };
    }
    if (e.statut === 'EN_RETARD') return { dot: 'bg-red-500', label: 'En retard' };
    return { dot: 'bg-gray-400', label: 'À payer' };
  }

  protected readonly colors = [
    'from-violet-500 to-purple-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-amber-600',
    'from-cyan-500 to-blue-600',
  ];

  protected getInitials(name: string): string {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  protected showScoreModal = signal(false);
  protected scoringPretId = signal<number | null>(null);
  protected scoringLoading = signal(false);

  protected scoreForm: DemandeScoringRequest = {
    clientId: 0,
    age: 30,
    situationMatrimoniale: 'CELIBATAIRE',
    niveauEducation: 'BAC',
    ancienneteResidenceMois: 12,
    nombrePersonnesACharge: 0,
    revenuMensuelNet: 0,
    chargesFixes: 0,
    fluxTresorerieActivite: 0,
    montant: 0,
    dureeRemboursementMois: 12,
    nombreRetardsAnterieurs: 0,
    nombrePretsEnCours: 0,
    ancienneteClientMois: 6,
    ancienneteEntrepriseMois: 0,
    chiffreAffairesMensuel: 0,
    epargneConstituee: 0,
    noteMotivationEntretien: 5,
  };

  protected openScoreModal(loan: LoanDisplay): void {
    this.scoringPretId.set(loan.idPret);
    this.scoringLoading.set(false);

    const c = this.client();
    this.scoreForm = {
      clientId: this.clientId(),
      age: 30,
      situationMatrimoniale: 'CELIBATAIRE',
      niveauEducation: 'BAC',
      ancienneteResidenceMois: 12,
      nombrePersonnesACharge: 0,
      revenuMensuelNet: 0,
      chargesFixes: 0,
      fluxTresorerieActivite: 0,
      montant: loan.montant,
      dureeRemboursementMois: parseInt(loan.duree) || 12,
      nombreRetardsAnterieurs: 0,
      nombrePretsEnCours: 0,
      ancienneteClientMois: 6,
      ancienneteEntrepriseMois: 0,
      chiffreAffairesMensuel: 0,
      epargneConstituee: 0,
      noteMotivationEntretien: 5,
    };

    this.showScoreModal.set(true);
  }

  protected closeScoreModal(): void {
    this.showScoreModal.set(false);
    this.scoringPretId.set(null);
  }

  protected submitScore(): void {
    const pretId = this.scoringPretId();
    if (!pretId) return;

    this.scoringLoading.set(true);

    const request: DemandeScoringRequest = {
      ...this.scoreForm,
      clientId: this.clientId(),
      montant: this.scoreForm.montant,
      dureeRemboursementMois: this.scoreForm.dureeRemboursementMois,
    };

    this.scoringService.calculerScore(pretId, request).subscribe({
      next: (response) => {
        this.scoringLoading.set(false);
        this.toast.show(`Score calculé : ${Math.round(response.scoreTotal)}/100`, 'success');
        this.closeScoreModal();
        this.loans.update((items) =>
          items.map((l) => l.idPret === pretId ? { ...l, scoreTotal: response.scoreTotal } : l)
        );
      },
      error: (err) => {
        this.scoringLoading.set(false);
        const msg = err.error?.message || err.message || 'Erreur lors du calcul du score.';
        this.toast.show(msg, 'error');
      },
    });
  }

  protected getEcheanceDotColor(statut: string): string {
    switch (statut) {
      case 'PAYE': return 'bg-green-500';
      case 'EN_RETARD': return 'bg-red-500';
      default: return 'bg-amber-500';
    }
  }
}
