import { Routes } from '@angular/router';

export const PROFILE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../../shared/components/coming-soon/coming-soon').then((m) => m.ComingSoon),
    data: {
      title: 'Mon profil',
      description: 'Consultez et mettez à jour vos informations personnelles.',
    },
  },
];
