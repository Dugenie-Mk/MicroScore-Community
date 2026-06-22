import { Component, inject, signal } from '@angular/core';

import { DashboardService } from '../../core/services/dashboard.service';
import { LoanStatus } from '../../core/models/dashboard.model';
import { AreaChart } from '../../shared/components/charts/area-chart';
import { BarChart } from '../../shared/components/charts/bar-chart';
import { RadialGauge } from '../../shared/components/charts/radial-gauge';

@Component({
  selector: 'app-dashboard',
  imports: [AreaChart, BarChart, RadialGauge],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly dashboardService = inject(DashboardService);

  protected readonly kpis = signal(this.dashboardService.getKpis());
  protected readonly loanRequests = signal(this.dashboardService.getLoanRequests());
  protected readonly activity = signal(this.dashboardService.getRecentActivity());
  protected readonly notifications = signal(this.dashboardService.getNotifications());
  protected readonly disbursements = signal(this.dashboardService.getMonthlyDisbursements());
  protected readonly repaymentTrend = signal(this.dashboardService.getRepaymentTrend());
  protected readonly monthlyTarget = signal(this.dashboardService.getMonthlyTarget());
  protected readonly riskBands = signal(this.dashboardService.getRiskDistribution());

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
      case 'EN_COURS':
        return 'En cours';
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
      case 'EN_COURS':
        return 'bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-400';
    }
  }

  protected scoreColor(score: number): string {
    if (score >= 70) return 'text-brand-600 dark:text-brand-400';
    if (score >= 50) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  }

  protected toneBar(tone: 'brand' | 'amber' | 'red'): string {
    switch (tone) {
      case 'brand':
        return 'bg-brand-500';
      case 'amber':
        return 'bg-amber-500';
      case 'red':
        return 'bg-red-500';
    }
  }
}
