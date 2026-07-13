import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { LoanRequestService } from '../../../../core/services/loan-request.service';

interface ScoringCritere {
  critere: string;
  poids: number;
  pourcentageObtenu: number;
}

interface ClientInfo {
  fullName: string;
  email: string;
  telephone: string;
  cni: string;
  dateNaissance: string;
  sexe: string;
  situationMatrimoniale: string;
  profession: string;
  secteurActivite: string;
  matricule?: string;
  score: number;
  documents: { type: string; statut: string }[];
  criteres: ScoringCritere[];
}

interface ClientLoan {
  id: number;
  motif: string;
  montant: number;
  date: string;
  duree: string;
  statut: string;
  total: number;
  rembourse: number;
  reste: number;
}

interface Echeance {
  id: number;
  dateEcheance: string;
  montant: number;
  paye: boolean;
  datePaiement?: string;
}

interface ClientRepayment {
  id: number;
  motif: string;
  montantEmprunte: number;
  totalARembourser: number;
  montantRembourse: number;
  resteARembourser: number;
  dateProchaineEcheance: string;
  statut: string;
  echeances: Echeance[];
}

@Component({
  selector: 'app-loan-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './loan-detail.html',
})
export class LoanDetail {
  protected readonly Math = Math;
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);
  private readonly loanService = inject(LoanRequestService);

  protected readonly isAdmin = computed(() => this.auth.currentUser()?.role === 'ADMIN');

  protected readonly CIRCUMFERENCE = 2 * Math.PI * 42;

  protected getRingOffset(pct: number): number {
    return this.CIRCUMFERENCE * (1 - pct / 100);
  }

  protected getRingRotation(pct: number): string {
    return `rotate(${(pct / 100) * 360} 50 50)`;
  }

  protected readonly clientId = signal(Number(this.route.snapshot.paramMap.get('id')));

  private readonly clientsData: Record<number, ClientInfo> = {
    1: {
      fullName: 'Kambou Prunelle',
      email: 'prunelle@gmail.com',
      telephone: '+237 600 000 001',
      cni: 'CM-2026-KP',
      dateNaissance: '12/05/1995',
      sexe: 'Masculin',
      situationMatrimoniale: 'Célibataire',
      profession: 'Commerçant',
      secteurActivite: 'Commerce',
      score: 81,
      documents: [
        { type: 'CNI', statut: 'AJOUTE' },
        { type: 'Passeport', statut: 'AJOUTE' },
        { type: 'Carte Résidence', statut: 'MANQUANT' },
      ],
      criteres: [
        { critere: 'Profil sociodémographique', poids: 20, pourcentageObtenu: 18 },
        { critere: 'Capacité de remboursements', poids: 35, pourcentageObtenu: 30 },
        { critere: 'Historique de crédits', poids: 15, pourcentageObtenu: 12 },
        { critere: 'Activités économiques', poids: 15, pourcentageObtenu: 13 },
        { critere: 'Garanties et collatéraux', poids: 10, pourcentageObtenu: 6 },
        { critere: 'Facteurs comportementaux', poids: 5, pourcentageObtenu: 2 },
      ],
    },
    2: {
      fullName: 'Anafack Jules',
      email: 'jules@gmail.com',
      telephone: '+237 699 999 999',
      cni: 'CM-2026-AJ',
      dateNaissance: '23/08/1995',
      sexe: 'Masculin',
      situationMatrimoniale: 'Marié',
      profession: 'Ingénieur',
      secteurActivite: 'Informatique',
      score: 74,
      documents: [
        { type: 'CNI', statut: 'AJOUTE' },
        { type: 'Passeport', statut: 'AJOUTE' },
        { type: 'Carte Résidence', statut: 'AJOUTE' },
      ],
      criteres: [
        { critere: 'Profil sociodémographique', poids: 20, pourcentageObtenu: 15 },
        { critere: 'Capacité de remboursements', poids: 35, pourcentageObtenu: 28 },
        { critere: 'Historique de crédits', poids: 15, pourcentageObtenu: 10 },
        { critere: 'Activités économiques', poids: 15, pourcentageObtenu: 11 },
        { critere: 'Garanties et collatéraux', poids: 10, pourcentageObtenu: 7 },
        { critere: 'Facteurs comportementaux', poids: 5, pourcentageObtenu: 3 },
      ],
    },
    5: {
      fullName: 'Tchinda Paul',
      email: 'paul.t@email.com',
      telephone: '+237 622 111 222',
      cni: 'CM-2026-TP',
      dateNaissance: '08/07/1990',
      sexe: 'Masculin',
      situationMatrimoniale: 'Marié',
      profession: 'Agriculteur',
      secteurActivite: 'Agriculture',
      score: 62,
      documents: [
        { type: 'CNI', statut: 'AJOUTE' },
        { type: 'Passeport', statut: 'MANQUANT' },
        { type: 'Carte Résidence', statut: 'MANQUANT' },
      ],
      criteres: [
        { critere: 'Profil sociodémographique', poids: 20, pourcentageObtenu: 12 },
        { critere: 'Capacité de remboursements', poids: 35, pourcentageObtenu: 22 },
        { critere: 'Historique de crédits', poids: 15, pourcentageObtenu: 8 },
        { critere: 'Activités économiques', poids: 15, pourcentageObtenu: 10 },
        { critere: 'Garanties et collatéraux', poids: 10, pourcentageObtenu: 5 },
        { critere: 'Facteurs comportementaux', poids: 5, pourcentageObtenu: 5 },
      ],
    },
    6: {
      fullName: 'Kengne Marie',
      email: 'marie.k@email.com',
      telephone: '+237 655 444 333',
      cni: 'CM-2026-KM',
      dateNaissance: '15/11/1992',
      sexe: 'Féminin',
      situationMatrimoniale: 'Mariée',
      profession: 'Enseignante',
      secteurActivite: 'Éducation',
      score: 58,
      documents: [
        { type: 'CNI', statut: 'AJOUTE' },
        { type: 'Passeport', statut: 'MANQUANT' },
        { type: 'Carte Résidence', statut: 'MANQUANT' },
      ],
      criteres: [
        { critere: 'Profil sociodémographique', poids: 20, pourcentageObtenu: 10 },
        { critere: 'Capacité de remboursements', poids: 35, pourcentageObtenu: 20 },
        { critere: 'Historique de crédits', poids: 15, pourcentageObtenu: 6 },
        { critere: 'Activités économiques', poids: 15, pourcentageObtenu: 9 },
        { critere: 'Garanties et collatéraux', poids: 10, pourcentageObtenu: 8 },
        { critere: 'Facteurs comportementaux', poids: 5, pourcentageObtenu: 5 },
      ],
    },
  };

  protected readonly client = computed(() => this.clientsData[this.clientId()]);

  protected readonly riskCategory = computed(() => {
    const s = this.client()?.score ?? 0;
    if (s >= 80) return { label: 'Faible', color: 'text-green-600', bg: 'bg-green-500', bar: 'from-green-500 to-emerald-400' };
    if (s >= 60) return { label: 'Modéré', color: 'text-amber-600', bg: 'bg-amber-500', bar: 'from-amber-500 to-yellow-400' };
    return { label: 'Élevé', color: 'text-red-600', bg: 'bg-red-500', bar: 'from-red-500 to-rose-400' };
  });

  protected getCritereBarColor(pct: number, poids: number): string {
    const ratio = pct / poids;
    if (ratio >= 0.8) return 'bg-green-500';
    if (ratio >= 0.5) return 'bg-amber-500';
    return 'bg-red-500';
  }

  protected readonly loans = signal<ClientLoan[]>([
    { id: 1, motif: 'Commerce', montant: 350000, date: '20/05/2026', duree: '4 mois', statut: 'EN_ATTENTE', total: 367500, rembourse: 0, reste: 367500 },
    { id: 4, motif: 'Équipement Agricole', montant: 450000, date: '25/03/2026', duree: '5 mois', statut: 'EN_ATTENTE', total: 472500, rembourse: 250000, reste: 222500 },
    { id: 2, motif: 'Achat Matériel', montant: 500000, date: '10/01/2026', duree: '6 mois', statut: 'APPROUVE', total: 525000, rembourse: 525000, reste: 0 },
    { id: 5, motif: 'Frais Scolaires', montant: 300000, date: '15/02/2026', duree: '3 mois', statut: 'APPROUVE', total: 315000, rembourse: 100000, reste: 215000 },
    { id: 3, motif: 'Rénovation Habitat', montant: 200000, date: '05/04/2026', duree: '3 mois', statut: 'REJETE', total: 210000, rembourse: 0, reste: 210000 },
    { id: 7, motif: 'Véhicule', montant: 800000, date: '12/03/2026', duree: '12 mois', statut: 'REJETE', total: 840000, rembourse: 0, reste: 840000 },
    { id: 6, motif: 'Santé', montant: 150000, date: '01/06/2026', duree: '2 mois', statut: 'EN_ATTENTE', total: 157500, rembourse: 0, reste: 157500 },
    { id: 8, motif: 'Formation', montant: 100000, date: '20/06/2026', duree: '2 mois', statut: 'EN_ATTENTE', total: 105000, rembourse: 0, reste: 105000 },
  ]);

  protected readonly repayments = signal<ClientRepayment[]>([
    {
      id: 3, motif: 'Commerce', montantEmprunte: 350000, totalARembourser: 367500, montantRembourse: 0, resteARembourser: 367500,
      dateProchaineEcheance: '20/08/2026', statut: 'EN_COURS',
      echeances: [
        { id: 13, dateEcheance: '20/08/2026', montant: 91875, paye: false },
        { id: 14, dateEcheance: '20/09/2026', montant: 91875, paye: false },
        { id: 15, dateEcheance: '20/10/2026', montant: 91875, paye: false },
        { id: 16, dateEcheance: '20/11/2026', montant: 91875, paye: false },
      ],
    },
    {
      id: 5, motif: 'Équipement Agricole', montantEmprunte: 450000, totalARembourser: 472500, montantRembourse: 250000, resteARembourser: 222500,
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
    {
      id: 1, motif: 'Frais Scolaires', montantEmprunte: 300000, totalARembourser: 315000, montantRembourse: 100000, resteARembourser: 215000,
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
      id: 2, motif: 'Achat Matériel', montantEmprunte: 500000, totalARembourser: 525000, montantRembourse: 525000, resteARembourser: 0,
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
      id: 4, motif: 'Rénovation Habitat', montantEmprunte: 200000, totalARembourser: 210000, montantRembourse: 50000, resteARembourser: 160000,
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
  ]);

  private readonly clientLoanIds: Record<number, number[]> = {
    1: [1, 4],
    2: [2, 5],
    5: [3, 7],
    6: [6, 8],
  };

  private readonly clientRepaymentIds: Record<number, number[]> = {
    1: [3, 5],
    2: [1, 2],
    5: [4],
    6: [],
  };

  protected readonly clientLoans = computed(() =>
    this.loans().filter((l) => (this.clientLoanIds[this.clientId()] ?? []).includes(l.id))
  );

  protected readonly clientRepayments = computed(() =>
    this.repayments().filter((r) => (this.clientRepaymentIds[this.clientId()] ?? []).includes(r.id))
  );

  protected readonly allEcheances = computed(() =>
    this.clientRepayments().flatMap((r) =>
      r.echeances.map((e) => ({ ...e, motif: r.motif }))
    ).sort((a, b) => {
      const [aD, aM, aY] = a.dateEcheance.split('/').map(Number);
      const [bD, bM, bY] = b.dateEcheance.split('/').map(Number);
      return new Date(aY, aM - 1, aD).getTime() - new Date(bY, bM - 1, bD).getTime();
    })
  );

  protected readonly paymentStats = computed(() => {
    const all = this.allEcheances();
    const onTime = all.filter((e) => e.paye && e.datePaiement && this.isOnTime(e.dateEcheance, e.datePaiement)).length;
    const late = all.filter((e) => e.paye && e.datePaiement && !this.isOnTime(e.dateEcheance, e.datePaiement)).length;
    const missed = all.filter((e) => !e.paye).length;
    return { total: all.length, onTime, late, missed };
  });

  private isOnTime(due: string, paid: string): boolean {
    const [dDay, dMonth, dYear] = due.split('/').map(Number);
    const [pDay, pMonth, pYear] = paid.split('/').map(Number);
    const dueDate = new Date(dYear, dMonth - 1, dDay);
    const paidDate = new Date(pYear, pMonth - 1, pDay);
    return paidDate <= dueDate;
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
    this.loans.update((items) =>
      items.map((l) => (l.id === id ? { ...l, statut: newStatus } : l))
    );
  }

  protected getStatutClass(s: string): string {
    switch (s) {
      case 'APPROUVE': return 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400';
      case 'REJETE': return 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400';
      case 'EN_ATTENTE': return 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400';
      case 'SOLDÉ': return 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400';
      case 'EN_RETARD': return 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400';
      case 'EN_COURS': return 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400';
      default: return 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  }

  protected getEcheanceColor(e: Echeance): { dot: string; label: string } {
    if (!e.paye) return { dot: 'bg-red-500', label: 'Impayé' };
    if (e.datePaiement && this.isOnTime(e.dateEcheance, e.datePaiement)) return { dot: 'bg-green-500', label: 'Payée à temps' };
    return { dot: 'bg-amber-500', label: 'Payée en retard' };
  }

  protected readonly colors = [
    'from-violet-500 to-purple-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-amber-600',
    'from-cyan-500 to-blue-600',
  ];

  protected getInitials(name: string): string {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  }
}
