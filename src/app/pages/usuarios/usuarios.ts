import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RolModel } from '../../models/rol.model';
import { UsuarioModel } from '../../models/usuario.model';
import { RolService } from '../../services/rol.service';
import { UsuarioService } from '../../services/usuario.service';
import { UsuarioResponseModel } from '../../models/usuario/usuario-response.model';
import { UsuarioForm } from '../../models/usuario/usuario-form.model';
import { UsuarioUpdateRequest } from '../../models/usuario/usuario-update-request.model';
import { UsuarioCreateRequest } from '../../models/usuario/usuario-create-request.model';

@Component({
  selector: 'app-usuarios',
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.scss'],
})
export class Usuarios {
  usuarios: UsuarioModel[] = [];
  usuarioResponse: UsuarioResponseModel[] = [];
  roles: RolModel[] = [];

  modalAbierto = false;
  editando = false;
  usuarioActual: UsuarioForm = {
    id: null,
    nombre: '',
    apellido: '',
    nombreUsuario: '',
    contrasena: '',
    idRol: null
  };
  constructor(
    private rolService: RolService, 
    private usuarioService: UsuarioService
  ) {}

  ngOnInit() {
    this.listarUsuarios();
    this.getRoles();
  }

  getRoles(){
    this.rolService.getAll().subscribe({
      next: (data) => {this.roles = data;},
      error: (error) => {console.error('Error al obtener Roles:', error);}
    });
  }

  listarUsuarios() {
    this.usuarioService.listarUsuarios().subscribe({
      next: (data) => {
        this.usuarioResponse = data;
      },
      error: (error) => {
        console.error('Error al obtener Usuarios:', error);
      }
    });
  }


  actualizarUsuario(usuario: UsuarioResponseModel) {

    this.editando = true;

    this.usuarioActual = {
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      nombreUsuario: usuario.nombreUsuario,
      contrasena: '',
      idRol: usuario.idRol
    };
    this.modalAbierto = true;
  }


  guardarUsuario() {

    if (this.usuarioActual.idRol === null) {
      return;
    }

    if (this.editando) {

      if (this.usuarioActual.id === null) {
        return;
      }

      const request: UsuarioUpdateRequest = {
        nombre:this.usuarioActual.nombre.trim(),
        apellido:this.usuarioActual.apellido.trim(),
        nombreUsuario:this.usuarioActual.nombreUsuario.trim(),
        idRol:this.usuarioActual.idRol
      };

      this.usuarioService.actualizarUsuario(this.usuarioActual.id, request)
        .subscribe({

          next: () => {
            this.listarUsuarios();
            this.closeModal();
          },

          error: error => {
            console.error('Error al actualizar usuario:', error);
          }

        });

    } else {

      const request: UsuarioCreateRequest = {
        nombre:this.usuarioActual.nombre.trim(),
        apellido:this.usuarioActual.apellido.trim(),
        nombreUsuario:this.usuarioActual.nombreUsuario.trim(),
        contrasena:this.usuarioActual.contrasena,
        idRol:this.usuarioActual.idRol
      };

      this.usuarioService.crearUsuario(request)
        .subscribe({

          next: () => {
            this.listarUsuarios();
            this.closeModal();
          },

          error: error => {
            console.error('Error al crear usuario:', error);
          }
        });
    }
  }

  cambiarEstadoUsuario(
    usuario: UsuarioResponseModel
  ) {

    const nuevoEstado =
      !usuario.activo;

    const accion =
      nuevoEstado
        ? 'activar'
        : 'desactivar';

    if (
      !confirm(
        `¿Estás seguro de que deseas ${accion} este usuario?`
      )
    ) {
      return;
    }

    this.usuarioService
      .cambiarEstado(
        usuario.id!,
        nuevoEstado
      )
      .subscribe({

        next: () => {
          this.listarUsuarios();
        },

        error: error => {

          console.error(
            'Error al cambiar estado del usuario:',
            error
          );
        }

      });
  }

  resetUsuarioActual() {
    this.usuarioActual = {
      id: null,
      nombre: '',
      apellido: '',
      nombreUsuario: '',
      contrasena: '',
      idRol: null
    };
  }

  openModal() {
    this.editando = false;
    this.resetUsuarioActual();
    this.modalAbierto = true;
  }

  closeModal() {
    this.modalAbierto = false;
  }

}
