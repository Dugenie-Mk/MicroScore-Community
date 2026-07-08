import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-client-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-profile.html',
})
export class ClientProfile {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly user = computed(() => this.auth.currentUser());

  protected getInitials(): string {
    const u = this.user();
    if (!u) return '??';
    return u.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  protected logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
