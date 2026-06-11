import { Injectable } from '@angular/core';

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
  getKpis(): KpiCard[] {
    return [
      {
        label: 'Membres actifs',
        value: '1 248',
        hint: 'sur 1 530 inscrits',
        trend: 4.2,
        icon: 'users',
        accent: 'brand',
      },
      {
        label: 'Montant deboursé',
        value: '18,4 M FCFA',
        hint: 'ce trimestre',
        trend: 7.8,
        icon: 'cash',
        accent: 'sky',
      },
      {
        label: 'Demandes en attente',
        value: '23',
        hint: 'à valider',
        trend: -1.5,
        icon: 'document',
        accent: 'amber',
      },
      {
        label: 'Taux de remboursement',
        value: '92,6 %',
        hint: 'sur 12 mois',
        trend: 1.1,
        icon: 'check',
        accent: 'violet',
      },
    ];
  }

  getCreditScore(): CreditScore {
    return {
      value: 74,
      category: 'Risque faible',
      updatedAt: 'Mis à jour aujourd\'hui',
    };
  }

  getLoanRequests(): LoanRequest[] {
    return [
      {
        id: 'PR-1042',
        clientName: 'Awa Ngono',
        amount: 250000,
        score: 81,
        status: 'EN_ATTENTE',
        date: '11 juin 2026',
      },
      {
        id: 'PR-1041',
        clientName: 'Boris Talla',
        amount: 500000,
        score: 67,
        status: 'EN_ATTENTE',
        date: '10 juin 2026',
      },
      {
        id: 'PR-1039',
        clientName: 'Mireille Foka',
        amount: 120000,
        score: 88,
        status: 'APPROUVE',
        date: '09 juin 2026',
      },
      {
        id: 'PR-1037',
        clientName: 'Jean-Paul Mbida',
        amount: 750000,
        score: 41,
        status: 'REJETE',
        date: '08 juin 2026',
      },
      {
        id: 'PR-1035',
        clientName: 'Sandrine Eyenga',
        amount: 300000,
        score: 73,
        status: 'EN_COURS',
        date: '06 juin 2026',
      },
    ];
  }

  getRecentActivity(): ActivityItem[] {
    return [
      {
        id: 'a1',
        title: 'Remboursement reçu',
        description: 'Sandrine Eyenga — échéance 3/12 (35 000 FCFA)',
        time: 'Il y a 12 min',
        type: 'repayment',
      },
      {
        id: 'a2',
        title: 'Nouvelle demande de prêt',
        description: 'Awa Ngono — 250 000 FCFA',
        time: 'Il y a 1 h',
        type: 'loan',
      },
      {
        id: 'a3',
        title: 'Score recalculé',
        description: 'Boris Talla — nouveau score : 67/100',
        time: 'Il y a 3 h',
        type: 'score',
      },
      {
        id: 'a4',
        title: 'Compte validé',
        description: 'Mireille Foka — compte client activé',
        time: 'Hier',
        type: 'account',
      },
    ];
  }

  getMonthlyDisbursements(): ChartPoint[] {
    return [
      { label: 'Jan', value: 9.2 },
      { label: 'Fév', value: 11.4 },
      { label: 'Mar', value: 8.7 },
      { label: 'Avr', value: 13.1 },
      { label: 'Mai', value: 15.6 },
      { label: 'Jun', value: 18.4 },
      { label: 'Jul', value: 14.2 },
      { label: 'Aoû', value: 16.9 },
      { label: 'Sep', value: 12.5 },
      { label: 'Oct', value: 17.3 },
      { label: 'Nov', value: 19.8 },
      { label: 'Déc', value: 21.2 },
    ];
  }

  getRepaymentTrend(): TrendSeries[] {
    return [
      {
        name: 'Décaissé',
        color: 'sky',
        values: [40, 52, 48, 61, 70, 78, 72, 80, 68, 84, 90, 96],
      },
      {
        name: 'Remboursé',
        color: 'brand',
        values: [30, 44, 41, 55, 63, 72, 69, 76, 64, 79, 85, 92],
      },
    ];
  }

  getMonthlyTarget(): MonthlyTarget {
    return {
      percent: 76,
      target: '24 M FCFA',
      achieved: '18,4 M FCFA',
      comment: 'Vous avez décaissé 18,4 M FCFA ce mois-ci, soit 12 % de plus que le mois dernier. Maintenez le cap !',
    };
  }

  getRiskDistribution(): RiskBand[] {
    return [
      { label: 'Risque faible', count: 742, percent: 59, tone: 'brand' },
      { label: 'Risque moyen', count: 386, percent: 31, tone: 'amber' },
      { label: 'Risque élevé', count: 120, percent: 10, tone: 'red' },
    ];
  }

  getNotifications(): NotificationItem[] {
    return [
      {
        id: 'n1',
        message: '3 échéances arrivent à terme dans 7 jours.',
        time: 'Aujourd\'hui',
        level: 'warning',
      },
      {
        id: 'n2',
        message: 'Le rapport mensuel de scoring est disponible.',
        time: 'Hier',
        level: 'info',
      },
      {
        id: 'n3',
        message: '2 nouveaux comptes clients ont été validés.',
        time: 'Il y a 2 j',
        level: 'success',
      },
    ];
  }
}
