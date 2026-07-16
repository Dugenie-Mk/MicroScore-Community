import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

import { UserService } from './user.service';

export interface LoanRequestItem {
  id: number;
  clientId: number;
  clientNom: string;
  motif: string;
  montant: number;
  score: number;
  date: string;
  duree: string;
  statut: 'EN_ATTENTE' | 'APPROUVE' | 'REJETE';
}

export interface PretApiResponse {
  idPret: number;
  idClient: number;
  motif: string;
  montant: number;
  scoreTotal: number;
  dureeRemboursementMois: number;
  statut: 'EN_ATTENTE' | 'APPROUVE' | 'REJETE';
  dateEnregistrement: string;
  dateDecision?: string;
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
  private readonly userService = inject(UserService);
  private readonly apiUrl = `${environment.apiUrl}/api/prets`;

  readonly loanRequests = signal<LoanRequestItem[]>([]);

  constructor() {
    this.loadAll();
  }

  private mapPret(p: PretApiResponse): LoanRequestItem {
    return {
      id: p.idPret,
      clientId: p.idClient,
      clientNom: '',
      motif: p.motif || '',
      montant: p.montant,
      score: p.scoreTotal,
      date: p.dateEnregistrement ? p.dateEnregistrement.substring(0, 10) : '',
      duree: p.dureeRemboursementMois + ' mois',
      statut: p.statut,
    };
  }

  private loadAll(): void {
    this.http.get<PretApiResponse[]>(this.apiUrl).subscribe({
      next: (data) => {
        const items = data.map((p) => this.mapPret(p));
        this.loanRequests.set(items);
        for (const item of items) {
          if (item.clientId > 0) {
            this.userService.getById(item.clientId).subscribe({
              next: (user) => {
                this.loanRequests.update((list) =>
                  list.map((i) => (i.id === item.id ? { ...i, clientNom: user.fullName } : i))
                );
              },
            });
          }
        }
      },
      error: () => {},
    });
  }

  createLoan(payload: CreerPretPayload): Observable<PretApiResponse> {
    return this.http.post<PretApiResponse>(this.apiUrl, payload);
  }

  updateStatus(id: number, newStatus: 'APPROUVE' | 'REJETE'): void {
    this.http.patch<PretApiResponse>(`${this.apiUrl}/${id}/decision`, { statut: newStatus }).subscribe({
      next: () => this.loadAll(),
      error: () => {},
    });
  }

  getByClientId(clientId: number): Observable<PretApiResponse[]> {
    return this.http.get<PretApiResponse[]>(`${this.apiUrl}/client/${clientId}`);
  }

  getAllPrets(): Observable<PretApiResponse[]> {
    return this.http.get<PretApiResponse[]>(this.apiUrl);
  }
}
