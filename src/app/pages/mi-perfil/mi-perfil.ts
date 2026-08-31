import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';
import { PerfilUsuarioResponse } from '../../models/usuario/perfil-usuario-response.model';
import { PerfilUsuarioUpdate } from '../../models/usuario/perfil-usuario-update.model';
import { CambiarContrasenaRequest } from '../../models/usuario/cambiar-contrasena.model';

@Component({
  selector: 'app-mi-perfil',
  imports: [FormsModule],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.scss',
})
export class MiPerfil {

  perfil: PerfilUsuarioResponse | null = null;

  nombre = '';
  apellido = '';

  contrasenaActual = '';
  nuevaContrasena = '';
  confirmarContrasena = '';

  constructor(
    private usuarioService: UsuarioService
  ) {}

  ngOnInit() {
    this.cargarPerfil();
  }

  cargarPerfil() {
    this.usuarioService.obtenerPerfil().subscribe({
      next: (data) => {
        this.perfil = data;
        this.nombre = data.nombre;
        this.apellido = data.apellido;
      },
      error: (error) => {
        console.error('Error al obtener perfil:', error);
      }
    });
  }

  guardarPerfil() {
    const request: PerfilUsuarioUpdate = {
      nombre: this.nombre.trim(),
      apellido: this.apellido.trim()
    };

    this.usuarioService.actualizarPerfil(request).subscribe({
      next: (data) => {
        this.perfil = data;
        alert('Perfil actualizado correctamente');
      },
      error: (error) => {
        console.error('Error al actualizar perfil:', error);
      }
    });
  }

  guardarContrasena() {
    if (this.nuevaContrasena !== this.confirmarContrasena) {
      alert('Las nuevas contraseñas no coinciden');
      return;
    }

    const request: CambiarContrasenaRequest = {
      contrasenaActual: this.contrasenaActual,
      nuevaContrasena: this.nuevaContrasena
    };

    this.usuarioService.cambiarContrasena(request).subscribe({
      next: (response) => {
        alert(response.mensaje);
        this.limpiarContrasenas();
      },
      error: (error) => {
        console.error('Error al cambiar contraseña:', error);

        alert(
          error.error?.mensaje ||
          'No se pudo cambiar la contraseña'
        );
      }
    });
  }

  limpiarContrasenas() {
    this.contrasenaActual = '';
    this.nuevaContrasena = '';
    this.confirmarContrasena = '';
  }
}