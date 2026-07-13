import { Injectable, signal } from '@angular/core';

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

@Injectable({ providedIn: 'root' })
export class LoanRequestService {
  readonly loanRequests = signal<LoanRequestItem[]>([
    { id: 1, clientId: 1, clientNom: 'Prunelle T.', motif: 'Commerce', montant: 350000, score: 72, date: '20/05/2026', duree: '4 mois', statut: 'EN_ATTENTE' },
    { id: 2, clientId: 2, clientNom: 'Jules M.', motif: 'Achat Matériel', montant: 500000, score: 85, date: '10/01/2026', duree: '6 mois', statut: 'APPROUVE' },
    { id: 3, clientId: 5, clientNom: 'Paul T.', motif: 'Rénovation Habitat', montant: 200000, score: 45, date: '05/04/2026', duree: '3 mois', statut: 'REJETE' },
    { id: 4, clientId: 1, clientNom: 'Prunelle T.', motif: 'Équipement Agricole', montant: 450000, score: 68, date: '25/03/2026', duree: '5 mois', statut: 'EN_ATTENTE' },
    { id: 5, clientId: 2, clientNom: 'Jules M.', motif: 'Frais Scolaires', montant: 300000, score: 78, date: '15/02/2026', duree: '3 mois', statut: 'APPROUVE' },
    { id: 6, clientId: 6, clientNom: 'Marie K.', motif: 'Santé', montant: 150000, score: 55, date: '01/06/2026', duree: '2 mois', statut: 'EN_ATTENTE' },
    { id: 7, clientId: 5, clientNom: 'Paul T.', motif: 'Véhicule', montant: 800000, score: 42, date: '12/03/2026', duree: '12 mois', statut: 'REJETE' },
    { id: 8, clientId: 6, clientNom: 'Marie K.', motif: 'Formation', montant: 100000, score: 60, date: '20/06/2026', duree: '2 mois', statut: 'EN_ATTENTE' },
  ]);

  updateStatus(id: number, newStatus: 'APPROUVE' | 'REJETE'): void {
    this.loanRequests.update((items) =>
      items.map((r) => (r.id === id ? { ...r, statut: newStatus } : r))
    );
  }

  getByClientId(clientId: number): LoanRequestItem[] {
    return this.loanRequests().filter((r) => r.clientId === clientId);
  }
}
