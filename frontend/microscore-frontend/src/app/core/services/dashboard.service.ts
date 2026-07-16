import { Injectable, inject, computed, signal } from '@angular/core';

import { LoanRequestService } from './loan-request.service';
import { UserService } from './user.service';

import {
  ActivityItem,
  ChartPoint,
  CreditScore,
  KpiCard,
  LoanRequest,
  MonthlyTarget,
  NotificationItem,
  RiskBand,
  TrendSeries,
} from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly loanService = inject(LoanRequestService);
  private readonly userService = inject(UserService);

  readonly kpis = computed<KpiCard[]>(() => {
    const users = this.userService.users();
    const prets = this.loanService.loanRequests();
    const actifs = users.filter((u) => u.role === 'CLIENT' && u.statut === 'ACTIF').length;
    const totalUsers = users.filter((u) => u.role === 'CLIENT').length;
    const enAttente = prets.filter((p) => p.statut === 'EN_ATTENTE').length;
    const approuves = prets.filter((p) => p.statut === 'APPROUVE').length;
    const totalMontant = prets.filter((p) => p.statut === 'APPROUVE').reduce((s, p) => s + p.montant, 0);
    const enCours = prets.filter((p) => p.statut === 'APPROUVE').length;
    const txRemb = enCours > 0 ? Math.round((approuves / Math.max(enCours, 1)) * 100) : 92;

    return [
      {
        label: 'Membres actifs',
        value: actifs.toLocaleString('fr-FR'),
        hint: `sur ${totalUsers} inscrits`,
        trend: 4.2,
        icon: 'users',
        accent: 'brand',
      },
      {
        label: 'Montant deboursé',
        value: (totalMontant / 1_000_000).toFixed(1).replace('.', ',') + ' M FCFA',
        hint: 'tous prêts approuvés',
        trend: 7.8,
        icon: 'cash',
        accent: 'sky',
      },
      {
        label: 'Demandes en attente',
        value: enAttente.toString(),
        hint: 'à valider',
        trend: -1.5,
        icon: 'document',
        accent: 'amber',
      },
      {
        label: 'Taux de remboursement',
        value: txRemb + ' %',
        hint: 'sur l\'ensemble',
        trend: 1.1,
        icon: 'check',
        accent: 'violet',
      },
    ];
  });

  readonly loanRequests = computed<LoanRequest[]>(() =>
    this.loanService.loanRequests().map((p) => ({
      id: 'PR-' + p.id,
      clientName: p.clientNom || 'Client #' + p.clientId,
      amount: p.montant,
      score: p.score,
      status: p.statut,
      date: p.date || '',
    }))
  );

  readonly recentActivity = signal<ActivityItem[]>([]);
  readonly notifications = signal<NotificationItem[]>([]);
  readonly disbursements = signal<ChartPoint[]>([]);
  readonly repaymentTrend = signal<TrendSeries[]>([]);
  readonly monthlyTarget = signal<MonthlyTarget | null>(null);
  readonly riskBands = signal<RiskBand[]>([]);
  readonly creditScore = signal<CreditScore>({
    value: 74,
    category: 'Risque faible',
    updatedAt: 'Mis à jour aujourd\'hui',
  });

  constructor() {
    this.loadFallbackData();
  }

  private loadFallbackData(): void {
    this.recentActivity.set([
      { id: 'a1', title: 'Remboursement reçu', description: 'Client — échéance reçue', time: 'Aujourd\'hui', type: 'repayment' as const },
      { id: 'a2', title: 'Nouvelle demande de prêt', description: 'Nouvelle demande enregistrée', time: 'Aujourd\'hui', type: 'loan' as const },
      { id: 'a3', title: 'Score recalculé', description: 'Mise à jour des scores', time: 'Aujourd\'hui', type: 'score' as const },
      { id: 'a4', title: 'Compte validé', description: 'Nouveau client activé', time: 'Hier', type: 'account' as const },
    ]);

    this.notifications.set([
      { id: 'n1', message: 'Échéances à venir dans 7 jours.', time: 'Aujourd\'hui', level: 'warning' as const },
      { id: 'n2', message: 'Rapport mensuel de scoring disponible.', time: 'Hier', level: 'info' as const },
      { id: 'n3', message: 'Nouveaux comptes clients validés.', time: 'Il y a 2 j', level: 'success' as const },
    ]);

    this.disbursements.set([
      { label: 'Jan', value: 9.2 }, { label: 'Fév', value: 11.4 }, { label: 'Mar', value: 8.7 },
      { label: 'Avr', value: 13.1 }, { label: 'Mai', value: 15.6 }, { label: 'Jun', value: 18.4 },
      { label: 'Jul', value: 14.2 }, { label: 'Aoû', value: 16.9 }, { label: 'Sep', value: 12.5 },
      { label: 'Oct', value: 17.3 }, { label: 'Nov', value: 19.8 }, { label: 'Déc', value: 21.2 },
    ]);

    this.repaymentTrend.set([
      { name: 'Décaissé', color: 'sky', values: [40, 52, 48, 61, 70, 78, 72, 80, 68, 84, 90, 96] },
      { name: 'Remboursé', color: 'brand', values: [30, 44, 41, 55, 63, 72, 69, 76, 64, 79, 85, 92] },
    ]);

    this.monthlyTarget.set({
      percent: 76, target: '24 M FCFA', achieved: '18,4 M FCFA',
      comment: 'Vous avez décaissé 18,4 M FCFA ce mois-ci.',
    });

    this.riskBands.set([
      { label: 'Risque faible', count: 742, percent: 59, tone: 'brand' },
      { label: 'Risque moyen', count: 386, percent: 31, tone: 'amber' },
      { label: 'Risque élevé', count: 120, percent: 10, tone: 'red' },
    ]);
  }
}
