import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';
import { LoanRequestService, PretApiResponse } from '../../../../core/services/loan-request.service';
import { ScoreResultService } from '../../../../core/services/score-result.service';
import { ToastService } from '../../../../core/services/toast.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './client-dashboard.html',
})
export class ClientDashboard implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly loanService = inject(LoanRequestService);
  private readonly scoreService = inject(ScoreResultService);
  private readonly toast = inject(ToastService);

  protected readonly user = computed(() => this.auth.currentUser());
  protected readonly loans = signal<PretApiResponse[]>([]);
  protected readonly loading = signal(true);

  protected readonly pretsActifs = computed(() =>
    this.loans().filter((p) => p.statut === 'EN_COURS' || p.statut === 'APPROUVE').length
  );

  protected readonly montantTotal = computed(() =>
    this.loans().filter((p) => p.statut === 'APPROUVE' || p.statut === 'EN_COURS' || p.statut === 'REMBOURSE')
      .reduce((s, p) => s + p.montant, 0)
  );

  protected readonly rembourse = computed(() =>
    this.loans().filter((p) => p.statut === 'REMBOURSE')
      .reduce((s, p) => s + p.montant, 0)
  );

  protected readonly reste = computed(() =>
    Math.max(0, this.montantTotal() - this.rembourse())
  );

  protected readonly progressPct = computed(() =>
    this.montantTotal() > 0
      ? Math.min(100, Math.round((this.rembourse() / this.montantTotal()) * 100))
      : 0
  );

  protected readonly clientScore = computed(() =>
    this.scoreService.clientLatestScore()?.scoreTotal ?? 0
  );

  protected readonly procheEcheance = computed(() =>
    this.loans().filter((p) => p.statut === 'EN_COURS').length
  );

  protected readonly recentActivity = computed(() =>
    this.loans().slice(0, 5).map((p) => ({
      type: p.statut === 'REMBOURSE' ? 'remboursement' as const : 'pret' as const,
      label: p.statut === 'REMBOURSE' ? 'Remboursement effectué' : 'Prêt ' + (p.statut === 'EN_ATTENTE' ? 'demandé' : p.statut === 'APPROUVE' ? 'approuvé' : 'en cours'),
      detail: `${p.motif || 'Prêt'} — ${(p.montant / 1000).toFixed(0)} 000 FCFA`,
      date: p.dateEnregistrement ? new Date(p.dateEnregistrement).toLocaleDateString('fr-FR') : '',
    }))
  );

  async ngOnInit(): Promise<void> {
    const uid = this.user()?.id;
    if (!uid) {
      this.loading.set(false);
      return;
    }
    try {
      const [loans] = await Promise.all([
        lastValueFrom(this.loanService.getByClientId(uid)),
        this.scoreService.loadLatestByClientId(uid),
      ]);
      this.loans.set(loans);
    } catch {
      this.toast.show('Erreur lors du chargement des données.', 'error');
    } finally {
      this.loading.set(false);
    }
  }
}
