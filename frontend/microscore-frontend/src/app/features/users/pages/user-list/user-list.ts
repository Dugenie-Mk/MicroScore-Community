import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ViewChild } from '@angular/core';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal';

function generateTempPassword(): string {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const all = upper + lower + digits;
  let pw = '';
  pw += upper[Math.floor(Math.random() * upper.length)];
  pw += lower[Math.floor(Math.random() * lower.length)];
  pw += digits[Math.floor(Math.random() * digits.length)];
  for (let i = 0; i < 6; i++) pw += all[Math.floor(Math.random() * all.length)];
  return pw.split('').sort(() => Math.random() - 0.5).join('');
}

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
  imports: [CommonModule, RouterLink, FormsModule, ConfirmModalComponent],
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
  currentPage = signal(0);
  totalPages = signal(0);
  totalElements = signal(0);

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
      total: this.totalElements(),
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
  @ViewChild('confirmModal') protected confirmModal!: ConfirmModalComponent;

  generatedPassword = signal('');
  showPassword = signal(false);

  newUser = signal({
    fullName: '',
    email: '',
    telephone: '',
    role: 'CLIENT' as 'CLIENT' | 'GESTIONNAIRE' | 'ADMIN',
    cni: '',
    matricule: '',
    dateNaissance: '',
    lieuNaissance: '',
    situationMatrimoniale: '',
    niveauEducation: '',
    personnesACharge: 0,
    sexe: '',
    revenu: 0,
    profession: '',
    secteurActivite: '',
  });

  setRole(role: string) {
    this.newUser.set({ ...this.newUser(), role: role as 'CLIENT' | 'GESTIONNAIRE' | 'ADMIN' });
  }

  openCreateModal() {
    this.newUser.set({
      fullName: '', email: '', telephone: '', role: 'CLIENT',
      cni: '', matricule: '', dateNaissance: '', lieuNaissance: '',
      situationMatrimoniale: '', niveauEducation: '', personnesACharge: 0,
      sexe: '', revenu: 0,
      profession: '', secteurActivite: '',
    });
    this.generatedPassword.set('');
    this.showPassword.set(false);
    this.showCreateModal.set(true);
    this.menuOpenId.set(null);
  }

  closeCreateModal() {
    this.showCreateModal.set(false);
    this.generatedPassword.set('');
    this.showPassword.set(false);
  }

  copyPassword() {
    navigator.clipboard.writeText(this.generatedPassword());
    this.toast.show('Mot de passe copié !', 'success');
  }

  createUser() {
    const form = this.newUser();
    if (!form.fullName.trim() || !form.email.trim()) return;

    const tempPw = generateTempPassword();
    this.generatedPassword.set(tempPw);

    this.userService.create({
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      motDePasse: tempPw,
      telephone: form.telephone.trim() || undefined,
      role: form.role,
      cni: form.cni.trim() || undefined,
      matricule: form.matricule.trim() || undefined,
      mustChangePassword: true,
      dateNaissance: form.dateNaissance || undefined,
      lieuNaissance: form.lieuNaissance || undefined,
      situationMatrimoniale: form.situationMatrimoniale || undefined,
      niveauEducation: form.niveauEducation || undefined,
      personnesACharge: form.personnesACharge > 0 ? form.personnesACharge : undefined,
      sexe: form.sexe || undefined,
      revenu: form.revenu > 0 ? form.revenu : undefined,
      profession: form.profession || undefined,
      secteurActivite: form.secteurActivite || undefined,
    }).subscribe({
      next: () => {
        this.showPassword.set(true);
        this.loadUsers();
      },
      error: (err) => {
        const msg = err.error?.message || err.message || 'Erreur lors de la création. Vérifiez que le backend est en cours d\'exécution.';
        this.toast.show(msg, 'error');
        this.generatedPassword.set('');
      },
    });
  }

  constructor() {
    this.loadUsers(0);
  }

  private loadUsers(page: number = 0) {
    this.userService.getAllPaginated(page, 10).subscribe({
      next: (data) => {
        this.allUsers.set(data.content);
        this.currentPage.set(data.number);
        this.totalPages.set(data.totalPages);
        this.totalElements.set(data.totalElements);
      },
    });
  }

  goToPage(page: number) {
    if (page < 0 || page >= this.totalPages()) return;
    this.loadUsers(page);
  }

  get pages(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const maxVisible = 5;
    if (total <= maxVisible) return Array.from({ length: total }, (_, i) => i);
    const start = Math.max(0, current - Math.floor(maxVisible / 2));
    const end = Math.min(total, start + maxVisible);
    return Array.from({ length: end - start }, (_, i) => start + i);
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

  async toggleStatus(user: UserData) {
    if (user.statut === 'BLOQUE') {
      const confirmed = await this.confirmModal.open({
        title: 'Débloquer l\'utilisateur',
        message: `Êtes-vous sûr de vouloir débloquer ${user.fullName} ?`,
        confirmLabel: 'Débloquer',
        type: 'warning',
      });
      if (!confirmed) return;
      this.userService.updateUserStatus(user.id, 'ACTIF').subscribe({
        next: () => {
          this.loadUsers();
          this.menuOpenId.set(null);
          this.toast.show(`${user.fullName} a été débloqué.`, 'success');
        },
        error: () => this.toast.show('Erreur lors du déblocage.', 'error'),
      });
      return;
    }

    const motif = await this.confirmModal.open({
      title: 'Bloquer l\'utilisateur',
      message: `Êtes-vous sûr de vouloir bloquer ${user.fullName} ?`,
      confirmLabel: 'Bloquer',
      type: 'danger',
      promptLabel: 'Motif du blocage',
      promptPlaceholder: 'Raison du blocage...',
    });
    if (!motif || typeof motif !== 'string' || !motif.trim()) return;

    this.userService.updateUserStatus(user.id, 'BLOQUE', motif.trim()).subscribe({
      next: () => {
        this.loadUsers();
        this.menuOpenId.set(null);
        this.toast.show(`${user.fullName} a été bloqué.`, 'warning');
      },
      error: () => this.toast.show('Erreur lors du blocage.', 'error'),
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
