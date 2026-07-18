import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './change-password.html',
})
export class ChangePasswordComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  currentPw = signal('');
  newPw = signal('');
  confirmPw = signal('');
  showNewPw = signal(false);
  loading = signal(false);
  error = signal('');

  get isNewPwValid(): boolean {
    const pw = this.newPw();
    return pw.length >= 8 && /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /[0-9]/.test(pw);
  }

  onSubmit() {
    this.error.set('');
    if (!this.currentPw() || !this.newPw() || !this.confirmPw()) {
      this.error.set('Veuillez remplir tous les champs.');
      return;
    }
    if (this.newPw() !== this.confirmPw()) {
      this.error.set('Les mots de passe ne correspondent pas.');
      return;
    }
    if (!this.isNewPwValid) {
      this.error.set('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre.');
      return;
    }

    this.loading.set(true);
    const user = this.auth.currentUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    this.auth.changePassword(user.id, this.currentPw(), this.newPw()).subscribe({
      next: () => {
        this.loading.set(false);
        this.toast.show('Mot de passe modifié. Votre compte est maintenant actif.', 'success');
        const route = user.role === 'CLIENT' ? '/client/dashboard' : '/dashboard';
        this.router.navigate([route]);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Erreur lors du changement de mot de passe.');
      },
    });
  }
}
