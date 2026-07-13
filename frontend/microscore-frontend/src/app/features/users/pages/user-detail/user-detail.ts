import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

type ActiveTab = 'infos' | 'scoring' | 'loans' | 'repayments';

interface UserDetail {
  id: number;
  fullName: string;
  email: string;
  telephone: string;
  role: 'CLIENT' | 'GESTIONNAIRE' | 'ADMIN';
  statut: 'ACTIF' | 'BLOQUE' | 'EN_ATTENTE';
  infos: Record<string, string>;
  cni?: string;
  dateNaissance?: string;
  situationMatrimoniale?: string;
  lieuNaissance?: string;
  sexe?: string;
  nombreEnfants?: string;
  profession?: string;
  secteurActivite?: string;
  revenu?: string;
  boitePostale?: string;
  matricule?: string;
  dateEmbauche?: string;
  service?: string;
  derniereConnexion?: string;
  dateCreation?: string;
  permissions?: string[];
}

interface Loan {
  date: string;
  motif: string;
  montant: number;
  taux: number;
  total: number;
  statut: 'ACCORDÉ' | 'REFUSÉ' | 'EN_ATTENTE';
}

interface Repayment {
  id: number;
  dateEmprunt: string;
  montantEmprunte: number;
  tauxInteret: number;
  totalARembourser: number;
  montantRembourse: number;
  dateRemboursement: string;
  mode: string;
  resteARembourser: number;
  statut: string;
}

