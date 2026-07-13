import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

import { LayoutService } from '../../core/services/layout.service';
import { ToastService } from '../../core/services/toast.service';
import { Sidebar } from '../sidebar/sidebar';
import { Topbar } from '../topbar/topbar';

@Component({
  selector: 'app-main-layout',
  imports: [CommonModule, RouterOutlet, Sidebar, Topbar],
  templateUrl: './main-layout.html',
})
export class MainLayout {
  protected readonly layout = inject(LayoutService);
  protected readonly toast = inject(ToastService);
}
