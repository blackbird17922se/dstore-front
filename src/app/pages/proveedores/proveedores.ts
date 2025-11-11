import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Proveedor } from '../../models/Proveedor.model';
import { ProveedorService } from '../../services/proveedor.service';

/** Mostrar la información (vista)
Manejar eventos de usuario (clics, formularios, botones) */
@Component({
  selector: 'app-proveedores',
  imports: [CommonModule, FormsModule],
  templateUrl: './proveedores.html',
  styleUrls: ['./proveedores.scss'],
})
export class Proveedores {
  proveedores: Proveedor[] = [];
  modalAbierto = false;
  editando = false;
  proveedorActual: Proveedor = {
    id: null,
    nombre: '',
    telefono: '',
    correo: '',
    direccion: ''
  };

  constructor(private proveedorService: ProveedorService) {}

  ngOnInit() {
    this.getProveedores();
  }

  getProveedores() {
    this.proveedorService.getAll().subscribe({
      next: data => this.proveedores = data,
      error: err => console.error('Error al obtener proveedores:', err)
    });
  }

  abrirModal() {
    this.editando = false;
    this.resetProveedorActual();
    this.modalAbierto = true;
  }

  editarProveedor(proveedor: Proveedor) {
    this.editando = true;
    this.proveedorActual = { ...proveedor };
    this.modalAbierto = true;
  }

  /** .subscribe() ejecuta la petición y recibe la respuesta.
   * No hace falta unsubscribe porque el Observable de HttpClient 
   * completa automáticamente. */
  guardarProveedor() {
    const accion = this.editando
      ? this.proveedorService.update(this.proveedorActual)
      : this.proveedorService.create(this.proveedorActual);

    accion.subscribe({
      next: () => {
        this.getProveedores();
        this.cerrarModal();
      },
      error: err => console.error('Error al guardar proveedor:', err)
    });
  }

  borrarProveedor(id: number | null) {
    if (id === null) return;
    
    if (confirm('¿Seguro que deseas eliminar este proveedor?')) {
      this.proveedorService.delete(id).subscribe({
        next: () => this.getProveedores(),
        error: err => console.error('Error al eliminar proveedor:', err)
      });
    }
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  resetProveedorActual() {
    this.proveedorActual = { id: null, nombre: '', telefono: '', correo: '', direccion: '' };
  }
}
