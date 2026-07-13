import { Component, inject, signal, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './client-layout.html',
})
export class ClientLayout {
  protected readonly auth = inject(AuthService);
  protected readonly theme = inject(ThemeService);
  private readonly router = inject(Router);

  protected readonly mobileMenuOpen = signal(false);
  protected readonly profileOpen = signal(false);

  protected toggleMobileMenu(): void {
    this.mobileMenuOpen.update((v) => !v);
  }

  protected closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  protected toggleProfile(event: MouseEvent): void {
    event.stopPropagation();
    this.profileOpen.update((v) => !v);
  }

  @HostListener('document:click')
  protected onDocClick(): void {
    this.profileOpen.set(false);
  }

  protected getInitials(): string {
    const u = this.auth.currentUser();
    if (!u) return '??';
    return u.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  protected logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  protected readonly tabs = [
    { label: 'Accueil', route: '/client/dashboard', icon: 'home' },
    { label: 'Prêts', route: '/client/loans', icon: 'document' },
    { label: 'Remboursements', route: '/client/repayments', icon: 'repayment' },
    { label: 'Profil', route: '/client/profile', icon: 'user' },
  ] as const;
}
