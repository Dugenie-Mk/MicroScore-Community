import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

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
  protected readonly layout = inject(LayoutService);

  protected readonly groups: NavGroup[] = [
    {
      title: 'Menu',
      items: [
        { label: 'Tableau de bord', route: '/dashboard', icon: 'home', exact: true },
        { label: 'Prêts', route: '/loans', icon: 'document' },
        { label: 'Remboursements', route: '/repayments', icon: 'cash' },
        { label: 'Scoring', route: '/scoring', icon: 'chart' },
      ],
    },
    {
      title: 'Gestion',
      items: [
        { label: 'Utilisateurs', route: '/users', icon: 'users' },
        { label: 'Profil', route: '/profile', icon: 'user' },
      ],
    },
  ];
}
