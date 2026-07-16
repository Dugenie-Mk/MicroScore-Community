import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-page.html',
})
export class ProfilePage {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly user = computed(() => this.auth.currentUser());

  protected readonly roleLabel = computed(() => {
    switch (this.user()?.role) {
      case 'ADMIN': return 'Administrateur';
      case 'GESTIONNAIRE': return 'Gestionnaire';
      default: return '—';
    }
  });

  protected readonly roleBadgeClass = computed(() => {
    switch (this.user()?.role) {
      case 'ADMIN': return 'bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-950/20 dark:text-violet-400';
      case 'GESTIONNAIRE': return 'bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-950/20 dark:text-sky-400';
      default: return 'bg-gray-50 text-gray-700';
    }
  });

  protected readonly isAdmin = computed(() => this.user()?.role === 'ADMIN');

  protected readonly now = new Date();
  protected readonly lastConnection = `${new Date().getHours()}h${String(new Date().getMinutes()).padStart(2, '0')}`;

  // Édition
  protected editing = signal(false);
  protected editForm = signal({ telephone: '' });

  protected startEditing(): void {
    const u = this.user();
    if (!u) return;
    this.editForm.set({ telephone: u.telephone || '' });
    this.editing.set(true);
  }

  protected cancelEditing(): void {
    this.editing.set(false);
  }

  protected saveProfile(): void {
    const form = this.editForm();
    this.auth.updateProfile({ telephone: form.telephone || undefined });
    this.toast.show('Profil mis à jour', 'success');
    this.editing.set(false);
  }

  protected getInitials(): string {
    const u = this.user();
    if (!u) return '??';
    return u.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  protected logout(): void {
    this.auth.logout();
    this.toast.show('Vous êtes déconnecté', 'info');
    this.router.navigate(['/login']);
  }
}
