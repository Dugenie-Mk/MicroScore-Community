import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../../../core/services/auth.service';
import { UserService } from '../../../../core/services/user.service';
import { ToastService } from '../../../../core/services/toast.service';
import { User } from '../../../../core/models/user.model';

type RoleFilter = 'TOUS' | 'CLIENT' | 'GESTIONNAIRE' | 'ADMIN';

interface UserData extends User {
  cni?: string;
  matricule?: string;
  derniereConnexion?: string;
}

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './user-list.html',
})
export class UserListComponent {
  private readonly auth = inject(AuthService);
  private readonly currentUser = computed(() => this.auth.currentUser());
  protected readonly isGestionnaire = computed(() => this.currentUser()?.role === 'GESTIONNAIRE');

  searchQuery = signal('');
  activeFilter = signal<RoleFilter>('TOUS');
  menuOpenId = signal<number | null>(null);
  showCreateModal = signal(false);
  readonly allFilters: { label: string; value: RoleFilter }[] = [
    { label: 'Tous', value: 'TOUS' },
    { label: 'Clients', value: 'CLIENT' },
    { label: 'Gestionnaires', value: 'GESTIONNAIRE' },
    { label: 'Administrateurs', value: 'ADMIN' },
  ];

  // Gestionnaire ne voit que les clients
  protected readonly filters = computed(() => {
    if (this.isGestionnaire()) {
      return [{ label: 'Clients', value: 'CLIENT' as const }];
    }
    return this.allFilters;
  });

  readonly allUsers = signal<UserData[]>([]);

  // ---- Filtered & sorted list ----
  filteredUsers = computed(() => {
    const search = this.searchQuery().toLowerCase().trim();
    const role = this.isGestionnaire() ? 'CLIENT' : this.activeFilter();
    return this.allUsers().filter((u) => {
      const matchesSearch =
        !search ||
        u.fullName.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search) ||
        (u.telephone?.includes(search) ?? false);
      const matchesRole = role === 'TOUS' || u.role === role;
      return matchesSearch && matchesRole;
    });
  });

  // ---- Stats cards ----
  stats = computed(() => {
    const users = this.allUsers();
    return {
      total: users.length,
      clients: users.filter(u => u.role === 'CLIENT').length,
      gestionnaires: users.filter(u => u.role === 'GESTIONNAIRE').length,
      admins: users.filter(u => u.role === 'ADMIN').length,
      actifs: users.filter(u => u.statut === 'ACTIF').length,
      bloques: users.filter(u => u.statut === 'BLOQUE').length,
      enAttente: users.filter(u => u.statut === 'EN_ATTENTE').length,
    };
  });

  // ---- Create user form ----
  private readonly userService = inject(UserService);
  private readonly toast = inject(ToastService);

  newUser = signal({
    fullName: '',
    email: '',
    telephone: '',
    role: 'CLIENT' as 'CLIENT' | 'GESTIONNAIRE' | 'ADMIN',
    cni: '',
    matricule: '',
  });

  setRole(role: string) {
    this.newUser.set({ ...this.newUser(), role: role as 'CLIENT' | 'GESTIONNAIRE' | 'ADMIN' });
  }

  openCreateModal() {
    this.newUser.set({ fullName: '', email: '', telephone: '', role: 'CLIENT', cni: '', matricule: '' });
    this.showCreateModal.set(true);
    this.menuOpenId.set(null);
  }

  closeCreateModal() {
    this.showCreateModal.set(false);
  }

  createUser() {
    const form = this.newUser();
    if (!form.fullName.trim() || !form.email.trim()) return;

    this.userService.create({
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      motDePasse: 'default123',
      telephone: form.telephone.trim() || undefined,
      role: form.role,
    }).subscribe({
      next: () => {
        this.toast.show('Utilisateur créé avec succès.', 'success');
        this.loadUsers();
        this.closeCreateModal();
      },
      error: (err) => {
        const msg = err.error?.message || err.message || 'Erreur lors de la création. Vérifiez que le backend est en cours d\'exécution.';
        this.toast.show(msg, 'error');
      },
    });
  }

  constructor() {
    this.loadUsers();
  }

  private loadUsers() {
    this.userService.getAll().subscribe({
      next: (data) => this.allUsers.set(data),
    });
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  setFilter(filter: RoleFilter) {
    this.activeFilter.set(filter);
    this.menuOpenId.set(null);
  }

  toggleMenu(id: number) {
    this.menuOpenId.set(this.menuOpenId() === id ? null : id);
  }

  toggleStatus(user: UserData) {
    const newStatus = user.statut === 'ACTIF' ? 'BLOQUE' : 'ACTIF';
    this.userService.updateUserStatus(user.id, newStatus).subscribe({
      next: () => {
        this.loadUsers();
        this.menuOpenId.set(null);
      },
    });
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'CLIENT':
        return 'bg-blue-50 text-blue-700 ring-blue-600/20';
      case 'GESTIONNAIRE':
        return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
      case 'ADMIN':
        return 'bg-purple-50 text-purple-700 ring-purple-600/20';
      default:
        return 'bg-gray-50 text-gray-700 ring-gray-600/20';
    }
  }

  getStatusBadgeClass(statut: string): string {
    switch (statut) {
      case 'ACTIF':
        return 'bg-green-50 text-green-700 ring-green-600/20';
      case 'BLOQUE':
        return 'bg-red-50 text-red-700 ring-red-600/20';
      case 'EN_ATTENTE':
        return 'bg-amber-50 text-amber-700 ring-amber-600/20';
      default:
        return 'bg-gray-50 text-gray-700 ring-gray-600/20';
    }
  }
}
