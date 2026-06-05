import { Injectable } from '@angular/core';

// SERVICE d'AUTHENTIFICATION : gere le token JWT (a brancher sur l'API plus tard).
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'microscore_token';

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }
}
