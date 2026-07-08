import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './client-dashboard.html',
})
export class ClientDashboard {
  protected readonly auth = inject(AuthService);
  protected readonly user = computed(() => this.auth.currentUser());

  protected readonly stats = {
    pretsActifs: 1,
    montantTotal: 500000,
    rembourse: 525000,
    reste: 0,
    score: 81,
    procheEcheance: 0,
  };

  protected readonly progressPct = computed(() =>
    this.stats.montantTotal > 0
      ? Math.min(100, Math.round((this.stats.rembourse / this.stats.montantTotal) * 100))
      : 0
  );

  protected readonly recentActivity = [
    { type: 'pret', label: 'Prêt approuvé', detail: 'Achat Matériel — 500 000 FCFA', date: '10 Jan 2026' },
    { type: 'remboursement', label: 'Remboursement effectué', detail: '525 000 FCFA — Virement', date: '10 Mar 2026' },
    { type: 'alerte', label: 'Échéance à venir', detail: 'Prochain paiement dans 15 jours', date: '25 Juin 2026' },
  ];
}
