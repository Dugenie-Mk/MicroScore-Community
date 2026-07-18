import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../../../core/services/auth.service';
import { LoanRequestService } from '../../../../core/services/loan-request.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ViewChild } from '@angular/core';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal';

interface LoanForm {
  motif: string;
  montant: number | null;
  duree: string;
  description: string;
}

@Component({
  selector: 'app-client-loan-form',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ConfirmModalComponent],
  templateUrl: './client-loan-form.html',
})
export class ClientLoanForm {
  private readonly auth = inject(AuthService);
  private readonly loanService = inject(LoanRequestService);
  private readonly toast = inject(ToastService);

  protected readonly loading = signal(false);
  protected readonly submitted = signal(false);
  protected readonly error = signal('');

  @ViewChild('confirmModal') protected confirmModal!: ConfirmModalComponent;

  protected readonly form = signal<LoanForm>({
    motif: '',
    montant: null,
    duree: '6',
    description: '',
  });

  protected readonly durees = [
    { value: '3', label: '3 mois' },
    { value: '6', label: '6 mois' },
    { value: '9', label: '9 mois' },
    { value: '12', label: '12 mois' },
    { value: '18', label: '18 mois' },
    { value: '24', label: '24 mois' },
  ];

  protected updateField<K extends keyof LoanForm>(field: K, value: LoanForm[K]): void {
    this.form.update((f) => ({ ...f, [field]: value }));
  }

  protected async submit(): Promise<void> {
    if (this.loading()) return;

    const f = this.form();
    if (!f.motif.trim() || !f.montant || f.montant <= 0) return;

    const user = this.auth.currentUser();
    if (!user) {
      this.error.set('Vous devez être connecté pour effectuer cette action.');
      return;
    }

    const confirmed = await this.confirmModal.open({
      title: 'Confirmer la demande',
      message: `Soumettre une demande de prêt de ${f.montant.toLocaleString()} FCFA pour "${f.motif}" sur ${f.duree} mois ?`,
      confirmLabel: 'Soumettre',
      type: 'info',
    });
    if (!confirmed) return;

    this.loading.set(true);
    this.error.set('');

    this.loanService.createLoan({
      idClient: user.id,
      motif: f.motif,
      montant: f.montant,
      dureeRemboursementMois: Number(f.duree),
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.toast.show('Demande de prêt soumise avec succès.', 'success');
        this.submitted.set(true);
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err.error?.message || err.message || 'Erreur lors de l\'envoi de la demande.';
        this.error.set(msg);
        this.toast.show(msg, 'error');
      },
    });
  }

  protected resetForm(): void {
    this.form.set({ motif: '', montant: null, duree: '6', description: '' });
    this.submitted.set(false);
    this.error.set('');
  }
}
