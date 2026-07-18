import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Page } from '../models/page.model';

export interface LoanRequestItem {
  id: number;
  clientId: number;
  clientNom: string;
  motif: string;
  montant: number;
  score: number;
  date: string;
  duree: string;
  statut: 'EN_ATTENTE' | 'APPROUVE' | 'REJETE' | 'ANNULE' | 'EN_COURS' | 'REMBOURSE';
}

export interface PretApiResponse {
  idPret: number;
  idClient: number;
  clientNom?: string;
  motif: string;
  montant: number;
  scoreTotal: number;
  dureeRemboursementMois: number;
  statut: 'EN_ATTENTE' | 'APPROUVE' | 'REJETE' | 'ANNULE' | 'EN_COURS' | 'REMBOURSE';
  dateEnregistrement: string;
  dateDecision?: string;
  tauxInteret?: number;
  typeTaux?: string;
}

export interface CreerPretPayload {
  idClient: number;
  motif: string;
  montant: number;
  dureeRemboursementMois: number;
}

@Injectable({ providedIn: 'root' })
export class LoanRequestService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/prets`;

  readonly loanRequests = signal<LoanRequestItem[]>([]);

  private mapPret(p: PretApiResponse): LoanRequestItem {
    return {
      id: p.idPret,
      clientId: p.idClient,
      clientNom: p.clientNom || '',
      motif: p.motif || '',
      montant: p.montant,
      score: p.scoreTotal,
      date: p.dateEnregistrement ? p.dateEnregistrement.substring(0, 10) : '',
      duree: p.dureeRemboursementMois + ' mois',
      statut: p.statut,
    };
  }

  refresh(): void {
    this.getAllPrets().subscribe({
      next: (data) => this.loanRequests.set(data.map(this.mapPret)),
    });
  }

  createLoan(payload: CreerPretPayload): Observable<PretApiResponse> {
    return this.http.post<PretApiResponse>(this.apiUrl, payload);
  }

  updateStatus(id: number, newStatus: 'APPROUVE' | 'REJETE'): Observable<PretApiResponse> {
    return this.http.patch<PretApiResponse>(`${this.apiUrl}/${id}/decision`, { statut: newStatus });
  }

  getById(id: number): Observable<PretApiResponse> {
    return this.http.get<PretApiResponse>(`${this.apiUrl}/${id}`);
  }

  getByClientId(clientId: number): Observable<PretApiResponse[]> {
    return this.http.get<PretApiResponse[]>(`${this.apiUrl}/client/${clientId}`);
  }

  getByClientIdPaginated(clientId: number, page: number = 0, size: number = 10): Observable<Page<PretApiResponse>> {
    return this.http.get<Page<PretApiResponse>>(`${this.apiUrl}/client/${clientId}/paginated?page=${page}&size=${size}`);
  }

  getAllPrets(): Observable<PretApiResponse[]> {
    return this.http.get<PretApiResponse[]>(this.apiUrl);
  }

  cancelLoan(idPret: number, clientId: number): Observable<PretApiResponse> {
    return this.http.patch<PretApiResponse>(`${this.apiUrl}/${idPret}/annuler?clientId=${clientId}`, {});
  }

  deleteLoan(idPret: number, clientId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${idPret}?clientId=${clientId}`);
  }

  rechercherPrets(statut: string, motif: string, page: number, size: number, sort?: string, dir?: string, dateDebut?: string, dateFin?: string): Observable<Page<PretApiResponse>> {
    let url = `${this.apiUrl}/recherche?page=${page}&size=${size}`;
    if (statut && statut !== 'TOUS') url += `&statut=${statut}`;
    if (motif) url += `&motif=${encodeURIComponent(motif)}`;
    if (sort) url += `&sort=${sort},${dir || 'asc'}`;
    if (dateDebut) url += `&dateDebut=${dateDebut}`;
    if (dateFin) url += `&dateFin=${dateFin}`;
    return this.http.get<Page<PretApiResponse>>(url);
  }
}
