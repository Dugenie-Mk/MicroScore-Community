import { Component, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { LayoutService } from '../../core/services/layout.service';

interface NavItem {
  label: string;
  route: string;
  icon: 'home' | 'document' | 'cash' | 'chart' | 'users' | 'user';
  exact?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
})
export class Sidebar {
  protected readonly auth = inject(AuthService);
  protected readonly layout = inject(LayoutService);

  protected readonly isAdmin = computed(() => this.auth.currentUser()?.role === 'ADMIN');

  protected readonly groups = computed<NavGroup[]>(() => [
    {
      title: 'Menu',
      items: [
        { label: 'Tableau de bord', route: '/dashboard', icon: 'home', exact: true },
        { label: 'Prêts', route: '/loans', icon: 'document' },
        { label: 'Remboursements', route: '/repayments', icon: 'cash' },
        { label: 'Paramètres scoring', route: '/scoring/parametres', icon: 'chart' },
        { label: 'Résultats scoring', route: '/scoring/resultats', icon: 'chart' },
      ],
    },
    {
      title: 'Gestion',
      items: [
        {
          label: this.isAdmin() ? 'Utilisateurs' : 'Clients',
          route: '/users',
          icon: 'users',
        },
        { label: 'Profil', route: '/profile', icon: 'user' },
      ],
    },
  ]);
}
