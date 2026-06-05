import { Routes } from '@angular/router';

import { Login } from './login/login';

// Routes de la feature "auth" (chargees en lazy loading depuis app.routes.ts).
export const AUTH_ROUTES: Routes = [
  { path: 'login', component: Login },
];
