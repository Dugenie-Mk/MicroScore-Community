import { Component, OnInit, signal, computed, inject, ViewChild } from '@angular/core';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin, Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { AuthService } from '../../../../core/services/auth.service';
import { LoanRequestService, PretApiResponse, LoanRequestItem } from '../../../../core/services/loan-request.service';
import { ParametreService } from '../../../../core/services/parametre.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-loan-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ConfirmModalComponent],
  templateUrl: './loan-list.html',
})
export class LoanList implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly loanService = inject(LoanRequestService);
  private readonly toast = inject(ToastService);

  protected readonly isAdmin = computed(() => this.auth.currentUser()?.role === 'ADMIN');
  protected readonly Math = Math;
  @ViewChild('confirmModal') protected confirmModal!: ConfirmModalComponent;

  protected readonly searchQuery = signal('');
  protected readonly statutFilter = signal<string>('TOUS');
  protected readonly sortKey = signal<string>('dateEnregistrement');
  protected readonly sortAsc = signal(false);
  protected readonly pageSize = signal(10);
  protected readonly currentPage = signal(0);
  protected readonly totalElements = signal(0);
  protected readonly totalPages = signal(0);
  protected readonly loans = signal<LoanRequestItem[]>([]);
  protected loading = signal(false);

  private readonly searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.loadGlobalRate();
    this.loadPage();

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage.set(0);
      this.loadPage();
    });
  }

  protected onSearchChange(value: string): void {
    this.searchQuery.set(value);
    this.searchSubject.next(value);
  }

  protected onStatutFilterChange(value: string): void {
    this.statutFilter.set(value);
    this.currentPage.set(0);
    this.loadPage();
  }

  protected onPageSizeChange(value: number): void {
    this.pageSize.set(value);
    this.currentPage.set(0);
    this.loadPage();
  }

  protected toggleSort(key: string): void {
    if (this.sortKey() === key) {
      this.sortAsc.update((v) => !v);
    } else {
      this.sortKey.set(key);
      this.sortAsc.set(true);
    }
    this.loadPage();
  }

  protected loadPage(): void {
    this.loading.set(true);
    this.loanService.rechercherPrets(
      this.statutFilter(),
      this.searchQuery(),
      this.currentPage(),
      this.pageSize(),
      this.sortKey(),
      this.sortAsc() ? 'asc' : 'desc'
    ).pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (page) => {
          this.loans.set(page.content.map((p) => ({
            id: p.idPret,
            clientId: p.idClient,
            clientNom: p.clientNom || '',
            motif: p.motif || '',
            montant: p.montant,
            score: p.scoreTotal,
            date: p.dateEnregistrement ? p.dateEnregistrement.substring(0, 10) : '',
            duree: p.dureeRemboursementMois + ' mois',
            statut: p.statut,
          })));
          this.totalElements.set(page.totalElements);
          this.totalPages.set(page.totalPages);
        },
        error: () => this.toast.show('Erreur lors du chargement', 'error'),
      });
  }

  protected goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages()) {
      this.currentPage.set(page);
      this.loadPage();
    }
  }

  protected getPageRange(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const range: number[] = [];
    const start = Math.max(0, Math.min(current - 2, total - 5));
    const end = Math.min(total, start + 5);
    for (let i = start; i < end; i++) range.push(i);
    return range;
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

  protected async updateStatus(id: number, newStatus: 'APPROUVE' | 'REJETE'): Promise<void> {
    const label = newStatus === 'APPROUVE' ? 'approuver' : 'rejeter';
    const confirmed = await this.confirmModal.open({
      title: newStatus === 'APPROUVE' ? 'Approuver le prêt' : 'Rejeter le prêt',
      message: `Êtes-vous sûr de vouloir ${label} ce prêt ?`,
      confirmLabel: newStatus === 'APPROUVE' ? 'Approuver' : 'Rejeter',
      type: newStatus === 'APPROUVE' ? 'info' : 'danger',
    });
    if (!confirmed) return;

    this.loanService.updateStatus(id, newStatus).subscribe({
      next: () => {
        this.loadPage();
        this.toast.show(
          newStatus === 'APPROUVE' ? 'Prêt approuvé avec succès' : 'Prêt rejeté',
          newStatus === 'APPROUVE' ? 'success' : 'warning'
        );
      },
      error: () => this.toast.show('Erreur lors de la mise à jour du statut', 'error'),
    });
  }

  // Taux global d'intérêt (admin seulement)
  private readonly parametreService = inject(ParametreService);
  protected annualRate = signal(2.0);
  protected monthlyRate = computed(() => Math.round(this.annualRate() / 12 * 100) / 100);
  protected editingRate = signal(false);
  protected rateLoading = signal(false);

  private loadGlobalRate(): void {
    this.rateLoading.set(true);
    this.parametreService.getValeur('TAUX_INTERET_GLOBAL')
      .pipe(finalize(() => this.rateLoading.set(false)))
      .subscribe({
        next: (v) => { if (v) this.annualRate.set(parseFloat(v)); },
      });
  }

  protected onAnnualChange(value: number): void {
    this.annualRate.set(value);
  }

  protected onMonthlyChange(value: number): void {
    this.annualRate.set(Math.round(value * 12 * 100) / 100);
  }

  protected saveGlobalRate(): void {
    this.rateLoading.set(true);
    forkJoin({
      taux: this.parametreService.setValeur('TAUX_INTERET_GLOBAL', String(this.annualRate())),
      type: this.parametreService.setValeur('TYPE_TAUX_GLOBAL', 'ANNUEL'),
    }).pipe(finalize(() => this.rateLoading.set(false)))
      .subscribe({
        next: () => {
          this.editingRate.set(false);
          this.toast.show('Taux global mis à jour', 'success');
        },
        error: () => this.toast.show('Erreur lors de la sauvegarde', 'error'),
      });
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
