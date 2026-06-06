import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email: string = '';
  password: string = '';

  constructor(private router: Router) {}

  onLogin() {
    if (this.email && this.password) {
      console.log('Connexion avec:', this.email);
      // Redirection vers le dashboard
      this.router.navigate(['/dashboard']);
    } else {
      alert('Veuillez remplir tous les champs !');
    }
  }
}