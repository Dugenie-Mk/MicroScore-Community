import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface AuthUser {
  id: number;
  email: string;
  fullName: string;
  role: 'CLIENT' | 'GESTIONNAIRE' | 'ADMIN';
  telephone?: string;
  cni?: string;
  matricule?: string;
}

interface MockUser extends AuthUser {
  password: string;
}

const MOCK_USERS: MockUser[] = [
  { id: 1, email: 'prunelle@gmail.com', password: 'client123', fullName: 'Kambou Prunelle', role: 'CLIENT', telephone: '+237 600 000 001', cni: 'CM-2026-KP' },
  { id: 2, email: 'jules@gmail.com', password: 'client123', fullName: 'Anafack Jules', role: 'CLIENT', telephone: '+237 699 999 999', cni: 'CM-2026-AJ' },
  { id: 5, email: 'paul.t@email.com', password: 'client123', fullName: 'Tchinda Paul', role: 'CLIENT', telephone: '+237 622 111 222', cni: 'CM-2026-TP' },
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
}
