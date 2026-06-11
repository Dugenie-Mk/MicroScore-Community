import { Routes } from '@angular/router';

export const LOANS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../../shared/components/coming-soon/coming-soon').then((m) => m.ComingSoon),
    data: {
      title: 'Prêts',
      description: 'Gestion des demandes de prêt, analyse du score et suivi des prêts.',
    },
  },
];
