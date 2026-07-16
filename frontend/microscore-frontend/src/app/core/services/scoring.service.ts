import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DemandeScoringRequest {
  clientId: number;
  age: number;
  situationMatrimoniale: string;
  niveauEducation: string;
  ancienneteResidenceMois: number;
  nombrePersonnesACharge: number;
  revenuMensuelNet: number;
  chargesFixes: number;
  fluxTresorerieActivite: number;
  montant: number;
  dureeRemboursementMois: number;
  nombreRetardsAnterieurs: number;
  nombrePretsEnCours: number;
  ancienneteClientMois: number;
  typeActivite?: string;
  ancienneteEntrepriseMois: number;
  chiffreAffairesMensuel: number;
  secteurActivite?: string;
  garantiePersonnelle?: boolean;
  garantieMaterielle?: boolean;
  epargneConstituee: number;
  noteMotivationEntretien: number;
  reputationCommunaute?: string;
  regulariteEpargne?: string;
}

export interface ScoreResponse {
  scoreId: number;
  pretId: number;
  clientId: number;
  scoreTotal: number;
  dateCalcul: string;
}

@Injectable({ providedIn: 'root' })
export class ScoringService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/scores`;

  calculerScore(pretId: number, request: DemandeScoringRequest): Observable<ScoreResponse> {
    return this.http.post<ScoreResponse>(`${this.apiUrl}/calculer/${pretId}`, request);
  }

  getScoreByPretId(pretId: number): Observable<ScoreResponse> {
    return this.http.get<ScoreResponse>(`${this.apiUrl}/pret/${pretId}`);
  }
}
