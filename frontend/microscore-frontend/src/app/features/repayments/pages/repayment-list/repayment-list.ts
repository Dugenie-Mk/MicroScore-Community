import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface Echeance {
  id: number;
  dateEcheance: string;
  montant: number;
  paye: boolean;
  datePaiement?: string;
}

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
  echeances: Echeance[];
}

type SortKey = 'client' | 'montant' | 'reste' | 'echeance' | 'statut';

@Component({
  selector: 'app-repayment-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './repayment-list.html',
})
export class RepaymentList {
  protected readonly searchQuery = signal('');
  protected readonly statutFilter = signal<string>('TOUS');
  protected readonly expandedId = signal<number | null>(null);
  protected readonly sortKey = signal<SortKey>('statut');
  protected readonly sortAsc = signal(true);

  protected readonly repayments = signal<Repayment[]>([
    {
      id: 1, clientId: 2, clientNom: 'Jules M.', loanId: 1,
      motif: 'Frais Scolaires', montantEmprunte: 300000,
      totalARembourser: 315000, montantRembourse: 100000, resteARembourser: 215000,
      dateProchaineEcheance: '15/07/2026', statut: 'EN_COURS',
      echeances: [
        { id: 1, dateEcheance: '15/05/2026', montant: 52500, paye: true, datePaiement: '15/05/2026' },
        { id: 2, dateEcheance: '15/06/2026', montant: 52500, paye: true, datePaiement: '16/06/2026' },
        { id: 3, dateEcheance: '15/07/2026', montant: 52500, paye: false },
        { id: 4, dateEcheance: '15/08/2026', montant: 52500, paye: false },
        { id: 5, dateEcheance: '15/09/2026', montant: 52500, paye: false },
        { id: 6, dateEcheance: '15/10/2026', montant: 52500, paye: false },
      ],
    },
    {
      id: 2, clientId: 2, clientNom: 'Jules M.', loanId: 2,
      motif: 'Achat Matériel', montantEmprunte: 500000,
      totalARembourser: 525000, montantRembourse: 525000, resteARembourser: 0,
      dateProchaineEcheance: '-', statut: 'SOLDÉ',
      echeances: [
        { id: 7, dateEcheance: '10/02/2026', montant: 87500, paye: true, datePaiement: '10/02/2026' },
        { id: 8, dateEcheance: '10/03/2026', montant: 87500, paye: true, datePaiement: '10/03/2026' },
        { id: 9, dateEcheance: '10/04/2026', montant: 87500, paye: true, datePaiement: '08/04/2026' },
        { id: 10, dateEcheance: '10/05/2026', montant: 87500, paye: true, datePaiement: '11/05/2026' },
        { id: 11, dateEcheance: '10/06/2026', montant: 87500, paye: true, datePaiement: '10/06/2026' },
        { id: 12, dateEcheance: '10/07/2026', montant: 87500, paye: true, datePaiement: '09/07/2026' },
      ],
    },
    {
      id: 3, clientId: 1, clientNom: 'Prunelle T.', loanId: 3,
      motif: 'Commerce', montantEmprunte: 350000,
      totalARembourser: 367500, montantRembourse: 0, resteARembourser: 367500,
      dateProchaineEcheance: '20/08/2026', statut: 'EN_COURS',
      echeances: [
        { id: 13, dateEcheance: '20/08/2026', montant: 91875, paye: false },
        { id: 14, dateEcheance: '20/09/2026', montant: 91875, paye: false },
        { id: 15, dateEcheance: '20/10/2026', montant: 91875, paye: false },
        { id: 16, dateEcheance: '20/11/2026', montant: 91875, paye: false },
      ],
    },
    {
      id: 4, clientId: 5, clientNom: 'Paul T.', loanId: 4,
      motif: 'Rénovation Habitat', montantEmprunte: 200000,
      totalARembourser: 210000, montantRembourse: 50000, resteARembourser: 160000,
      dateProchaineEcheance: '05/07/2026', statut: 'EN_RETARD',
      echeances: [
        { id: 17, dateEcheance: '05/05/2026', montant: 35000, paye: true, datePaiement: '06/05/2026' },
        { id: 18, dateEcheance: '05/06/2026', montant: 35000, paye: true, datePaiement: '07/06/2026' },
        { id: 19, dateEcheance: '05/07/2026', montant: 35000, paye: false },
        { id: 20, dateEcheance: '05/08/2026', montant: 35000, paye: false },
        { id: 21, dateEcheance: '05/09/2026', montant: 35000, paye: false },
        { id: 22, dateEcheance: '05/10/2026', montant: 35000, paye: false },
      ],
    },
    {
      id: 5, clientId: 1, clientNom: 'Prunelle T.', loanId: 5,
      motif: 'Équipement Agricole', montantEmprunte: 450000,
      totalARembourser: 472500, montantRembourse: 250000, resteARembourser: 222500,
      dateProchaineEcheance: '25/07/2026', statut: 'EN_COURS',
      echeances: [
        { id: 23, dateEcheance: '25/04/2026', montant: 78750, paye: true, datePaiement: '25/04/2026' },
        { id: 24, dateEcheance: '25/05/2026', montant: 78750, paye: true, datePaiement: '26/05/2026' },
        { id: 25, dateEcheance: '25/06/2026', montant: 78750, paye: true, datePaiement: '24/06/2026' },
        { id: 26, dateEcheance: '25/07/2026', montant: 78750, paye: false },
        { id: 27, dateEcheance: '25/08/2026', montant: 78750, paye: false },
        { id: 28, dateEcheance: '25/09/2026', montant: 78750, paye: false },
      ],
    },
  ]);

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

  protected getEcheancesPayees(echeances: Echeance[]): number {
    return echeances.filter((e) => e.paye).length;
  }

  protected getEcheancesRestantes(echeances: Echeance[]): number {
    return echeances.filter((e) => !e.paye).length;
  }

  protected getMontantMensuel(echeances: Echeance[]): number {
    const payees = echeances.filter((e) => e.paye);
    return payees.length > 0 ? Math.round(payees[0].montant) : (echeances[0]?.montant ?? 0);
  }
}
