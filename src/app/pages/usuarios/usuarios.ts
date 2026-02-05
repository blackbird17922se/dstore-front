import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RolModel } from '../../models/rol.model';
import { UsuarioModel } from '../../models/usuario.model';
import { RolService } from '../../services/rol.service';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-usuarios',
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.html',
  styleUrls: ['./usuarios.scss'],
})
export class Usuarios {
  usuarios: UsuarioModel[] = [];
  roles: RolModel[] = [];

  isModalOpen = false;
  editing = false;
  usuarioActual: UsuarioModel = { id: null, nombre: '', apellido: '', nombreUsuario: '', 
    contrasena: '', rol: { id:0 } };

  constructor(
    private rolService: RolService, 
    private usuarioService: UsuarioService
  ) {}

  ngOnInit() {
    this.getusuarios();
    this.getRoles();
  }

  getRoles(){
    this.rolService.getAll().subscribe({
      next: (data) => {this.roles = data;},
      error: (error) => {console.error('Error al obtener Roles:', error);}
    });
  }

  getusuarios() {
    this.usuarioService.getAll().subscribe({
      next: (data) => {
        this.usuarios = data;
      },
      error: (error) => {
        console.error('Error al obtener Usuarios:', error);
      }
    });
  }


  editUsuario(Usuario: UsuarioModel) {
    this.editing = true;
    this.usuarioActual = { ...Usuario };
    this.isModalOpen = true;
  }

  saveUsuario() {
    const action = this.editing
      ? this.usuarioService.update(this.usuarioActual)
      : this.usuarioService.create(this.usuarioActual);
    action.subscribe({
      next: () => {
        this.getusuarios();
        this.closeModal();
      },
      error: (error) => {
        console.error('Error al guardar el usuario:', error);
      }
    });
  }

  deleteUsuario(id: number | null) {
    if (id === null) return;
    if(confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      this.usuarioService.delete(id).subscribe({
        next: () => {
          this.getusuarios();
        },
        error: (error) => {
          console.error('Error al eliminar el usuario:', error);
        }
      });
    }
  }

  resetUsuarioActual() {
    this.usuarioActual = { id: null, nombre: '', apellido: '', nombreUsuario: '', contrasena: '', rol: { id:0 } };
  }

  openModal() {
    this.editing = false;
    this.resetUsuarioActual();
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

}
