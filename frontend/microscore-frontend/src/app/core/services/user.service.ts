import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

import { User, UserRequest, ClientUser, AdminUser, GestionnaireUser } from '../models/user.model';
import { Page } from '../models/page.model';

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
    this.getAllPaginated(0, 100).subscribe({
      next: (data) => this.users.set(data.content),
    });
  }

  // ==========================================
  // 2. MÉTHODES EXISTANTES (CONSERVÉES)
  // ==========================================
  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getAllPaginated(page: number = 0, size: number = 10): Observable<Page<User>> {
    return this.http.get<Page<User>>(`${this.apiUrl}?page=${page}&size=${size}`);
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
  getClients(page: number = 0, size: number = 10): Observable<Page<ClientUser>> {
    return this.http.get<Page<ClientUser>>(`${this.apiUrl}?role=CLIENT&page=${page}&size=${size}`);
  }

  getGestionnaires(page: number = 0, size: number = 10): Observable<Page<GestionnaireUser>> {
    return this.http.get<Page<GestionnaireUser>>(`${this.apiUrl}?role=GESTIONNAIRE&page=${page}&size=${size}`);
  }

  getAdmins(page: number = 0, size: number = 10): Observable<Page<AdminUser>> {
    return this.http.get<Page<AdminUser>>(`${this.apiUrl}?role=ADMIN&page=${page}&size=${size}`);
  }

  /**
   * Permet de modifier à la volée le statut d'un utilisateur (Activer / Bloquer)
   */
  updateUserStatus(id: string | number, status: 'ACTIF' | 'BLOQUE', motif?: string): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}/status`, { status, motif });
  }

  /**
   * Déclencheur de session (Optionnel mais recommandé)
   * Permet d'alimenter instantanément ton pointeur au moment de l'authentification
   */
  setCurrentUser(user: User): void {
    this.currentUser.set(user);
  }
}