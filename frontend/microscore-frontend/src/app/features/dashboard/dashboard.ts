import { Component, inject } from '@angular/core';

import { DashboardService } from '../../core/services/dashboard.service';
import { LoanStatus } from '../../core/models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  protected readonly dashboardService = inject(DashboardService);

  protected formatAmount(value: number): string {
    return new Intl.NumberFormat('fr-FR').format(value) + ' FCFA';
  }

  protected statusLabel(status: LoanStatus): string {
    switch (status) {
      case 'EN_ATTENTE':
        return 'En attente';
      case 'APPROUVE':
        return 'Approuvé';
      case 'REJETE':
        return 'Rejeté';
      case 'ANNULE':
        return 'Annulé';
      case 'EN_COURS':
        return 'En cours';
      case 'REMBOURSE':
        return 'Remboursé';
    }
  }

  protected statusClasses(status: LoanStatus): string {
    switch (status) {
      case 'EN_ATTENTE':
        return 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400';
      case 'APPROUVE':
        return 'bg-brand-50 text-brand-700 ring-brand-600/20 dark:bg-brand-500/10 dark:text-brand-400';
      case 'REJETE':
        return 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400';
      case 'ANNULE':
        return 'bg-gray-50 text-gray-500 ring-gray-400/30 dark:bg-gray-800/20 dark:text-gray-500';
      case 'EN_COURS':
        return 'bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-400';
      case 'REMBOURSE':
        return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400';
    }
  }

  protected scoreColor(score: number): string {
    if (score >= 70) return 'text-brand-600 dark:text-brand-400';
    if (score >= 50) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  }
}
