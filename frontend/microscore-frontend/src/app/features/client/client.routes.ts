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
        path: 'loans/:id',
        loadComponent: () =>
          import('./pages/client-loan-detail/client-loan-detail').then((m) => m.ClientLoanDetail),
      },
      {
        path: 'repayments',
        loadComponent: () =>
          import('./pages/client-repayments/client-repayments').then((m) => m.ClientRepayments),
      },
      {
        path: 'repayments/:id',
        loadComponent: () =>
          import('./pages/client-repayment-detail/client-repayment-detail').then((m) => m.ClientRepaymentDetail),
      },
      {
        path: 'repayment-request',
        loadComponent: () =>
          import('./pages/client-repayment-form/client-repayment-form').then((m) => m.ClientRepaymentForm),
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
