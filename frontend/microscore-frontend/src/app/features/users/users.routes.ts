import { Routes } from '@angular/router';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../../shared/components/coming-soon/coming-soon').then((m) => m.ComingSoon),
    data: {
      title: 'Utilisateurs',
      description: 'Création, validation, modification et suppression des comptes utilisateurs.',
    },
  },
];
