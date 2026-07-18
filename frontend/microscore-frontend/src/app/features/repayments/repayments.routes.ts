import { Routes } from '@angular/router';

export const REPAYMENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/repayment-list/repayment-list').then((m) => m.RepaymentList),
  },
];
