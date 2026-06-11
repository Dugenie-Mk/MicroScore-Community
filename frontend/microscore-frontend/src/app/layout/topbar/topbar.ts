import { Component, HostListener, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { LayoutService } from '../../core/services/layout.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-topbar',
  imports: [RouterLink],
  templateUrl: './topbar.html',
})
export class Topbar {
  protected readonly theme = inject(ThemeService);
  protected readonly layout = inject(LayoutService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly profileOpen = signal(false);

  protected toggleProfile(event: MouseEvent): void {
    event.stopPropagation();
    this.profileOpen.update((value) => !value);
  }

  protected closeProfile(): void {
    this.profileOpen.set(false);
  }

  @HostListener('document:click')
  protected onDocumentClick(): void {
    this.profileOpen.set(false);
  }

  protected logout(): void {
    this.closeProfile();
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
