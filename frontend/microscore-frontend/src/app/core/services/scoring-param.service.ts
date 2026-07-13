import { Injectable, signal, inject } from '@angular/core';
import { ToastService } from './toast.service';

export interface Detail {
  id: number;
  nom: string;
}

export interface Parametre {
  id: number;
  nom: string;
  poids: number;
  details: Detail[];
}

@Injectable({ providedIn: 'root' })
export class ScoringParamService {
  private readonly toast = inject(ToastService);

  readonly parametres = signal<Parametre[]>([
    {
      id: 1, nom: 'Profil sociodémographique', poids: 20,
      details: [
        { id: 1, nom: 'Âge' },
        { id: 2, nom: 'Situation matrimoniale' },
        { id: 3, nom: "Nombre de personnes à charge" },
        { id: 4, nom: "Niveau d'éducation" },
      ],
    },
    {
      id: 2, nom: 'Capacité de remboursements', poids: 35,
      details: [
        { id: 5, nom: 'Revenus mensuels' },
        { id: 6, nom: 'Charges mensuelles' },
        { id: 7, nom: "Ratio d'endettement" },
        { id: 8, nom: 'Stabilité des revenus' },
      ],
    },
    {
      id: 3, nom: 'Historique de crédits', poids: 15,
      details: [
        { id: 9, nom: 'Antécédents de crédit' },
        { id: 10, nom: 'Comportement de remboursement' },
        { id: 11, nom: 'Nombre de crédits antérieurs' },
      ],
    },
    {
      id: 4, nom: 'Activités économiques', poids: 15,
      details: [
        { id: 12, nom: "Secteur d'activité" },
        { id: 13, nom: "Ancienneté de l'activité" },
        { id: 14, nom: "Chiffre d'affaires" },
      ],
    },
    {
      id: 5, nom: 'Garanties et collatéraux', poids: 10,
      details: [
        { id: 15, nom: 'Type de garantie' },
        { id: 16, nom: 'Valeur de la garantie' },
        { id: 17, nom: 'Qualité du collatéral' },
      ],
    },
    {
      id: 6, nom: 'Facteurs comportementaux', poids: 5,
      details: [
        { id: 18, nom: 'Ponctualité des rendez-vous' },
        { id: 19, nom: 'Réactivité aux relances' },
        { id: 20, nom: 'Comportement général' },
      ],
    },
  ]);

  private nextParamId = 7;
  private nextDetailId = 21;

  saveParam(p: Parametre): void {
    this.parametres.update((items) =>
      items.map((x) => (x.id === p.id ? { ...p, details: [...p.details] } : x))
    );
    this.toast.show('Critère « ' + p.nom + ' » modifié', 'info');
  }

  deleteParam(id: number): void {
    const item = this.parametres().find((x) => x.id === id);
    this.parametres.update((items) => items.filter((x) => x.id !== id));
    this.toast.show('Critère « ' + (item?.nom ?? '') + ' » supprimé', 'warning');
  }

  addParam(nom: string, poids: number): void {
    this.parametres.update((items) => [
      ...items,
      { id: this.nextParamId++, nom, poids, details: [] },
    ]);
    this.toast.show('Critère « ' + nom + ' » ajouté', 'success');
  }

  saveDetail(paramId: number, detail: Detail): void {
    this.parametres.update((items) =>
      items.map((p) =>
        p.id === paramId
          ? { ...p, details: p.details.map((d) => (d.id === detail.id ? { ...detail } : d)) }
          : p
      )
    );
    this.toast.show('Sous-critère mis à jour', 'info');
  }

  deleteDetail(paramId: number, detailId: number): void {
    const parent = this.parametres().find((p) => p.id === paramId);
    const item = parent?.details.find((d) => d.id === detailId);
    this.parametres.update((items) =>
      items.map((p) =>
        p.id === paramId
          ? { ...p, details: p.details.filter((d) => d.id !== detailId) }
          : p
      )
    );
    this.toast.show('Sous-critère « ' + (item?.nom ?? '') + ' » supprimé', 'warning');
  }

  addDetail(paramId: number, nom: string): void {
    this.parametres.update((items) =>
      items.map((p) =>
        p.id === paramId
          ? { ...p, details: [...p.details, { id: this.nextDetailId++, nom }] }
          : p
      )
    );
    this.toast.show('Sous-critère « ' + nom + ' » ajouté', 'success');
  }

  get nextDetailIdVal(): number { return this.nextDetailId; }
}
