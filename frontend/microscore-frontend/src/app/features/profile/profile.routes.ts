import { Routes } from '@angular/router';

export const PROFILE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/profile-page/profile-page').then((m) => m.ProfilePage),
    data: {
      title: 'Mon profil',
      description: 'Consultez et mettez à jour vos informations personnelles.',
    },
  },
];
