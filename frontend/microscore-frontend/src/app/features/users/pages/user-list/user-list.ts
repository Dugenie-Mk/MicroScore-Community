import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../../../core/services/auth.service';

type RoleFilter = 'TOUS' | 'CLIENT' | 'GESTIONNAIRE' | 'ADMIN';

interface UserData {
  id: number;
  fullName: string;
  email: string;
  telephone: string;
  role: 'CLIENT' | 'GESTIONNAIRE' | 'ADMIN';
  statut: 'ACTIF' | 'BLOQUE' | 'EN_ATTENTE';
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
  currentPage = signal(1);
  pageSize = 6;

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
        u.telephone.includes(search);
      const matchesRole = role === 'TOUS' || u.role === role;
      return matchesSearch && matchesRole;
    });
  });

  // ---- Pagination ----
  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredUsers().length / this.pageSize)));

  paginatedUsers = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredUsers().slice(start, start + this.pageSize);
  });

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.menuOpenId.set(null);
    }
  }

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
  newUser = signal({
    fullName: '',
    email: '',
    telephone: '',
    role: 'CLIENT' as 'CLIENT' | 'GESTIONNAIRE' | 'ADMIN',
    cni: '',
    matricule: '',
  });

  private nextId = 12;

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

    const user: UserData = {
      id: this.nextId++,
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      telephone: form.telephone.trim() || '+237 XXX XXX XXX',
      role: form.role,
      statut: 'ACTIF',
    };

    if (form.role === 'CLIENT') user.cni = form.cni.trim() || `CM-${this.nextId}`;
    if (form.role === 'GESTIONNAIRE') user.matricule = form.matricule.trim() || `GST-${this.nextId}`;

    this.allUsers.update(list => [user, ...list]);
    this.currentPage.set(1);
    this.closeCreateModal();
  }

  constructor() {
    this.loadMockData();
  }

  private loadMockData() {
    this.allUsers.set([
      {
        id: 1, fullName: 'Kambou Prunelle', email: 'prunelle@gmail.com',
        telephone: '+237 600 000 001', role: 'CLIENT', statut: 'ACTIF', cni: 'CM-2026-KP',
      },
      {
        id: 2, fullName: 'Anafack Jules', email: 'jules@gmail.com',
        telephone: '+237 699 999 999', role: 'CLIENT', statut: 'ACTIF', cni: 'CM-2026-AJ',
      },
      {
        id: 3, fullName: 'Kuaté Édouard', email: 'edouard@gmail.com',
        telephone: '+237 677 777 777', role: 'CLIENT', statut: 'BLOQUE', cni: 'CM-2026-KE',
      },
      {
        id: 4, fullName: 'Mbiada Carine', email: 'carine.m@email.com',
        telephone: '+237 655 444 333', role: 'CLIENT', statut: 'EN_ATTENTE', cni: 'CM-2026-MC',
      },
      {
        id: 5, fullName: 'Tchinda Paul', email: 'paul.t@email.com',
        telephone: '+237 622 111 222', role: 'CLIENT', statut: 'ACTIF', cni: 'CM-2026-TP',
      },
      {
        id: 6, fullName: 'Nana Djibril', email: 'nana.d@microscore.cm',
        telephone: '+237 688 999 000', role: 'GESTIONNAIRE', statut: 'ACTIF', matricule: 'GST-2024-001',
      },
      {
        id: 7, fullName: 'Eyanga Rachel', email: 'rachel.e@microscore.cm',
        telephone: '+237 677 888 999', role: 'GESTIONNAIRE', statut: 'ACTIF', matricule: 'GST-2024-002',
      },
      {
        id: 8, fullName: 'Fotso Rodrigue', email: 'rodrigue.f@microscore.cm',
        telephone: '+237 699 777 888', role: 'GESTIONNAIRE', statut: 'BLOQUE', matricule: 'GST-2023-015',
      },
      {
        id: 9, fullName: 'Simo Benoît', email: 'simo.b@microscore.cm',
        telephone: '+237 655 666 777', role: 'ADMIN', statut: 'ACTIF', derniereConnexion: '08/07/2026 à 09:45',
      },
      {
        id: 10, fullName: 'Djoko Arielle', email: 'arielle.d@microscore.cm',
        telephone: '+237 622 333 444', role: 'ADMIN', statut: 'ACTIF', derniereConnexion: '07/07/2026 à 14:30',
      },
      {
        id: 11, fullName: 'Belinga Cyrille', email: 'cyrille.b@microscore.cm',
        telephone: '+237 688 555 666', role: 'ADMIN', statut: 'BLOQUE', derniereConnexion: '01/06/2026 à 11:00',
      },
    ]);
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
    this.currentPage.set(1);
    this.menuOpenId.set(null);
  }

  toggleMenu(id: number) {
    this.menuOpenId.set(this.menuOpenId() === id ? null : id);
  }

  toggleStatus(user: UserData) {
    this.allUsers.update((users) =>
      users.map((u) => {
        if (u.id === user.id) {
          return {
            ...u,
            statut: u.statut === 'ACTIF' ? 'BLOQUE' : 'ACTIF' as 'ACTIF' | 'BLOQUE',
          };
        }
        return u;
      })
    );
    this.menuOpenId.set(null);
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
