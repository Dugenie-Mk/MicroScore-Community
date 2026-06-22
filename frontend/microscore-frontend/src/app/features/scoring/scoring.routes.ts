import { Routes } from '@angular/router';

export const SCORING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../../shared/components/coming-soon/coming-soon').then((m) => m.ComingSoon),
    data: {
      title: 'Scoring -Test',
      description: 'Paramètres de scoring (poids des critères) et calcul des scores de crédit.',
    },
  },
];
