import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface EcheanceDto {
  id: number;
  idPret: number;
  numeroEcheance: number;
  capitalRembourse: number;
  interets: number;
  mensualite: number;
  capitalRestantDu: number;
  statut: 'EN_ATTENTE' | 'PAYE' | 'EN_RETARD';
  dateEcheancePrevue: string;
  datePaiement?: string;
}

export interface GrilleAmortissementResponse {
  idPret: number;
  montantEmprunte: number;
  dureeRemboursementMois: number;
  tauxAnnuel: number;
  tauxMensuel: number;
  capitalRembourseParEcheance: number;
  totalInterets: number;
  coutTotalCredit: number;
  echeances: EcheanceDto[];
}

@Injectable({ providedIn: 'root' })
export class RepaymentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/remboursements`;

  readonly refreshTrigger = signal(0);

  getAmortissementByPret(idPret: number): Observable<GrilleAmortissementResponse> {
    return this.http.get<GrilleAmortissementResponse>(`${this.apiUrl}/pret/${idPret}`);
  }

  payerEcheance(echeanceId: number): Observable<EcheanceDto> {
    return this.http.patch<EcheanceDto>(`${this.apiUrl}/echeances/${echeanceId}/payer`, {}).pipe(
      tap(() => this.refreshTrigger.update((v) => v + 1))
    );
  }

  payerEcheances(idPret: number, nombreMois: number): Observable<EcheanceDto[]> {
    return this.http.post<EcheanceDto[]>(`${this.apiUrl}/payer`, { idPret, nombreMois }).pipe(
      tap(() => this.refreshTrigger.update((v) => v + 1))
    );
  }

  marquerRetard(echeanceId: number): Observable<EcheanceDto> {
    return this.http.patch<EcheanceDto>(`${this.apiUrl}/echeances/${echeanceId}/retard`, {});
  }
}
