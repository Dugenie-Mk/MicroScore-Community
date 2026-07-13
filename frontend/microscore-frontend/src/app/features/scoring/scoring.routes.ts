import { Routes } from '@angular/router';

export const SCORING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/scoring-page/scoring-page').then((m) => m.ScoringPage),
    data: {
      title: 'Scoring -Test',
      description: 'Paramètres de scoring (poids des critères) et calcul des scores de crédit.',
    },
  },
];
