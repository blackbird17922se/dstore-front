import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
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

  // Estados exclusivos de la interfaz. No alteran JWT ni la autenticación.
  mostrarContrasena = false;
  enviando = false;
  mensajeError = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  alternarContrasena(): void {
    this.mostrarContrasena = !this.mostrarContrasena;
  }

  login(): void {
    // Impide envíos duplicados y credenciales con solo espacios.
    if (this.enviando || !this.nombreUsuario.trim() || !this.contrasena) {
      return;
    }

    this.mensajeError = '';
    this.enviando = true;

    this.authService.login(this.nombreUsuario.trim(), this.contrasena).subscribe({
      next: () => {
        // AuthService almacena la respuesta y mantiene la cookie HttpOnly.
        // No duplicar aquí el manejo de la sesión.

        this.enviando = false;
        this.router.navigate(['/inicio'], { replaceUrl: true });
      },
      error: (err: HttpErrorResponse) => {
        this.enviando = false;

        if (err.status === 401 || err.status === 403) {
          this.mensajeError = 'Usuario o contraseña incorrectos.';
        } else if (err.status === 0) {
          this.mensajeError = 'No fue posible conectar con DStore. Revisa tu conexión e inténtalo de nuevo.';
        } else {
          this.mensajeError = 'No se pudo iniciar sesión. Inténtalo nuevamente.';
        }

        // No registramos credenciales ni el contenido completo del error.
        console.warn('No se pudo iniciar sesión. Estado HTTP:', err.status);
      }
    });
  }
}