interface ScoringCriteres {
  critere: string;
  poids: number;
  pourcentageObtenu: number;
  details: { libelle: string; note: string }[];
}

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './user-detail.html',
})
export class UserDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);

  activeTab = signal<ActiveTab>('infos');
  user = signal<UserDetail | null>(null);
  loading = signal(true);

  loans = signal<Loan[]>([]);
  repayments = signal<Repayment[]>([]);
  scoringParams = signal<ScoringCriteres[]>([]);

  showModal = signal(false);
  modalMode = signal<'add' | 'edit'>('add');
  currentCritere = signal<any>(null);

  clientScore = computed(() =>
    this.scoringParams().reduce((acc, curr) => acc + curr.pourcentageObtenu, 0)
  );

  readonly clientTabs: { key: ActiveTab; label: string }[] = [
    { key: 'infos', label: 'Infos personnelles' },
    { key: 'scoring', label: 'Scoring' },
    { key: 'loans', label: 'Prêts' },
    { key: 'repayments', label: 'Remboursements' },
  ];

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadUserData(id);
  }

  private loadUserData(id: number) {
    const mockUsers: Record<number, UserDetail> = {
      1: {
        id: 1, fullName: 'Kambou Prunelle', email: 'prunelle@gmail.com',
        telephone: '+237 600 000 001', role: 'CLIENT', statut: 'ACTIF',
        cni: 'CM-2026-KP', dateNaissance: '12/05/1995',
        lieuNaissance: 'Douala', sexe: 'Masculin',
        situationMatrimoniale: 'Célibataire', nombreEnfants: '0',
        profession: 'Commerçant', secteurActivite: 'Commerce',
        revenu: '250 000 FCFA', boitePostale: 'BP 1234',
        infos: {},
      },
      2: {
        id: 2, fullName: 'Anafack Jules', email: 'jules@gmail.com',
        telephone: '+237 699 999 999', role: 'CLIENT', statut: 'ACTIF',
        cni: 'CM-2026-AJ', dateNaissance: '23/08/1995',
        lieuNaissance: 'Yaoundé', sexe: 'Masculin',
        situationMatrimoniale: 'Marié', nombreEnfants: '2',
        profession: 'Ingénieur', secteurActivite: 'Informatique',
        revenu: '800 000 FCFA', boitePostale: 'BP 567',
        infos: {},
      },
      3: {
        id: 3, fullName: 'Kuaté Édouard', email: 'edouard@gmail.com',
        telephone: '+237 677 777 777', role: 'CLIENT', statut: 'BLOQUE',
        cni: 'CM-2026-KE', dateNaissance: '01/11/2000',
        lieuNaissance: 'Bafoussam', sexe: 'Masculin',
        situationMatrimoniale: 'Marié', nombreEnfants: '3',
        profession: 'Enseignant', secteurActivite: 'Éducation',
        revenu: '400 000 FCFA', boitePostale: 'BP 101',
        infos: {},
      },
      4: {
        id: 4, fullName: 'Mbiada Carine', email: 'carine.m@email.com',
        telephone: '+237 655 444 333', role: 'CLIENT', statut: 'EN_ATTENTE',
        cni: 'CM-2026-MC', dateNaissance: '15/03/1998',
        lieuNaissance: 'Garoua', sexe: 'Féminin',
        situationMatrimoniale: 'Célibataire', nombreEnfants: '1',
        profession: 'Coiffeuse', secteurActivite: 'Beauté',
        revenu: '150 000 FCFA', boitePostale: 'BP 789',
        infos: {},
      },
      5: {
        id: 5, fullName: 'Tchinda Paul', email: 'paul.t@email.com',
        telephone: '+237 622 111 222', role: 'CLIENT', statut: 'ACTIF',
        cni: 'CM-2026-TP', dateNaissance: '08/07/1990',
        lieuNaissance: 'Bamenda', sexe: 'Masculin',
        situationMatrimoniale: 'Marié', nombreEnfants: '4',
        profession: 'Agriculteur', secteurActivite: 'Agriculture',
        revenu: '300 000 FCFA',
        infos: {},
      },
      6: {
        id: 6, fullName: 'Nana Djibril', email: 'nana.d@microscore.cm',
        telephone: '+237 688 999 000', role: 'GESTIONNAIRE', statut: 'ACTIF',
        matricule: 'GST-2024-001', dateEmbauche: '15/01/2024',
        service: 'Gestion des prêts', infos: {},
      },
      7: {
        id: 7, fullName: 'Eyanga Rachel', email: 'rachel.e@microscore.cm',
        telephone: '+237 677 888 999', role: 'GESTIONNAIRE', statut: 'ACTIF',
        matricule: 'GST-2024-002', dateEmbauche: '03/06/2024',
        service: 'Relation client', infos: {},
      },
      8: {
        id: 8, fullName: 'Fotso Rodrigue', email: 'rodrigue.f@microscore.cm',
        telephone: '+237 699 777 888', role: 'GESTIONNAIRE', statut: 'BLOQUE',
        matricule: 'GST-2023-015', dateEmbauche: '22/11/2023',
        service: 'Recouvrement', infos: {},
      },
      9: {
        id: 9, fullName: 'Simo Benoît', email: 'simo.b@microscore.cm',
        telephone: '+237 655 666 777', role: 'ADMIN', statut: 'ACTIF',
        derniereConnexion: '08/07/2026 à 09:45',
        dateCreation: '01/09/2023',
        permissions: ['Tous les accès'], infos: {},
      },
      10: {
        id: 10, fullName: 'Djoko Arielle', email: 'arielle.d@microscore.cm',
        telephone: '+237 622 333 444', role: 'ADMIN', statut: 'ACTIF',
        derniereConnexion: '07/07/2026 à 14:30',
        dateCreation: '12/03/2024',
        permissions: ['Tous les accès'], infos: {},
      },
      11: {
        id: 11, fullName: 'Belinga Cyrille', email: 'cyrille.b@microscore.cm',
        telephone: '+237 688 555 666', role: 'ADMIN', statut: 'BLOQUE',
        derniereConnexion: '01/06/2026 à 11:00',
        dateCreation: '20/05/2022',
        permissions: ['Tous les accès'], infos: {},
      },
    };

    const found = mockUsers[id];
    if (found) {
      this.user.set(found);
      if (found.role === 'CLIENT') {
        this.loadClientMockData();
      }
    } else {
      this.user.set({
        id,
        fullName: `Utilisateur #${id}`,
        email: 'inconnu@microscore.cm',
        telephone: '-',
        role: 'CLIENT',
        statut: 'ACTIF',
        infos: {},
      });
    }
    this.loading.set(false);
  }

  private loadClientMockData() {
    this.loans.set([
      { date: '2026-01-10', motif: 'Achat Matériel', montant: 500000, taux: 5, total: 525000, statut: 'ACCORDÉ' },
      { date: '2026-03-15', motif: 'Frais Scolaires', montant: 200000, taux: 7, total: 214000, statut: 'REFUSÉ' },
      { date: '2026-05-20', motif: 'Commerce', montant: 350000, taux: 5, total: 367500, statut: 'EN_ATTENTE' },
    ]);
    this.repayments.set([
      { id: 1, dateEmprunt: '2026-01-10', montantEmprunte: 500000, tauxInteret: 5, totalARembourser: 525000, montantRembourse: 525000, dateRemboursement: '2026-03-10', mode: 'Virement', resteARembourser: 0, statut: 'À temps' },
      { id: 2, dateEmprunt: '2026-04-15', montantEmprunte: 300000, tauxInteret: 5, totalARembourser: 315000, montantRembourse: 100000, dateRemboursement: '2026-05-15', mode: 'Cash', resteARembourser: 215000, statut: 'En retard' },
      { id: 3, dateEmprunt: '2026-06-01', montantEmprunte: 100000, tauxInteret: 5, totalARembourser: 105000, montantRembourse: 0, dateRemboursement: '-', mode: '-', resteARembourser: 105000, statut: 'Non remboursé' },
    ]);
    this.scoringParams.set([
      {
        critere: 'Profil sociodémographique', poids: 20, pourcentageObtenu: 18,
        details: [
          { libelle: 'Âge', note: 'les 35 ans et plus sont généralement favorisés' },
          { libelle: 'Situation matrimoniale', note: 'marié(e) = stabilité perçue' },
          { libelle: 'Niveau d\'éducation', note: '' },
          { libelle: 'Ancienneté dans la zone géographique', note: 'stabilité résidentielle' },
          { libelle: 'Nombre de personne à charge', note: '' },
        ],
      },
      {
        critere: 'Capacité de remboursements', poids: 35, pourcentageObtenu: 30,
        details: [
          { libelle: 'Revenus mensuels nets', note: 'formels ou informels' },
          { libelle: 'Charges fixes', note: 'loyer, autres dettes' },
          { libelle: 'Taux d\'endettement', note: 'total mensualités / revenu' },
          { libelle: 'Flux de trésorerie de l\'activité', note: 'pour les entrepreneurs' },
        ],
      },
      {
        critere: 'Historique de crédits', poids: 15, pourcentageObtenu: 12,
        details: [
          { libelle: 'Comportement sur les prêts précédents', note: 'retards, défauts' },
          { libelle: 'Nombre de prêts en cours', note: '' },
          { libelle: 'Ancienneté comme client de la microfinance', note: '' },
        ],
      },
      {
        critere: 'Activités économiques / business', poids: 15, pourcentageObtenu: 13,
        details: [
          { libelle: 'Type d\'activité', note: 'Commerce, artisanat, agriculture...' },
          { libelle: 'Ancienneté de l\'entreprise', note: '' },
          { libelle: 'Chiffre d\'affaires et bénéfices estimés', note: '' },
          { libelle: 'Secteur d\'activité', note: 'certains secteurs sont jugés plus risqués' },
        ],
      },
      {
        critere: 'Garanties et collatéraux', poids: 10, pourcentageObtenu: 6,
        details: [
          { libelle: 'Garantie personnelle', note: 'caution solidaire, groupe de solidarité' },
          { libelle: 'Garantie matérielle', note: 'bien mobilier, immobilier' },
          { libelle: 'Épargne constituée auprès de l\'institution', note: '' },
        ],
      },
      {
        critere: 'Facteurs comportementaux et qualitatifs', poids: 5, pourcentageObtenu: 2,
        details: [
          { libelle: 'Motivation et projet clair', note: 'évalué lors de l\'entretien' },
          { libelle: 'Réputation dans la communauté', note: '' },
          { libelle: 'Régularité de l\'épargne', note: '' },
        ],
      },
    ]);
  }

  getInitials(name: string): string {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'CLIENT': return 'bg-blue-50/80 text-blue-700 ring-blue-600/20';
      case 'GESTIONNAIRE': return 'bg-emerald-50/80 text-emerald-700 ring-emerald-600/20';
      case 'ADMIN': return 'bg-purple-50/80 text-purple-700 ring-purple-600/20';
      default: return 'bg-gray-50 text-gray-700 ring-gray-600/20';
    }
  }

  getStatusBadgeClass(statut: string): string {
    switch (statut) {
      case 'ACTIF': return 'bg-green-50/80 text-green-700 ring-green-600/20';
      case 'BLOQUE': return 'bg-red-50/80 text-red-700 ring-red-600/20';
      case 'EN_ATTENTE': return 'bg-amber-50/80 text-amber-700 ring-amber-600/20';
      default: return 'bg-gray-50 text-gray-700 ring-gray-600/20';
    }
  }

  // Scoring modal
  openModal(mode: 'add' | 'edit', item: any = null) {
    this.modalMode.set(mode);
    this.currentCritere.set(
      item ? { ...item } : { critere: '', poids: 0, pourcentageObtenu: 0, details: [] }
    );
    this.showModal.set(true);
  }

  closeModal() { this.showModal.set(false); }

  saveCritere() {
    if (this.modalMode() === 'add') {
      this.scoringParams.update((list) => [...list, this.currentCritere()]);
    } else {
      this.scoringParams.update((list) =>
        list.map((c) => c.critere === this.currentCritere().critere ? this.currentCritere() : c)
      );
    }
    this.closeModal();
  }

  deleteCritere(item: any) {
    if (confirm(`Voulez-vous vraiment supprimer le critère : ${item.critere} ?`)) {
      this.scoringParams.update((list) => list.filter((c) => c !== item));
    }
  }

  addDetail() { this.currentCritere().details.push({ libelle: '', note: '' }); }

  removeDetail(index: number) { this.currentCritere().details.splice(index, 1); }
}
