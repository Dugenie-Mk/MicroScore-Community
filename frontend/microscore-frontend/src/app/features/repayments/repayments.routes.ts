import { Routes } from '@angular/router';

export const REPAYMENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../../shared/components/coming-soon/coming-soon').then((m) => m.ComingSoon),
    data: {
      title: 'Remboursements',
      description: 'Échéanciers, enregistrement des paiements et suivi des impayés.',
    },
  },
];
