import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

// LAYOUT : barre de navigation affichee sur toutes les pages.
@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {}
