import { Routes } from '@angular/router';

export const LOANS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/loan-list/loan-list').then((m) => m.LoanList),
    data: {
      title: 'Prêts',
      description: 'Gestion des demandes de prêt, analyse du score et suivi des prêts.',
    },
  },
  {
    path: 'client/:id',
    loadComponent: () =>
      import('./pages/loan-detail/loan-detail').then((m) => m.LoanDetail),
    data: {
      title: 'Détails client',
    },
  },
];
