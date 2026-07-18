import { Injectable, inject, computed, signal } from '@angular/core';

import { LoanRequestService } from './loan-request.service';
import { UserService } from './user.service';
import { ScoreResultService } from './score-result.service';

import {
  KpiCard,
  LoanRequest,
} from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly loanService = inject(LoanRequestService);
  private readonly userService = inject(UserService);
  private readonly scoreService = inject(ScoreResultService);

  readonly kpis = computed<KpiCard[]>(() => {
    const users = this.userService.users();
    const prets = this.loanService.loanRequests();
    const actifs = users.filter((u) => u.role === 'CLIENT' && u.statut === 'ACTIF').length;
    const totalUsers = users.filter((u) => u.role === 'CLIENT').length;
    const enAttente = prets.filter((p) => p.statut === 'EN_ATTENTE').length;
    const approuves = prets.filter((p) => p.statut === 'APPROUVE').length;
    const rembourses = prets.filter((p) => p.statut === 'REMBOURSE').length;
    const totalMontant = prets.filter((p) => p.statut === 'APPROUVE').reduce((s, p) => s + p.montant, 0);
    const totalRembourse = prets.filter((p) => p.statut === 'REMBOURSE').reduce((s, p) => s + p.montant, 0);
    const tauxRemb = totalMontant > 0 ? Math.round((totalRembourse / totalMontant) * 100) : 0;

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
        value: tauxRemb + ' %',
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

  readonly creditScore = computed(() => {
    const scores = this.scoreService.scores();
    if (scores.length === 0) return { value: 0, category: 'Non disponible', updatedAt: '' };
    const avg = Math.round(scores.reduce((s, sc) => s + sc.scoreTotal, 0) / scores.length);
    const category = avg >= 80 ? 'Faible risque' : avg >= 60 ? 'Risque modéré' : avg >= 40 ? 'Risque élevé' : 'Très risqué';
    const lastDate = scores.length > 0 ? scores.map((s) => s.dateCalcul).sort().reverse()[0] : '';
    return { value: avg, category, updatedAt: lastDate ? new Date(lastDate).toLocaleDateString('fr-FR') : '' };
  });

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.loanService.refresh();
    this.scoreService.loadAll();
  }
}
