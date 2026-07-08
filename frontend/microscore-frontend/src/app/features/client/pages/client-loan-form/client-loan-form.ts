import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface LoanForm {
  motif: string;
  montant: number | null;
  duree: string;
  description: string;
}

@Component({
  selector: 'app-client-loan-form',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './client-loan-form.html',
})
export class ClientLoanForm {
  protected submitted = signal(false);

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

  protected submit(): void {
    const f = this.form();
    if (!f.motif.trim() || !f.montant || f.montant <= 0) return;
    this.submitted.set(true);
  }

  protected resetForm(): void {
    this.form.set({ motif: '', montant: null, duree: '6', description: '' });
    this.submitted.set(false);
  }
}
