import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PretApiResponse } from './loan-request.service';

export interface DemandeScoringRequest {
  idPret: number;
  idClient: number;
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

@Injectable({ providedIn: 'root' })
export class ScoringService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/prets`;

  calculerScore(request: DemandeScoringRequest): Observable<PretApiResponse> {
    return this.http.post<PretApiResponse>(`${this.apiUrl}/enregistrer-score`, request);
  }
}
