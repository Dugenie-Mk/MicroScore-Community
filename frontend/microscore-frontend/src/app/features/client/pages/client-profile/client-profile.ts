import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AuthService, DocumentInfo, ScoringCritere } from '../../../../core/services/auth.service';
import { ScoringParamService } from '../../../../core/services/scoring-param.service';

@Component({
  selector: 'app-client-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './client-profile.html',
})
export class ClientProfile {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly scoringParams = inject(ScoringParamService);
  protected readonly totalPoids = computed(() =>
    this.scoringParams.parametres().reduce((s, p) => s + p.poids, 0)
  );
  protected readonly user = computed(() => this.auth.currentUser());
  protected readonly scoreTotal = computed(() => this.user()?.scoring?.scoreTotal ?? 0);
  protected readonly criteres = computed(() => this.user()?.scoring?.criteres ?? []);
  protected readonly risqueCategorie = computed(() => {
    const s = this.scoreTotal();
    if (s >= 80) return { label: 'Faible', color: 'text-green-600', bg: 'bg-green-500', bar: 'from-green-500 to-emerald-400', light: 'bg-green-50 dark:bg-green-950/20' };
    if (s >= 60) return { label: 'Modéré', color: 'text-amber-600', bg: 'bg-amber-500', bar: 'from-amber-500 to-yellow-400', light: 'bg-amber-50 dark:bg-amber-950/20' };
    return { label: 'Élevé', color: 'text-red-600', bg: 'bg-red-500', bar: 'from-red-500 to-rose-400', light: 'bg-red-50 dark:bg-red-950/20' };
  });

  protected editing = signal(false);
  protected editForm = signal({
    telephone: '',
    dateNaissance: '',
    sexe: '',
    situationMatrimoniale: '',
    profession: '',
    secteurActivite: '',
  });

  protected startEditing(): void {
    const u = this.user();
    if (!u) return;
    this.editForm.set({
      telephone: u.telephone || '',
      dateNaissance: u.dateNaissance || '',
      sexe: u.sexe || '',
      situationMatrimoniale: u.situationMatrimoniale || '',
      profession: u.profession || '',
      secteurActivite: u.secteurActivite || '',
    });
    this.editing.set(true);
  }

  protected cancelEditing(): void {
    this.editing.set(false);
  }

  protected saveProfile(): void {
    const form = this.editForm();
    this.auth.updateProfile({
      telephone: form.telephone || undefined,
      dateNaissance: form.dateNaissance || undefined,
      sexe: form.sexe || undefined,
      situationMatrimoniale: form.situationMatrimoniale || undefined,
      profession: form.profession || undefined,
      secteurActivite: form.secteurActivite || undefined,
    });
    this.editing.set(false);
  }

  protected getInitials(): string {
    const u = this.user();
    if (!u) return '??';
    return u.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  protected getDocumentLabel(type: DocumentInfo['type']): string {
    switch (type) {
      case 'CNI': return 'Carte Nationale d\'Identité';
      case 'PASSEPORT': return 'Passeport';
      case 'CARTE_RESIDENCE': return 'Carte de Résidence';
    }
  }

  protected documentTypes: { type: DocumentInfo['type']; label: string }[] = [
    { type: 'CNI', label: 'Carte Nationale d\'Identité' },
    { type: 'PASSEPORT', label: 'Passeport' },
    { type: 'CARTE_RESIDENCE', label: 'Carte de Résidence' },
  ];

  protected getDocument(type: DocumentInfo['type']): DocumentInfo | undefined {
    return this.user()?.documents?.find((d) => d.type === type);
  }

  protected getDocumentStatut(type: DocumentInfo['type']): DocumentInfo['statut'] {
    return this.getDocument(type)?.statut || 'MANQUANT';
  }

  protected documentUploading = signal<DocumentInfo['type'] | null>(null);

  protected uploadDocument(type: DocumentInfo['type'], event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.documentUploading.set(type);
    const fakeUrl = `${type.toLowerCase()}_${Date.now()}.${file.name.split('.').pop() || 'pdf'}`;

    setTimeout(() => {
      const docs = this.user()?.documents ? [...this.user()!.documents!] : [];
      const idx = docs.findIndex((d) => d.type === type);
      if (idx >= 0) {
        docs[idx] = { ...docs[idx], fichierNom: fakeUrl, statut: 'AJOUTE', numero: docs[idx].numero || `N° ${type}-${Date.now()}` };
      } else {
        docs.push({ type, numero: `N° ${type}-${Date.now()}`, fichierNom: fakeUrl, statut: 'AJOUTE' });
      }
      this.auth.updateProfile({ documents: docs });
      this.documentUploading.set(null);
    }, 1200);

    input.value = '';
  }

  protected logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}