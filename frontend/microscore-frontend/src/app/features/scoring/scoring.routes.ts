import { Routes } from '@angular/router';

export const SCORING_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'parametres',
    pathMatch: 'full',
  },
  {
    path: 'parametres',
    loadComponent: () =>
      import('./pages/scoring-page/scoring-page').then((m) => m.ScoringPage),
    data: {
      title: 'Paramètres de scoring',
      description: 'Poids des critères et configuration de la grille de scoring.',
    },
  },
  {
    path: 'resultats',
    loadComponent: () =>
      import('./pages/score-results-page/score-results-page').then((m) => m.ScoreResultsPage),
    data: {
      title: 'Résultats de scoring',
      description: 'Historique des scores calculés avec le détail par critère.',
    },
  },
];
