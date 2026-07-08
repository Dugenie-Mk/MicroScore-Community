import { Routes } from '@angular/router';
import { ClientLayout } from './client-layout/client-layout';

export const CLIENT_ROUTES: Routes = [
  {
    path: '',
    component: ClientLayout,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/client-dashboard/client-dashboard').then((m) => m.ClientDashboard),
      },
      {
        path: 'loans',
        loadComponent: () =>
          import('./pages/client-loans/client-loans').then((m) => m.ClientLoans),
      },
      {
        path: 'loan-request',
        loadComponent: () =>
          import('./pages/client-loan-form/client-loan-form').then((m) => m.ClientLoanForm),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./pages/client-profile/client-profile').then((m) => m.ClientProfile),
      },
    ],
  },
];
