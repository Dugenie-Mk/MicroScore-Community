import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface DocumentInfo {
  type: 'CNI' | 'PASSEPORT' | 'CARTE_RESIDENCE';
  numero: string;
  fichierNom?: string;
  statut?: 'AJOUTE' | 'EN_ATTENTE' | 'MANQUANT';
}

export interface ScoringCritere {
  critere: string;
  poids: number;
  pourcentageObtenu: number;
}

export interface ClientScoring {
  scoreTotal: number;
  criteres: ScoringCritere[];
}

export interface AuthUser {
  id: number;
  email: string;
  fullName: string;
  role: 'CLIENT' | 'GESTIONNAIRE' | 'ADMIN';
  telephone?: string;
  cni?: string;
  matricule?: string;
  dateNaissance?: string;
  sexe?: string;
  situationMatrimoniale?: string;
  profession?: string;
  secteurActivite?: string;
  documents?: DocumentInfo[];
  scoring?: ClientScoring;
}

interface MockUser extends AuthUser {
  password: string;
}

const MOCK_USERS: MockUser[] = [
  {
    id: 1, email: 'prunelle@gmail.com', password: 'client123',
    fullName: 'Kambou Prunelle', role: 'CLIENT', telephone: '+237 600 000 001',
    cni: 'CM-2026-KP', dateNaissance: '12/05/1995', sexe: 'Masculin',
    situationMatrimoniale: 'Célibataire', profession: 'Commerçant',
    secteurActivite: 'Commerce',
    documents: [
      { type: 'CNI', numero: 'CM-2026-KP', fichierNom: 'cni_prunelle.pdf', statut: 'AJOUTE' },
      { type: 'PASSEPORT', numero: 'PA-CM-2024-12345', fichierNom: 'passeport_prunelle.pdf', statut: 'AJOUTE' },
      { type: 'CARTE_RESIDENCE', numero: '', statut: 'MANQUANT' },
    ],
    scoring: {
      scoreTotal: 81,
      criteres: [
        { critere: 'Profil sociodémographique', poids: 20, pourcentageObtenu: 18 },
        { critere: 'Capacité de remboursements', poids: 35, pourcentageObtenu: 30 },
        { critere: 'Historique de crédits', poids: 15, pourcentageObtenu: 12 },
        { critere: 'Activités économiques', poids: 15, pourcentageObtenu: 13 },
        { critere: 'Garanties et collatéraux', poids: 10, pourcentageObtenu: 6 },
        { critere: 'Facteurs comportementaux', poids: 5, pourcentageObtenu: 2 },
      ],
    },
  },
  {
    id: 2, email: 'jules@gmail.com', password: 'client123',
    fullName: 'Anafack Jules', role: 'CLIENT', telephone: '+237 699 999 999',
    cni: 'CM-2026-AJ', dateNaissance: '23/08/1995', sexe: 'Masculin',
    situationMatrimoniale: 'Marié', profession: 'Ingénieur',
    secteurActivite: 'Informatique',
    documents: [
      { type: 'CNI', numero: 'CM-2026-AJ', fichierNom: 'cni_jules.pdf', statut: 'AJOUTE' },
      { type: 'PASSEPORT', numero: 'PA-CM-2023-54321', fichierNom: 'passeport_jules.pdf', statut: 'AJOUTE' },
      { type: 'CARTE_RESIDENCE', numero: 'RES-DLA-2025-001', fichierNom: 'residence_jules.pdf', statut: 'AJOUTE' },
    ],
    scoring: {
      scoreTotal: 74,
      criteres: [
        { critere: 'Profil sociodémographique', poids: 20, pourcentageObtenu: 15 },
        { critere: 'Capacité de remboursements', poids: 35, pourcentageObtenu: 28 },
        { critere: 'Historique de crédits', poids: 15, pourcentageObtenu: 10 },
        { critere: 'Activités économiques', poids: 15, pourcentageObtenu: 11 },
        { critere: 'Garanties et collatéraux', poids: 10, pourcentageObtenu: 7 },
        { critere: 'Facteurs comportementaux', poids: 5, pourcentageObtenu: 3 },
      ],
    },
  },
  {
    id: 5, email: 'paul.t@email.com', password: 'client123',
    fullName: 'Tchinda Paul', role: 'CLIENT', telephone: '+237 622 111 222',
    cni: 'CM-2026-TP', dateNaissance: '08/07/1990', sexe: 'Masculin',
    situationMatrimoniale: 'Marié', profession: 'Agriculteur',
    secteurActivite: 'Agriculture',
    documents: [
      { type: 'CNI', numero: 'CM-2026-TP', fichierNom: 'cni_paul.pdf', statut: 'AJOUTE' },
      { type: 'PASSEPORT', numero: '', statut: 'MANQUANT' },
      { type: 'CARTE_RESIDENCE', numero: '', statut: 'MANQUANT' },
    ],
    scoring: {
      scoreTotal: 62,
      criteres: [
        { critere: 'Profil sociodémographique', poids: 20, pourcentageObtenu: 12 },
        { critere: 'Capacité de remboursements', poids: 35, pourcentageObtenu: 22 },
        { critere: 'Historique de crédits', poids: 15, pourcentageObtenu: 8 },
        { critere: 'Activités économiques', poids: 15, pourcentageObtenu: 10 },
        { critere: 'Garanties et collatéraux', poids: 10, pourcentageObtenu: 5 },
        { critere: 'Facteurs comportementaux', poids: 5, pourcentageObtenu: 5 },
      ],
    },
  },
  { id: 6, email: 'nana.d@microscore.cm', password: 'gest123', fullName: 'Nana Djibril', role: 'GESTIONNAIRE', telephone: '+237 688 999 000', matricule: 'GST-2024-001' },
  { id: 7, email: 'rachel.e@microscore.cm', password: 'gest123', fullName: 'Eyanga Rachel', role: 'GESTIONNAIRE', telephone: '+237 677 888 999', matricule: 'GST-2024-002' },
  { id: 9, email: 'simo.b@microscore.cm', password: 'admin123', fullName: 'Simo Benoît', role: 'ADMIN', telephone: '+237 655 666 777' },
  { id: 10, email: 'arielle.d@microscore.cm', password: 'admin123', fullName: 'Djoko Arielle', role: 'ADMIN', telephone: '+237 622 333 444' },
];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'microscore_token';
  private readonly userKey = 'microscore_user';

  readonly currentUser = signal<AuthUser | null>(null);

  constructor() {
    this.restoreSession();
  }

  private restoreSession(): void {
    const token = this.getToken();
    if (!token) return;
    const stored = localStorage.getItem(this.userKey);
    if (stored) {
      try {
        this.currentUser.set(JSON.parse(stored));
      } catch {
        this.logout();
      }
    }
  }

  login(email: string, password: string): Observable<AuthUser | null> {
    const user = MOCK_USERS.find((u) => u.email === email && u.password === password) ?? null;
    if (!user) {
      return of(null).pipe(delay(600));
    }
    const safeUser: AuthUser = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      telephone: user.telephone,
      cni: user.cni,
      matricule: user.matricule,
      dateNaissance: user.dateNaissance,
      sexe: user.sexe,
      situationMatrimoniale: user.situationMatrimoniale,
      profession: user.profession,
      secteurActivite: user.secteurActivite,
      documents: user.documents,
      scoring: user.scoring,
    };
    const fakeToken = btoa(`${user.id}:${user.email}:${Date.now()}`);
    localStorage.setItem(this.tokenKey, fakeToken);
    localStorage.setItem(this.userKey, JSON.stringify(safeUser));
    this.currentUser.set(safeUser);
    return of(safeUser).pipe(delay(600));
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUser.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null && this.currentUser() !== null;
  }

  hasRole(role: AuthUser['role']): boolean {
    return this.currentUser()?.role === role;
  }

  updateProfile(data: Partial<AuthUser>): void {
    const current = this.currentUser();
    if (!current) return;
    const updated = { ...current, ...data };
    localStorage.setItem(this.userKey, JSON.stringify(updated));
    this.currentUser.set(updated);
  }
}
