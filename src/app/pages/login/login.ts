import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  standalone: true
})
export class Login {
  nombreUsuario = '';
  contrasena = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  login() {
    console.log('Enviando:', this.nombreUsuario, this.contrasena); // debug

    this.authService.login(this.nombreUsuario, this.contrasena).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('rol', res.rol);
        this.authService.guardarUsuario(this.nombreUsuario);
        this.router.navigate(['/inicio']);
      },
      error: (err) => {
        alert('Usuario o contraseña incorrecta');
        console.error(err);
      }
    });
  }
}
