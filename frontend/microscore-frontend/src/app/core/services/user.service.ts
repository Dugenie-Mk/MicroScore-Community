import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

import { User, UserRequest, ClientUser, AdminUser, GestionnaireUser } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/users`;

  // ==========================================
  // 1. LE POINTEUR CENTRAL (SIGNALS)
  // ==========================================
  // Ce pointeur stockera en temps réel l'utilisateur connecté dans l'application
  currentUser = signal<User | null>(null);

  /** Liste complète des utilisateurs (alimentée au démarrage) */
  readonly users = signal<User[]>([]);

  constructor() {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.getAll().subscribe({
      next: (data) => this.users.set(data),
    });
  }

  // ==========================================
  // 2. MÉTHODES EXISTANTES (CONSERVÉES)
  // ==========================================
  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}?_t=${Date.now()}`);
  }

  create(payload: UserRequest): Observable<User> {
    return this.http.post<User>(this.apiUrl, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  update(id: number, data: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}`, data);
  }

  // ==========================================
  // 3. SIGNAL DE RAFRAÎCHISSEMENT
  // ==========================================
  /** Incrementé pour notifier les composants qu'un rechargement est nécessaire */
  readonly refreshTrigger = signal(0);

  // ==========================================
  // 4. NOUVELLES FONCTIONNALITÉS REQUISES
  // ==========================================

  /**
   * Récupère la liste filtrée des clients
   */
  getClients(): Observable<ClientUser[]> {
    return this.http.get<ClientUser[]>(`${this.apiUrl}?role=CLIENT`);
  }

  /**
   * Récupère la liste filtrée des gestionnaires
   */
  getGestionnaires(): Observable<GestionnaireUser[]> {
    return this.http.get<GestionnaireUser[]>(`${this.apiUrl}?role=GESTIONNAIRE`);
  }

  /**
   * Récupère la liste filtrée des administrateurs
   */
  getAdmins(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.apiUrl}?role=ADMIN`);
  }

  /**
   * Permet de modifier à la volée le statut d'un utilisateur (Activer / Bloquer)
   */
  updateUserStatus(id: string | number, status: 'ACTIF' | 'BLOQUE'): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}/status`, { status });
  }

  /**
   * Déclencheur de session (Optionnel mais recommandé)
   * Permet d'alimenter instantanément ton pointeur au moment de l'authentification
   */
  setCurrentUser(user: User): void {
    this.currentUser.set(user);
  }
}