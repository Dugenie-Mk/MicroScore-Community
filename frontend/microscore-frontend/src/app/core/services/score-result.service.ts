import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { lastValueFrom } from 'rxjs';

export interface ScoreResponse {
  scoreId: number;
  pretId: number;
  clientId: number;
  scoreTotal: number;
  dateCalcul: string;
}

export interface CritereScore {
  nom: string;
  poids: number;
  points: number;
}

export interface BlocScore {
  bloc: string;
  label: string;
  totalBloc: number;
  scoreBloc: number;
  criteres: CritereScore[];
}

export interface ScoreDetailResponse {
  scoreId: number;
  pretId: number;
  clientId: number;
  scoreTotal: number;
  dateCalcul: string;
  blocs: BlocScore[];
}

@Injectable({ providedIn: 'root' })
export class ScoreResultService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/scores`;

  readonly scores = signal<ScoreResponse[]>([]);
  readonly selectedScore = signal<ScoreDetailResponse | null>(null);
  readonly clientScores = signal<ScoreResponse[]>([]);
  readonly clientLatestScore = signal<ScoreResponse | null>(null);
  readonly clientLatestDetail = signal<ScoreDetailResponse | null>(null);
  readonly loading = signal(false);

  async loadAll(): Promise<void> {
    this.loading.set(true);
    try {
      const data = await lastValueFrom(this.http.get<ScoreResponse[]>(this.apiUrl));
      this.scores.set(data);
    } catch {
      /* silencieux */
    } finally {
      this.loading.set(false);
    }
  }

  async loadDetails(scoreId: number): Promise<ScoreDetailResponse | null> {
    try {
      const data = await lastValueFrom(this.http.get<ScoreDetailResponse>(`${this.apiUrl}/${scoreId}/details`));
      this.selectedScore.set(data);
      return data;
    } catch {
      return null;
    }
  }

  async loadByClientId(clientId: number): Promise<void> {
    try {
      const data = await lastValueFrom(this.http.get<ScoreResponse[]>(`${this.apiUrl}/client/${clientId}`));
      this.clientScores.set(data);
    } catch {
      /* silencieux */
    }
  }

  async loadLatestByClientId(clientId: number): Promise<ScoreResponse | null> {
    try {
      const data = await lastValueFrom(this.http.get<ScoreResponse>(`${this.apiUrl}/client/${clientId}/latest`));
      this.clientLatestScore.set(data);
      return data;
    } catch {
      this.clientLatestScore.set(null);
      return null;
    }
  }

  async loadLatestDetailByClientId(clientId: number): Promise<ScoreDetailResponse | null> {
    try {
      const data = await lastValueFrom(this.http.get<ScoreDetailResponse>(`${this.apiUrl}/client/${clientId}/latest`));
      this.clientLatestDetail.set(data);
      return data;
    } catch {
      this.clientLatestDetail.set(null);
      return null;
    }
  }

  async loadDetailByPretId(pretId: number): Promise<ScoreDetailResponse | null> {
    try {
      const score = await lastValueFrom(this.http.get<ScoreResponse>(`${this.apiUrl}/pret/${pretId}`));
      return this.loadDetails(score.scoreId);
    } catch {
      return null;
    }
  }

  getScoreColor(score: number): string {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 60) return 'text-amber-600 dark:text-amber-400';
    if (score >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  }

  getScoreBarColor(score: number): string {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-amber-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  }

  getRiskLabel(score: number): string {
    if (score >= 80) return 'Faible risque';
    if (score >= 60) return 'Risque modéré';
    if (score >= 40) return 'Risque élevé';
    return 'Très risqué';
  }
}
