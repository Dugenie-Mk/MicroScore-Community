import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { ScoringParamService, Parametre, Detail } from '../../../../core/services/scoring-param.service';

@Component({
  selector: 'app-scoring-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scoring-page.html',
})
export class ScoringPage {
  private readonly auth = inject(AuthService);
  protected readonly service = inject(ScoringParamService);

  protected readonly isAdmin = computed(() => this.auth.currentUser()?.role === 'ADMIN');

  protected editingParam: Parametre | null = null;
  protected editingDetail: { paramId: number; detail: Detail } | null = null;
  protected showAddParam = false;
  protected showAddDetailFor: number | null = null;

  protected editParam(p: Parametre, field: 'nom' | 'poids', value: string | number): void {
    this.editingParam = { ...p, [field]: value };
  }

  protected startEditParam(p: Parametre): void {
    this.editingParam = { ...p, details: [...p.details] };
  }

  protected cancelEditParam(): void {
    this.editingParam = null;
  }

  protected saveParam(): void {
    const p = this.editingParam;
    if (!p || !p.nom.trim() || p.poids < 0) return;
    this.service.saveParam(p);
    this.editingParam = null;
  }

  protected deleteParam(id: number): void {
    if (!confirm('Supprimer ce critère et tous ses détails ?')) return;
    this.service.deleteParam(id);
  }

  protected addParamInline(nomInput: HTMLInputElement, poidsInput: HTMLInputElement): void {
    const nom = nomInput.value.trim();
    const poids = +poidsInput.value;
    if (!nom || poids < 0) return;
    this.service.addParam(nom, poids);
    this.showAddParam = false;
  }

  protected startEditDetail(paramId: number, detail: Detail): void {
    this.editingDetail = { paramId, detail: { ...detail } };
  }

  protected cancelEditDetail(): void {
    this.editingDetail = null;
  }

  protected saveDetail(): void {
    const ed = this.editingDetail;
    if (!ed || !ed.detail.nom.trim()) return;
    this.service.saveDetail(ed.paramId, ed.detail);
    this.editingDetail = null;
  }

  protected deleteDetail(paramId: number, detailId: number): void {
    this.service.deleteDetail(paramId, detailId);
  }

  protected addDetail(paramId: number): void {
    const nom = prompt('Nom du détail :');
    if (!nom?.trim()) return;
    this.service.addDetail(paramId, nom.trim());
    this.showAddDetailFor = null;
  }

  protected totalPoids = computed(() =>
    this.service.parametres().reduce((s, p) => s + p.poids, 0)
  );

  protected readonly palette = [
    { from: 'from-violet-500', to: 'to-purple-500', bg: 'bg-violet-500', light: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-700 dark:text-violet-300' },
    { from: 'from-emerald-500', to: 'to-teal-500', bg: 'bg-emerald-500', light: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300' },
    { from: 'from-amber-500', to: 'to-orange-500', bg: 'bg-amber-500', light: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300' },
    { from: 'from-blue-500', to: 'to-cyan-500', bg: 'bg-blue-500', light: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' },
    { from: 'from-rose-500', to: 'to-pink-500', bg: 'bg-rose-500', light: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-300' },
    { from: 'from-teal-500', to: 'to-emerald-500', bg: 'bg-teal-500', light: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-700 dark:text-teal-300' },
  ];

  protected readonly segments = computed(() => {
    const total = this.totalPoids();
    if (total === 0) return [];
    return this.service.parametres().map((p, i) => ({
      ...p,
      pct: total > 0 ? (p.poids / total) * 100 : 0,
      color: this.palette[i % this.palette.length],
    }));
  });

  protected readonly isValid = computed(() => this.totalPoids() === 100);
}
