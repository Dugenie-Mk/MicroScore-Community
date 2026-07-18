import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ToastService } from './toast.service';
import { lastValueFrom } from 'rxjs';

export interface ParametreDeScoring {
  id: number;
  blocCritere: string;
  nomCritere: string;
  poidsCritere: number;
  actif: boolean;
  description?: string;
}

export interface BlocGroupe {
  bloc: string;
  label: string;
  criteres: ParametreDeScoring[];
}

const BLOC_LABELS: Record<string, string> = {
  PROFIL_SOCIODEMOGRAPHIQUE: 'Profil sociodémographique',
  CAPACITE_REMBOURSEMENT: 'Capacité de remboursement',
  MONTANT_DUREE: 'Montant et durée',
  HISTORIQUE_CREDIT: 'Historique de crédit',
  ACTIVITE_ECONOMIQUE: 'Activité économique',
  GARANTIES: 'Garanties et collatéraux',
  FACTEURS_COMPORTEMENTAUX: 'Facteurs comportementaux',
};

export const BLOC_ORDER = [
  'PROFIL_SOCIODEMOGRAPHIQUE',
  'CAPACITE_REMBOURSEMENT',
  'MONTANT_DUREE',
  'HISTORIQUE_CREDIT',
  'ACTIVITE_ECONOMIQUE',
  'GARANTIES',
  'FACTEURS_COMPORTEMENTAUX',
];

@Injectable({ providedIn: 'root' })
export class ScoringParamService {
  private readonly http = inject(HttpClient);
  private readonly toast = inject(ToastService);
  private readonly apiUrl = `${environment.apiUrl}/api/parametres-scoring`;

  readonly criteres = signal<ParametreDeScoring[]>([]);
  readonly loading = signal(false);

  readonly blocs = computed<BlocGroupe[]>(() => {
    const groups = new Map<string, ParametreDeScoring[]>();
    for (const c of this.criteres()) {
      if (!groups.has(c.blocCritere)) groups.set(c.blocCritere, []);
      groups.get(c.blocCritere)!.push(c);
    }
    return BLOC_ORDER
      .filter((b) => groups.has(b))
      .map((bloc) => ({
        bloc,
        label: BLOC_LABELS[bloc] ?? bloc,
        criteres: groups.get(bloc)!,
      }));
  });

  readonly totalPoids = computed(() =>
    this.criteres().reduce((s, c) => s + (c.actif ? c.poidsCritere : 0), 0)
  );

  async loadAll(): Promise<void> {
    this.loading.set(true);
    try {
      const data = await lastValueFrom(this.http.get<ParametreDeScoring[]>(this.apiUrl));
      this.criteres.set(data);
    } catch {
      this.toast.show('Erreur chargement paramètres de scoring', 'error');
    } finally {
      this.loading.set(false);
    }
  }

  async create(dto: Partial<ParametreDeScoring>): Promise<ParametreDeScoring | null> {
    try {
      const created = await lastValueFrom(
        this.http.post<ParametreDeScoring>(this.apiUrl, {
          blocCritere: dto.blocCritere,
          nomCritere: dto.nomCritere,
          poidsCritere: dto.poidsCritere,
          actif: true,
          description: dto.description ?? '',
        })
      );
      this.criteres.update((list) => [...list, created]);
      this.toast.show(`Critère « ${created.nomCritere} » ajouté`, 'success');
      return created;
    } catch {
      this.toast.show('Erreur création critère', 'error');
      return null;
    }
  }

  async update(id: number, partial: Partial<ParametreDeScoring>): Promise<void> {
    const existing = this.criteres().find((c) => c.id === id);
    if (!existing) return;
    try {
      const updated = await lastValueFrom(
        this.http.put<ParametreDeScoring>(`${this.apiUrl}/${id}`, { ...existing, ...partial })
      );
      this.criteres.update((list) => list.map((c) => (c.id === id ? updated : c)));
    } catch {
      this.toast.show('Erreur modification critère', 'error');
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await lastValueFrom(this.http.delete(`${this.apiUrl}/${id}`));
      this.criteres.update((list) => list.filter((c) => c.id !== id));
      this.toast.show('Critère supprimé', 'warning');
    } catch {
      this.toast.show('Erreur suppression critère', 'error');
    }
  }

  async toggleActif(id: number): Promise<void> {
    const c = this.criteres().find((x) => x.id === id);
    if (!c) return;
    await this.update(id, { actif: !c.actif });
  }

  async changePoids(id: number, poids: number): Promise<void> {
    await this.update(id, { poidsCritere: poids });
  }
}
