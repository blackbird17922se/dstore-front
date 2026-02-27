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
        alert(res.mensaje); // ahora muestra "Autenticación exitosa"
        console.log(res);
        console.log('ANTES DE GUARDAR', this.authService.isLoggedIn());
        // aquí podrías guardar el token / info usuario en localStorage
        this.authService.guardarUsuario(this.nombreUsuario);
        console.log('DESPUÉS DE GUARDAR', this.authService.isLoggedIn());
        this.router.navigate(['/inicio']);
      },
      error: (err) => {
        alert('Usuario o contraseña incorrecta');
        console.error(err);
      }
    });
  }
}
