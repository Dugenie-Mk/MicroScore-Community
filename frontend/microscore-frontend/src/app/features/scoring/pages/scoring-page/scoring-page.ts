import { Component, OnInit, computed, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { ScoringParamService, ParametreDeScoring, BLOC_ORDER } from '../../../../core/services/scoring-param.service';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal';
import { ToastService } from '../../../../core/services/toast.service';

const BLOC_LABELS: Record<string, string> = {
  PROFIL_SOCIODEMOGRAPHIQUE: 'Profil sociodémographique',
  CAPACITE_REMBOURSEMENT: 'Capacité de remboursement',
  MONTANT_DUREE: 'Montant et durée',
  HISTORIQUE_CREDIT: 'Historique de crédit',
  ACTIVITE_ECONOMIQUE: 'Activité économique',
  GARANTIES: 'Garanties et collatéraux',
  FACTEURS_COMPORTEMENTAUX: 'Facteurs comportementaux',
};

@Component({
  selector: 'app-scoring-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModalComponent],
  templateUrl: './scoring-page.html',
})
export class ScoringPage implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  protected readonly service = inject(ScoringParamService);

  @ViewChild('confirmModal') protected confirmModal!: ConfirmModalComponent;

  ngOnInit(): void {
    this.service.loadAll();
  }

  protected readonly isAdmin = computed(() => this.auth.currentUser()?.role === 'ADMIN');

  protected editingCritere: ParametreDeScoring | null = null;
  protected editingNomVal = '';

  protected editingPoidsId: number | null = null;
  protected editingPoidsVal = 0;

  protected showAddForm = false;
  protected newBloc = BLOC_ORDER[0];
  protected newBlocOpen = false;

  protected readonly remainingWeight = computed(() => {
    const total = this.service.totalPoids();
    return Math.max(0, 100 - total);
  });

  protected readonly palette = [
    { bg: 'bg-violet-500', from: 'from-violet-500', to: 'to-purple-600', light: 'bg-violet-100 dark:bg-violet-900/20', text: 'text-violet-700 dark:text-violet-300', border: 'border-violet-200 dark:border-violet-800' },
    { bg: 'bg-emerald-500', from: 'from-emerald-500', to: 'to-teal-600', light: 'bg-emerald-100 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' },
    { bg: 'bg-amber-500', from: 'from-amber-500', to: 'to-orange-600', light: 'bg-amber-100 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' },
    { bg: 'bg-blue-500', from: 'from-blue-500', to: 'to-cyan-600', light: 'bg-blue-100 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
    { bg: 'bg-rose-500', from: 'from-rose-500', to: 'to-pink-600', light: 'bg-rose-100 dark:bg-rose-900/20', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800' },
    { bg: 'bg-cyan-500', from: 'from-cyan-500', to: 'to-sky-600', light: 'bg-cyan-100 dark:bg-cyan-900/20', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-200 dark:border-cyan-800' },
    { bg: 'bg-orange-500', from: 'from-orange-500', to: 'to-red-600', light: 'bg-orange-100 dark:bg-orange-900/20', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800' },
    { bg: 'bg-teal-500', from: 'from-teal-500', to: 'to-emerald-600', light: 'bg-teal-100 dark:bg-teal-900/20', text: 'text-teal-700 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-800' },
  ];

  protected readonly segments = computed(() => {
    const total = this.service.totalPoids();
    if (total === 0) return [];
    return this.service.criteres().filter(c => c.actif).map((c, i) => ({
      id: c.id,
      nom: c.nomCritere,
      poids: c.poidsCritere,
      pct: total > 0 ? (c.poidsCritere / total) * 100 : 0,
      color: this.palette[i % this.palette.length],
    }));
  });

  protected readonly isValid = computed(() => this.service.totalPoids() === 100);

  protected startEditName(c: ParametreDeScoring): void {
    this.editingCritere = (this.editingCritere?.id === c.id) ? null : c;
    this.editingNomVal = c.nomCritere;
    this.editingPoidsId = null;
  }

  protected saveCritereName(c: ParametreDeScoring): void {
    const nom = this.editingNomVal.trim();
    if (!nom || nom === c.nomCritere) { this.editingCritere = null; return; }
    this.service.update(c.id, { nomCritere: nom });
    this.editingCritere = null;
  }

  protected cancelEditName(): void {
    this.editingCritere = null;
  }

  protected startPoidsEdit(id: number, poids: number): void {
    this.editingPoidsId = id;
    this.editingPoidsVal = poids;
    this.editingCritere = null;
  }

  protected savePoids(id: number): void {
    if (this.editingPoidsVal < 0 || this.editingPoidsVal > 100) return;
    this.service.changePoids(id, this.editingPoidsVal);
    this.editingPoidsId = null;
  }

  protected cancelPoidsEdit(): void {
    this.editingPoidsId = null;
  }

  protected async deleteCritere(id: number): Promise<void> {
    const confirmed = await this.confirmModal.open({
      title: 'Supprimer le critère',
      message: 'Êtes-vous sûr de vouloir supprimer ce critère de scoring ? Cette action est irréversible.',
      confirmLabel: 'Supprimer',
      type: 'danger',
    });
    if (!confirmed) return;
    this.service.delete(id);
    this.toast.show('Critère supprimé avec succès.', 'success');
  }

  protected toggleActif(c: ParametreDeScoring): void {
    this.service.toggleActif(c.id);
  }

  protected async createCritere(nomInput: HTMLInputElement, poidsInput: HTMLInputElement): Promise<void> {
    const nom = nomInput.value.trim();
    const poids = +poidsInput.value || 0;
    if (!nom || poids <= 0 || poids > 100) return;
    await this.service.create({ blocCritere: this.newBloc, nomCritere: nom, poidsCritere: poids });
    nomInput.value = '';
    poidsInput.value = '';
    this.newBloc = BLOC_ORDER[0];
    this.showAddForm = false;
  }

  protected readonly blocOptions = BLOC_ORDER.map(b => ({ value: b, label: BLOC_LABELS[b] ?? b }));

  protected blocLabel(bloc: string): string {
    return BLOC_LABELS[bloc] ?? bloc;
  }

  protected readonly totalCriteres = computed(() => this.service.criteres().length);

  protected readonly totalActifs = computed(() => this.service.criteres().filter(c => c.actif).length);
}
