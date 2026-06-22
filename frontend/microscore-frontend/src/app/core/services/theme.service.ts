import { Injectable, effect, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'microscore-theme';

  readonly darkMode = signal<boolean>(this.getInitialPreference());

  constructor() {
    effect(() => this.applyTheme(this.darkMode()));
  }

  toggle(): void {
    this.darkMode.update((value) => !value);
  }

  private getInitialPreference(): boolean {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      return stored === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private applyTheme(dark: boolean): void {
    const root = document.documentElement;
    root.classList.add('theme-transition');
    root.classList.toggle('dark', dark);
    localStorage.setItem(this.storageKey, dark ? 'dark' : 'light');
  }
}
