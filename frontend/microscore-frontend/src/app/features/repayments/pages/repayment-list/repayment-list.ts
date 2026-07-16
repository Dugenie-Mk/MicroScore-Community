import { Component, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { LoanRequestService, PretApiResponse } from '../../../../core/services/loan-request.service';
import { RepaymentService, EcheanceDto } from '../../../../core/services/repayment.service';
import { ToastService } from '../../../../core/services/toast.service';
import { UserService } from '../../../../core/services/user.service';

interface Repayment {
  id: number;
  clientId: number;
  clientNom: string;
  loanId: number;
  motif: string;
  montantEmprunte: number;
  totalARembourser: number;
  montantRembourse: number;
  resteARembourser: number;
  dateProchaineEcheance: string;
  statut: 'SOLDÉ' | 'EN_COURS' | 'EN_RETARD';
  echeances: EcheanceDto[];
}

type SortKey = 'client' | 'montant' | 'reste' | 'echeance' | 'statut';

@Component({
  selector: 'app-repayment-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './repayment-list.html',
})
export class RepaymentList {
  private readonly loanService = inject(LoanRequestService);
  private readonly repaymentService = inject(RepaymentService);
  private readonly toast = inject(ToastService);
  private readonly userService = inject(UserService);

  protected readonly searchQuery = signal('');
  protected readonly statutFilter = signal<string>('TOUS');
  protected readonly expandedId = signal<number | null>(null);
  protected readonly sortKey = signal<SortKey>('statut');
  protected readonly sortAsc = signal(true);
  protected readonly loading = signal(true);

  protected readonly repayments = signal<Repayment[]>([]);

  constructor() {
    this.loadRepayments();
    effect(() => {
      this.repaymentService.refreshTrigger();
      this.loadRepayments();
    });
  }

  private loadRepayments(): void {
    this.loading.set(true);

    this.loanService.getAllPrets().subscribe({
      next: (prets) => {
        const approuves = prets.filter((p) => p.statut === 'APPROUVE');
        if (approuves.length === 0) {
          this.loading.set(false);
          return;
        }

        let completed = 0;
        for (const pret of approuves) {
          this.repaymentService.getAmortissementByPret(pret.idPret).subscribe({
            next: (grille) => {
              const payees = grille.echeances.filter((e) => e.statut === 'PAYE');
              const totalRembourse = payees.reduce((s, e) => s + e.mensualite, 0);
              const allPayees = grille.echeances.every((e) => e.statut === 'PAYE');
              const enRetard = grille.echeances.some((e) => e.statut === 'EN_RETARD');
              const prochaine = grille.echeances.find((e) => e.statut === 'EN_ATTENTE' || e.statut === 'EN_RETARD');

              let statutRemb: 'SOLDÉ' | 'EN_COURS' | 'EN_RETARD' = 'EN_COURS';
              if (allPayees) statutRemb = 'SOLDÉ';
              else if (enRetard) statutRemb = 'EN_RETARD';

              // Get client name
              this.userService.getById(pret.idClient).subscribe({
                next: (user) => {
                  this.repayments.update((items) => [
                    ...items,
                    {
                      id: pret.idPret,
                      clientId: pret.idClient,
                      clientNom: user.fullName,
                      loanId: pret.idPret,
                      motif: pret.motif || '',
                      montantEmprunte: grille.montantEmprunte,
                      totalARembourser: grille.coutTotalCredit,
                      montantRembourse: totalRembourse,
                      resteARembourser: grille.coutTotalCredit - totalRembourse,
                      dateProchaineEcheance: prochaine ? this.formatDate(prochaine.dateEcheancePrevue) : '-',
                      statut: statutRemb,
                      echeances: grille.echeances,
                    },
                  ]);
                },
                error: () => {},
              });
            },
            error: () => {},
            complete: () => {
              completed++;
              if (completed === approuves.length) this.loading.set(false);
            },
          });
        }
      },
      error: () => this.loading.set(false),
    });
  }

  private formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR');
  }

  protected readonly filtered = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const filter = this.statutFilter();
    const key = this.sortKey();
    const asc = this.sortAsc();
    return this.repayments()
      .filter((r) => {
        if (filter !== 'TOUS' && r.statut !== filter) return false;
        if (q && !r.clientNom.toLowerCase().includes(q) && !r.motif.toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => {
        let cmp = 0;
        switch (key) {
          case 'client': cmp = a.clientNom.localeCompare(b.clientNom); break;
          case 'montant': cmp = a.montantEmprunte - b.montantEmprunte; break;
          case 'reste': cmp = a.resteARembourser - b.resteARembourser; break;
          case 'echeance': cmp = a.dateProchaineEcheance.localeCompare(b.dateProchaineEcheance); break;
          case 'statut': cmp = a.statut.localeCompare(b.statut); break;
        }
        return asc ? cmp : -cmp;
      });
  });

  protected readonly stats = computed(() => {
    const all = this.repayments();
    const totalPret = all.reduce((s, r) => s + r.montantEmprunte, 0);
    const totalRembourse = all.reduce((s, r) => s + r.montantRembourse, 0);
    const totalDu = all.reduce((s, r) => s + r.resteARembourser, 0);
    return {
      totalDu,
      totalRembourse,
      enRetard: all.filter((r) => r.statut === 'EN_RETARD').length,
      soldes: all.filter((r) => r.statut === 'SOLDÉ').length,
      enCours: all.filter((r) => r.statut === 'EN_COURS').length,
      total: all.length,
      totalPret,
      progressPct: totalPret > 0 ? Math.min(100, Math.round((totalRembourse / totalPret) * 100)) : 0,
    };
  });

  protected toggleExpand(id: number): void {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }

  protected toggleSort(key: SortKey): void {
    if (this.sortKey() === key) {
      this.sortAsc.update((v) => !v);
    } else {
      this.sortKey.set(key);
      this.sortAsc.set(true);
    }
  }

  protected colors = [
    { bg: 'from-violet-500 to-purple-600', ring: 'ring-violet-500/20', text: 'text-violet-600 dark:text-violet-400' },
    { bg: 'from-emerald-500 to-teal-600', ring: 'ring-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400' },
    { bg: 'from-orange-500 to-amber-600', ring: 'ring-orange-500/20', text: 'text-orange-600 dark:text-orange-400' },
    { bg: 'from-cyan-500 to-blue-600', ring: 'ring-cyan-500/20', text: 'text-cyan-600 dark:text-cyan-400' },
    { bg: 'from-pink-500 to-rose-600', ring: 'ring-pink-500/20', text: 'text-pink-600 dark:text-pink-400' },
  ];

  protected getInitials(name: string): string {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  protected getColorIndex(id: number): number {
    return id % this.colors.length;
  }

  protected getStatusColor(statut: string): { label: string; bg: string; dot: string; border: string } {
    switch (statut) {
      case 'SOLDÉ':
        return { label: 'Soldé', bg: 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400', dot: 'bg-green-500', border: 'border-l-green-500' };
      case 'EN_COURS':
        return { label: 'En cours', bg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400', dot: 'bg-blue-500', border: 'border-l-blue-500' };
      case 'EN_RETARD':
        return { label: 'En retard', bg: 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400', dot: 'bg-red-500', border: 'border-l-red-500' };
      default:
        return { label: statut, bg: 'bg-gray-50 text-gray-700', dot: 'bg-gray-400', border: 'border-l-gray-400' };
    }
  }

  protected getProgressColor(statut: string): string {
    switch (statut) {
      case 'SOLDÉ': return 'from-green-400 to-green-600';
      case 'EN_RETARD': return 'from-red-400 to-red-600';
      default: return 'from-brand-400 to-brand-600';
    }
  }

  protected getEcheancesPayees(echeances: EcheanceDto[]): number {
    return echeances.filter((e) => e.statut === 'PAYE').length;
  }

  protected getEcheancesRestantes(echeances: EcheanceDto[]): number {
    return echeances.filter((e) => e.statut !== 'PAYE').length;
  }

  protected getMontantMensuel(echeances: EcheanceDto[]): number {
    const payees = echeances.filter((e) => e.statut === 'PAYE');
    return payees.length > 0 ? Math.round(payees[0].mensualite) : (echeances[0]?.mensualite ?? 0);
  }
}
