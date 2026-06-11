import { Injectable, effect, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  private readonly storageKey = 'microscore-sidebar-collapsed';

  readonly collapsed = signal<boolean>(localStorage.getItem(this.storageKey) === 'true');
  readonly mobileOpen = signal<boolean>(false);

  constructor() {
    effect(() => localStorage.setItem(this.storageKey, String(this.collapsed())));
  }

  toggleCollapsed(): void {
    this.collapsed.update((value) => !value);
  }

  openMobile(): void {
    this.mobileOpen.set(true);
  }

  closeMobile(): void {
    this.mobileOpen.set(false);
  }
}
