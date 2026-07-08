import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

interface DemoAccount {
  label: string;
  email: string;
  password: string;
  role: string;
}

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly showPassword = signal(false);
  protected readonly loading = signal(false);
  protected readonly error = signal('');

  protected readonly demoAccounts: DemoAccount[] = [
    { label: 'Simo Benoît (Admin)', email: 'simo.b@microscore.cm', password: 'admin123', role: 'Admin' },
    { label: 'Djoko Arielle (Admin)', email: 'arielle.d@microscore.cm', password: 'admin123', role: 'Admin' },
    { label: 'Nana Djibril (Gestionnaire)', email: 'nana.d@microscore.cm', password: 'gest123', role: 'Gestionnaire' },
    { label: 'Eyanga Rachel (Gestionnaire)', email: 'rachel.e@microscore.cm', password: 'gest123', role: 'Gestionnaire' },
    { label: 'Kambou Prunelle (Client)', email: 'prunelle@gmail.com', password: 'client123', role: 'Client' },
    { label: 'Anafack Jules (Client)', email: 'jules@gmail.com', password: 'client123', role: 'Client' },
    { label: 'Tchinda Paul (Client)', email: 'paul.t@email.com', password: 'client123', role: 'Client' },
  ];

  protected readonly demoOpen = signal(false);

  protected toggleDemo(): void {
    this.demoOpen.update((v) => !v);
  }

  protected selectDemo(account: DemoAccount): void {
    this.email.set(account.email);
    this.password.set(account.password);
    this.demoOpen.set(false);
  }

  protected togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  protected onSubmit(): void {
    this.error.set('');

    if (!this.email() || !this.password()) {
      this.error.set('Veuillez renseigner votre email et votre mot de passe.');
      return;
    }

    this.loading.set(true);

    this.auth.login(this.email(), this.password()).subscribe((user) => {
      this.loading.set(false);
      if (!user) {
        this.error.set('Email ou mot de passe incorrect.');
        return;
      }
      const route = user.role === 'CLIENT' ? '/client/dashboard' : '/dashboard';
      this.router.navigate([route]);
    });
  }
}
