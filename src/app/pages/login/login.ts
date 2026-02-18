import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  providers: [AuthService],
})
export class Login {
  nombreUsuario = '';
  contrasena = '';

  constructor(private authService: AuthService) { }
  login() {
    console.log('Enviando:', this.nombreUsuario, this.contrasena); // debug

    this.authService.login(this.nombreUsuario, this.contrasena).subscribe({
      next: (res) => {
        alert(res.mensaje); // ahora muestra "Autenticación exitosa"
        console.log(res);
        // aquí podrías guardar el token / info usuario en localStorage
      },
      error: (err) => {
        alert('Usuario o contraseña incorrecta');
        console.error(err);
      }
    });
  }
}
