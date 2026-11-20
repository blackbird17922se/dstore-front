import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';
import { PerfilUsuarioResponse } from '../../models/usuario/perfil-usuario-response.model';
import { PerfilUsuarioUpdate } from '../../models/usuario/perfil-usuario-update.model';
import { CambiarContrasenaRequest } from '../../models/usuario/cambiar-contrasena.model';

type SeccionPerfil = 'resumen' | 'datos' | 'seguridad' | 'rol' | 'avatar';
type TipoMensaje = 'exito' | 'error' | null;

@Component({
  selector: 'app-mi-perfil',
  imports: [FormsModule],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.scss',
})
export class MiPerfil {

  perfil: PerfilUsuarioResponse | null = null;
  cargandoPerfil = true;
  errorCarga = '';
  seccionActiva: SeccionPerfil = 'resumen';

  nombre = '';
  apellido = '';
  guardandoPerfil = false;
  mensajePerfil = '';
  tipoMensajePerfil: TipoMensaje = null;

  contrasenaActual = '';
  nuevaContrasena = '';
  confirmarContrasena = '';
  guardandoContrasena = false;
  mensajeContrasena = '';
  tipoMensajeContrasena: TipoMensaje = null;

  constructor(
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.cargarPerfil();
  }

  // Se muestran iniciales mientras no exista una imagen personalizada del usuario.
  get inicialesPerfil(): string {
    if (!this.perfil) return 'US';

    const iniciales = [this.perfil.nombre, this.perfil.apellido]
      .map(valor => valor?.trim().charAt(0) ?? '')
      .join('')
      .toUpperCase();

    return iniciales || this.perfil.nombreUsuario.slice(0, 2).toUpperCase();
  }

  abrirSeccion(seccion: SeccionPerfil): void {
    this.seccionActiva = seccion;
    this.mensajePerfil = '';
    this.tipoMensajePerfil = null;
    this.mensajeContrasena = '';
    this.tipoMensajeContrasena = null;
  }

  cargarPerfil(): void {
    this.cargandoPerfil = true;
    this.errorCarga = '';

    this.usuarioService.obtenerPerfil().subscribe({
      next: (data) => {
        this.perfil = data;
        this.nombre = data.nombre;
        this.apellido = data.apellido;
        this.cargandoPerfil = false;
      },
      error: (error) => {
        console.error('Error al obtener perfil:', error);
        this.errorCarga = 'No fue posible cargar la información de la cuenta.';
        this.cargandoPerfil = false;
      }
    });
  }

  hayCambiosPerfil(): boolean {
    return !!this.perfil && (
      this.nombre.trim() !== this.perfil.nombre ||
      this.apellido.trim() !== this.perfil.apellido
    );
  }

  guardarPerfil(): void {
    if (this.guardandoPerfil || !this.hayCambiosPerfil()) return;

    const request: PerfilUsuarioUpdate = {
      nombre: this.nombre.trim(),
      apellido: this.apellido.trim()
    };

    if (!request.nombre || !request.apellido) {
      this.tipoMensajePerfil = 'error';
      this.mensajePerfil = 'El nombre y el apellido son obligatorios.';
      return;
    }

    this.guardandoPerfil = true;
    this.mensajePerfil = '';
    this.tipoMensajePerfil = null;

    this.usuarioService.actualizarPerfil(request).subscribe({
      next: (data) => {
        this.perfil = data;
        this.nombre = data.nombre;
        this.apellido = data.apellido;
        this.guardandoPerfil = false;
        this.tipoMensajePerfil = 'exito';
        this.mensajePerfil = 'Tu información personal se actualizó correctamente.';
      },
      error: (error) => {
        console.error('Error al actualizar perfil:', error);
        this.guardandoPerfil = false;
        this.tipoMensajePerfil = 'error';
        this.mensajePerfil = error?.error?.mensaje || 'No fue posible actualizar el perfil.';
      }
    });
  }

  guardarContrasena(formulario: NgForm): void {
    if (this.guardandoContrasena || formulario.invalid) return;

    if (this.nuevaContrasena !== this.confirmarContrasena) {
      this.tipoMensajeContrasena = 'error';
      this.mensajeContrasena = 'Las nuevas contraseñas no coinciden.';
      return;
    }

    const request: CambiarContrasenaRequest = {
      contrasenaActual: this.contrasenaActual,
      nuevaContrasena: this.nuevaContrasena
    };

    this.guardandoContrasena = true;
    this.mensajeContrasena = '';
    this.tipoMensajeContrasena = null;

    this.usuarioService.cambiarContrasena(request).subscribe({
      next: (response) => {
        this.guardandoContrasena = false;
        this.tipoMensajeContrasena = 'exito';
        this.mensajeContrasena = response.mensaje || 'Contraseña actualizada correctamente.';
        this.limpiarContrasenas();
        formulario.resetForm();
      },
      error: (error) => {
        console.error('Error al cambiar contraseña:', error);
        this.guardandoContrasena = false;
        this.tipoMensajeContrasena = 'error';
        this.mensajeContrasena =
          error?.error?.mensaje || 'No se pudo cambiar la contraseña.';
      }
    });
  }

  limpiarContrasenas(): void {
    this.contrasenaActual = '';
    this.nuevaContrasena = '';
    this.confirmarContrasena = '';
  }
}
