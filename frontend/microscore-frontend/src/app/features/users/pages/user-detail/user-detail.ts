import { Component, signal, computed, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { UserService } from '../../../../core/services/user.service';
import { LoanRequestService, PretApiResponse } from '../../../../core/services/loan-request.service';
import { RepaymentService, EcheanceDto, GrilleAmortissementResponse } from '../../../../core/services/repayment.service';
import { ScoringParamService, Parametre } from '../../../../core/services/scoring-param.service';
import { ScoringService } from '../../../../core/services/scoring.service';
import { User } from '../../../../core/models/user.model';

type ActiveTab = 'infos' | 'scoring' | 'loans' | 'repayments';

interface LoanDisplay {
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
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './user-detail.html',
})
export class UserDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private readonly userService = inject(UserService);
  private readonly loanService = inject(LoanRequestService);
  private readonly repaymentService = inject(RepaymentService);
  private readonly scoringService = inject(ScoringService);
  protected readonly scoringParamService = inject(ScoringParamService);

  activeTab = signal<ActiveTab>('infos');
  user = signal<User | null>(null);
  loading = signal(true);

  loans = signal<LoanDisplay[]>([]);
  repayments = signal<RepaymentDisplay[]>([]);

  clientScore = computed(() => {
    const scored = this.loans().filter((l) => l.score > 0);
    if (scored.length === 0) return 0;
    return Math.round(scored.reduce((s, l) => s + l.score, 0) / scored.length);
  });

  private formatDate(iso: string): string {
    if (!iso) return '-';
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR');
  }

  readonly clientTabs: { key: ActiveTab; label: string }[] = [
    { key: 'infos', label: 'Infos personnelles' },
    { key: 'scoring', label: 'Scoring' },
    { key: 'loans', label: 'Prêts' },
    { key: 'repayments', label: 'Remboursements' },
  ];

  ngOnInit() {
    effect(() => {
      this.repaymentService.refreshTrigger();
      this.userService.refreshTrigger();
      const currentId = this.route.snapshot.paramMap.get('id');
      if (currentId) this.loadUserData(Number(currentId));
    });
  }

  private loadUserData(id: number) {
    this.loading.set(true);

    this.userService.getById(id).subscribe({
      next: (user) => {
        this.user.set(user);
        if (user.role === 'CLIENT') {
          this.loadClientData(id);
        } else {
          this.loading.set(false);
        }
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  private loadClientData(clientId: number) {
    this.loanService.getByClientId(clientId).subscribe({
      next: (prets) => {
        const items: LoanDisplay[] = prets.map((p) => ({
          idPret: p.idPret,
          motif: p.motif || '',
          montant: p.montant,
          duree: p.dureeRemboursementMois + ' mois',
          date: p.dateEnregistrement ? p.dateEnregistrement.substring(0, 10) : '',
          statut: p.statut,
          statutLabel: p.statut === 'APPROUVE' ? 'ACCORDÉ' : p.statut === 'REJETE' ? 'REFUSÉ' : 'EN_ATTENTE',
          score: p.scoreTotal,
          total: 0,
          rembourse: 0,
          reste: 0,
        }));
        this.loans.set(items);

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

              this.loans.update((items) =>
                items.map((item) => {
                  if (item.idPret !== pret.idPret) return item;
                  return {
                    ...item,
                    total: grille.coutTotalCredit,
                    rembourse: totalRembourse,
                    reste: grille.coutTotalCredit - totalRembourse,
                  };
                })
              );
            },
            error: () => {},
            complete: () => {
              completed++;
              if (completed === approuves.length) this.loading.set(false);
            },
          });
        }
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getRoleBadgeClass(role: string | undefined): string {
    switch (role) {
      case 'CLIENT': return 'bg-blue-50/80 text-blue-700 ring-blue-600/20';
      case 'GESTIONNAIRE': return 'bg-emerald-50/80 text-emerald-700 ring-emerald-600/20';
      case 'ADMIN': return 'bg-purple-50/80 text-purple-700 ring-purple-600/20';
      default: return 'bg-gray-50 text-gray-700 ring-gray-600/20';
    }
  }

  getStatusBadgeClass(statut: string | undefined): string {
    switch (statut) {
      case 'ACTIF': return 'bg-green-50/80 text-green-700 ring-green-600/20';
      case 'BLOQUE': return 'bg-red-50/80 text-red-700 ring-red-600/20';
      case 'EN_ATTENTE': return 'bg-amber-50/80 text-amber-700 ring-amber-600/20';
      default: return 'bg-gray-50 text-gray-700 ring-gray-600/20';
    }
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

  protected getStatutClass(s: string): string {
    switch (s) {
      case 'ACCORDÉ':
      case 'APPROUVE': return 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400';
      case 'REFUSÉ':
      case 'REJETE': return 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400';
      case 'EN_ATTENTE': return 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400';
      default: return 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  }

  protected getRembStatusClass(s: string): string {
    switch (s) {
      case 'SOLDÉ': return 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400';
      case 'EN_RETARD': return 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400';
      case 'EN_COURS': return 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400';
      default: return 'bg-gray-50 text-gray-700';
    }
  }

  protected getRiskCategory(score: number): { label: string; color: string; style: string } {
    if (score >= 70) return { label: 'Faible', color: 'text-green-600', style: 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400' };
    if (score >= 50) return { label: 'Modéré', color: 'text-amber-600', style: 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400' };
    return { label: 'Élevé', color: 'text-red-600', style: 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400' };
  }
}
