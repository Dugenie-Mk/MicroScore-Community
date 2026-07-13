import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';
import { LoanRequestService } from '../../../../core/services/loan-request.service';

type SortKey = 'client' | 'montant' | 'score' | 'date' | 'statut';

@Component({
  selector: 'app-loan-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './loan-list.html',
})
export class LoanList {
  private readonly auth = inject(AuthService);
  private readonly loanService = inject(LoanRequestService);

  protected readonly isAdmin = computed(() => this.auth.currentUser()?.role === 'ADMIN');

  protected readonly searchQuery = signal('');
  protected readonly statutFilter = signal<string>('TOUS');
  protected readonly sortKey = signal<SortKey>('date');
  protected readonly sortAsc = signal(false);

  protected readonly filtered = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const filter = this.statutFilter();
    const key = this.sortKey();
    const asc = this.sortAsc();
    return this.loanService.loanRequests()
      .filter((r) => {
        if (filter !== 'TOUS' && r.statut !== filter) return false;
        if (q && !r.clientNom.toLowerCase().includes(q) && !r.motif.toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => {
        let cmp = 0;
        switch (key) {
          case 'client': cmp = a.clientNom.localeCompare(b.clientNom); break;
          case 'montant': cmp = a.montant - b.montant; break;
          case 'score': cmp = a.score - b.score; break;
          case 'date': cmp = a.date.localeCompare(b.date); break;
          case 'statut': cmp = a.statut.localeCompare(b.statut); break;
        }
        return asc ? cmp : -cmp;
      });
  });

  protected readonly stats = computed(() => {
    const all = this.loanService.loanRequests();
    return {
      total: all.length,
      enAttente: all.filter((r) => r.statut === 'EN_ATTENTE').length,
      approuves: all.filter((r) => r.statut === 'APPROUVE').length,
      rejetes: all.filter((r) => r.statut === 'REJETE').length,
      montantTotal: all.reduce((s, r) => s + r.montant, 0),
    };
  });

  protected toggleSort(key: SortKey): void {
    if (this.sortKey() === key) {
      this.sortAsc.update((v) => !v);
    } else {
      this.sortKey.set(key);
      this.sortAsc.set(true);
    }
  }

  protected getStatutInfo(statut: string): { label: string; bg: string; dot: string } {
    switch (statut) {
      case 'APPROUVE': return { label: 'Approuvé', bg: 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400', dot: 'bg-green-500' };
      case 'REJETE': return { label: 'Rejeté', bg: 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400', dot: 'bg-red-500' };
      case 'EN_ATTENTE': return { label: 'En attente', bg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400', dot: 'bg-amber-500' };
      default: return { label: statut, bg: 'bg-gray-50 text-gray-700', dot: 'bg-gray-400' };
    }
  }

  protected getScoreColor(score: number): string {
    if (score >= 70) return 'text-green-600 dark:text-green-400';
    if (score >= 50) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  }

  protected getScoreBarColor(score: number): string {
    if (score >= 70) return 'bg-green-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  }

  protected updateStatus(id: number, newStatus: 'APPROUVE' | 'REJETE'): void {
    this.loanService.updateStatus(id, newStatus);
  }

  protected readonly colors = [
    'from-violet-500 to-purple-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-amber-600',
    'from-cyan-500 to-blue-600',
    'from-pink-500 to-rose-600',
    'from-indigo-500 to-violet-600',
  ];

  protected getInitials(name: string): string {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  }
}
