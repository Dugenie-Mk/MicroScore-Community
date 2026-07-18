import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserService } from './user.service';
import { User } from '../models/user.model';

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
  statut?: string;
  matricule?: string;
  dateNaissance?: string;
  sexe?: string;
  situationMatrimoniale?: string;
  profession?: string;
  secteurActivite?: string;
  documents?: DocumentInfo[];
  scoring?: ClientScoring;
  mustChangePassword?: boolean;
}

interface LoginResponse {
  token: string;
  user: AuthUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/auth`;
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

  login(email: string, motDePasse: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, motDePasse }).pipe(
      tap((res) => {
        localStorage.setItem(this.tokenKey, res.token);
        localStorage.setItem(this.userKey, JSON.stringify(res.user));
        this.currentUser.set(res.user);
      })
    );
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

  private readonly userService = inject(UserService);

  changePassword(userId: number, currentPassword: string, newPassword: string): Observable<AuthUser> {
    return this.http.patch<AuthUser>(`${environment.apiUrl}/api/users/${userId}/password`, {
      currentPassword,
      newPassword,
    }).pipe(
      tap((user) => {
        localStorage.setItem(this.userKey, JSON.stringify(user));
        this.currentUser.set(user);
      })
    );
  }

  updateProfile(data: Partial<AuthUser>): void {
    const current = this.currentUser();
    if (!current) return;
    const updated = { ...current, ...data };
    localStorage.setItem(this.userKey, JSON.stringify(updated));
    this.currentUser.set(updated);
    this.userService.refreshTrigger.update((v) => v + 1);
    this.userService.update(current.id, data as Partial<User>).subscribe();
  }
}
