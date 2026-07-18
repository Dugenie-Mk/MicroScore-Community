import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { ScoreResultService, ScoreResponse, ScoreDetailResponse } from '../../../../core/services/score-result.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-score-results-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './score-results-page.html',
})
export class ScoreResultsPage implements OnInit {
  private readonly auth = inject(AuthService);
  protected readonly service = inject(ScoreResultService);
  private readonly toast = inject(ToastService);

  protected readonly isAdmin = computed(() => this.auth.currentUser()?.role === 'ADMIN');

  protected selectedScoreId = signal<number | null>(null);
  protected detailData = signal<ScoreDetailResponse | null>(null);
  protected detailLoading = signal(false);

  ngOnInit(): void {
    this.service.loadAll();
  }

  protected readonly palette = [
    'bg-violet-500', 'bg-emerald-500', 'bg-amber-500', 'bg-blue-500',
    'bg-rose-500', 'bg-cyan-500', 'bg-orange-500',
  ];

  protected async selectScore(score: ScoreResponse): Promise<void> {
    if (this.selectedScoreId() === score.scoreId) {
      this.selectedScoreId.set(null);
      this.detailData.set(null);
      return;
    }
    this.selectedScoreId.set(score.scoreId);
    this.detailLoading.set(true);
    try {
      const data = await this.service.loadDetails(score.scoreId);
      this.detailData.set(data);
    } catch {
      this.toast.show('Erreur lors du chargement du détail du score.', 'error');
    } finally {
      this.detailLoading.set(false);
    }
  }

  protected scoreColor(total: number): string {
    return this.service.getScoreColor(total);
  }

  protected scoreBarColor(total: number): string {
    return this.service.getScoreBarColor(total);
  }

  protected riskLabel(total: number): string {
    return this.service.getRiskLabel(total);
  }

  protected formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}
