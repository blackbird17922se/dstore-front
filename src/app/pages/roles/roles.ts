import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RolModel } from '../../models/rol.model';
import { RolService } from '../../services/rol.service';

@Component({
  selector: 'app-roles',
  imports: [CommonModule, FormsModule],
  templateUrl: './roles.html',
  styleUrls: ['./roles.scss']
})
export class Roles {
  roles: RolModel[] = [];
  isModalOpen = false;
  editing = false;
  rolActual: RolModel = { id: null, nombre: '' };

  constructor(private rolService: RolService) {}

  ngOnInit() {
    this.getRoles();
  }

  getRoles() {
    this.rolService.getAll().subscribe({
      next: (data) => {
        this.roles = data;
      },
      error: (error) => {
        console.error('Error al obtener Roles:', error);
      }
    });
  }

  editRol(rol: RolModel) {
    this.editing = true;
    this.rolActual = { ...rol };
    this.isModalOpen = true;
  }

  saveRol() {
    const action = this.editing
      ? this.rolService.update(this.rolActual)
      : this.rolService.create(this.rolActual);
    action.subscribe({
      next: () => {
        this.getRoles();
        this.closeModal();
      },
      error: (error) => {
        console.error('Error al guardar el rol:', error);
      }
    });
  }

  deleteRol(id: number | null) {
    if (id === null) return;
      if(confirm('¿Estás seguro de que deseas eliminar este rol?')) {
        this.rolService.delete(id).subscribe({
        next: () => {
          this.getRoles();
        },
        error: (error) => {
          console.error('Error al eliminar el rol:', error);
        }
      });
    }
  }

  resetRolActual() {
    this.rolActual = { id: null, nombre: '' };
  }

  openModal() {
    this.editing = false;
    this.resetRolActual();
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }
}
