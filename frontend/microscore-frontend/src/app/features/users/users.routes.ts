import { Routes } from '@angular/router';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/user-list/user-list').then((m) => m.UserListComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/user-detail/user-detail').then((m) => m.UserDetailComponent),
  },
];
