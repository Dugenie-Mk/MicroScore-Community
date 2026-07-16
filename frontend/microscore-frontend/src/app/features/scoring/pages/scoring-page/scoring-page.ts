import { Component, computed, inject, signal } from '@angular/core';
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
  protected editingPoids: number | null = null;
  protected editingPoidsVal = 0;
  protected showAddParam = false;
  protected readonly showAddDetailFor = signal<number | null>(null);
  protected tempDetails = signal<string[]>([]);

  protected openAddParamForm(): void {
    this.tempDetails.set([]);
    this.showAddParam = true;
    setTimeout(() => {
      const el = document.getElementById('addParamSection');
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  }

  protected readonly remainingWeight = computed(() => {
    const used = this.service.parametres().reduce((s, p) => s + p.poids, 0);
    return Math.max(0, 100 - used);
  });

  protected toggleAddDetail(paramId: number): void {
    this.showAddDetailFor.update((v) => (v === paramId ? null : paramId));
  }

  protected startEditParam(p: Parametre): void {
    const nouveauNom = prompt('Modifier le nom du critère :', p.nom);
    if (nouveauNom && nouveauNom.trim() && nouveauNom.trim() !== p.nom) {
      this.service.saveParam({ ...p, nom: nouveauNom.trim(), details: [...p.details] });
    }
  }

  protected startPoidsEdit(p: Parametre): void {
    this.editingPoids = p.id;
    this.editingPoidsVal = p.poids;
    this.editingParam = null;
    this.cancelEditDetail();
  }

  protected cancelPoidsEdit(): void {
    this.editingPoids = null;
  }

  protected savePoids(paramId: number): void {
    this.service.savePoids(paramId, this.editingPoidsVal);
    this.editingPoids = null;
  }

  protected deleteParam(id: number): void {
    if (!confirm('Supprimer ce critère et tous ses détails ?')) return;
    this.service.deleteParam(id);
  }

  protected addDetailTemp(input: HTMLInputElement): void {
    const nom = input.value.trim();
    if (!nom) return;
    this.tempDetails.update((list) => [...list, nom]);
    input.value = '';
  }

  protected removeDetailTemp(idx: number): void {
    this.tempDetails.update((list) => list.filter((_, i) => i !== idx));
  }

  protected createParamWithDetails(nomInput: HTMLInputElement, poidsInput: HTMLInputElement, detailInput: HTMLInputElement): void {
    const nom = nomInput.value.trim();
    const poids = +poidsInput.value || this.remainingWeight();
    if (!nom || poids <= 0 || poids > 100) return;
    const pendingDetail = detailInput.value.trim();
    const allDetails = pendingDetail ? [...this.tempDetails(), pendingDetail] : this.tempDetails();
    this.service.addParam(nom, poids);
    const newParam = this.service.parametres().at(-1);
    if (newParam) {
      for (const d of allDetails) {
        this.service.addDetail(newParam.id, d);
      }
    }
    this.tempDetails.set([]);
    this.showAddParam = false;
  }

  protected startEditDetail(paramId: number, detail: Detail): void {
    this.editingDetail = { paramId, detail: { ...detail } };
    this.editingParam = null;
    this.cancelPoidsEdit();
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

  protected addDetail(paramId: number, input: HTMLInputElement): void {
    const nom = input.value.trim();
    if (!nom) return;
    this.service.addDetail(paramId, nom);
    input.value = '';
    this.showAddDetailFor.set(null);
  }

  protected totalPoids = computed(() =>
    this.service.parametres().reduce((s, p) => s + p.poids, 0)
  );

  protected readonly palette = [
    { from: 'from-violet-500', to: 'to-purple-500', bg: 'bg-violet-500' },
    { from: 'from-emerald-500', to: 'to-teal-500', bg: 'bg-emerald-500' },
    { from: 'from-amber-500', to: 'to-orange-500', bg: 'bg-amber-500' },
    { from: 'from-blue-500', to: 'to-cyan-500', bg: 'bg-blue-500' },
    { from: 'from-rose-500', to: 'to-pink-500', bg: 'bg-rose-500' },
    { from: 'from-teal-500', to: 'to-emerald-500', bg: 'bg-teal-500' },
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
